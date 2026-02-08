import asyncio
import base64
import json
import logging
import os
import queue
import random
import tempfile
import threading
import time
import wave
from pathlib import Path
from typing import Optional

import pyaudio
import scipy.io.wavfile
import sounddevice as sd

from cozepy import (
    AsyncCoze,
    AsyncTokenAuth,
    AsyncWebsocketsAudioTranscriptionsClient,
    AsyncWebsocketsAudioTranscriptionsEventHandler,
    AsyncWebsocketsChatClient,
    AsyncWebsocketsChatEventHandler,
    AudioFormat,
    ChatEventType,
    ChatUpdateEvent,
    Coze,
    ConversationAudioDeltaEvent,
    ConversationChatCompletedEvent,
    ConversationChatCanceledEvent,
    InputAudio,
    InputAudioBufferAppendEvent,
    InputAudioBufferCompletedEvent,
    Message,
    MessageObjectString,
    TranscriptionsMessageUpdateEvent,
    TokenAuth,
)
from cozepy.util import write_pcm_to_wav_file
from .config import get_coze_api_base, get_coze_api_token, get_bot_id, AUDIO_SAMPLE_RATE, AUDIO_CHANNELS, AUDIO_FORMAT, AUDIO_CHUNK_SIZE


class AudioTranscriptionService:
    """Service for handling audio transcription using WebSockets."""

    def __init__(self):
        """Initialize the audio transcription service."""
        self.coze = AsyncCoze(
            auth=AsyncTokenAuth(get_coze_api_token()),
            base_url=get_coze_api_base(),
        )

    async def transcribe_audio_stream(self, audio_stream):
        """Transcribe audio stream in real-time."""
        class TranscriptionEventHandler(AsyncWebsocketsAudioTranscriptionsEventHandler):
            def __init__(self):
                self.transcript = ""

            async def on_transcriptions_message_update(
                self, cli: AsyncWebsocketsAudioTranscriptionsClient, event: TranscriptionsMessageUpdateEvent
            ):
                self.transcript += event.data.content
                print(f"[Transcription] {event.data.content}")

            async def on_input_audio_buffer_completed(
                self, cli: AsyncWebsocketsAudioTranscriptionsClient, event: InputAudioBufferCompletedEvent
            ):
                print("[Transcription] Audio buffer completed")

        transcriptions = self.coze.websockets.audio.transcriptions.create(
            on_event=TranscriptionEventHandler(),
        )

        async with transcriptions() as client:
            # Send audio data
            async for delta in audio_stream:
                await client.input_audio_buffer_append(
                    InputAudioBufferAppendEvent.Data.model_validate({"delta": delta})
                )
            await client.input_audio_buffer_complete()
            await client.wait()


class SimpleAudioChatService:
    """Service for simple audio chat functionality."""

    def __init__(self):
        """Initialize the simple audio chat service."""
        self.coze = Coze(
            auth=TokenAuth(token=get_coze_api_token()),
            base_url=get_coze_api_base(),
        )
        self.bot_id = get_bot_id()
        self.user_id = "customer_service_user"

    def chat_with_audio_file(self, audio_file_path: str) -> tuple[str, str]:
        """
        Chat with an audio file and get text and audio response.
        
        Args:
            audio_file_path: Path to the audio file
            
        Returns:
            Tuple of (text_response, audio_file_path)
        """
        # Upload audio file
        audio_file = self.coze.files.upload(file=Path(audio_file_path))
        
        # Chat with audio
        pcm_datas = b""
        text_response = ""
        
        for event in self.coze.chat.stream(
            bot_id=self.bot_id,
            user_id=self.user_id,
            additional_messages=[
                Message.build_user_question_objects(
                    [
                        MessageObjectString.build_audio(file_id=audio_file.id),
                    ]
                ),
            ],
        ):
            if event.event == ChatEventType.CONVERSATION_MESSAGE_DELTA:
                text_response += event.message.content
                print(event.message.content, end="", flush=True)
            elif event.event == ChatEventType.CONVERSATION_AUDIO_DELTA:
                pcm_datas += base64.b64decode(event.message.content)
        
        # Save audio response
        _, wav_audio_path = tempfile.mkstemp(suffix=".wav")
        write_pcm_to_wav_file(pcm_datas, wav_audio_path)
        
        return text_response, wav_audio_path


class OneToOneAudioChatService:
    """Service for one-to-one audio chat functionality."""

    def __init__(self):
        """Initialize the one-to-one audio chat service."""
        self.coze = Coze(
            auth=TokenAuth(token=get_coze_api_token()),
            base_url=get_coze_api_base(),
        )
        self.bot_id = get_bot_id()
        self.user_id = "customer_service_user"
        self.p = pyaudio.PyAudio()

    def select_input_device(self) -> int:
        """Select an input device from available devices."""
        # List available input devices
        info = self.p.get_host_api_info_by_index(0)
        numdevices = info.get("deviceCount")

        print("\nAvailable input devices:")
        input_devices = []
        for i in range(0, numdevices):
            if (self.p.get_device_info_by_host_api_device_index(0, i).get("maxInputChannels")) > 0:
                device_info = self.p.get_device_info_by_host_api_device_index(0, i)
                print(f"Device {len(input_devices)}: {device_info.get('name')}")
                input_devices.append(i)

        # For simplicity, return the first available device
        # In a real implementation, you would let the user choose
        return input_devices[0] if input_devices else 0

    def record_audio(self, input_device_index: int, duration: int = 5) -> str:
        """Record audio from microphone and save to file."""
        CHUNK = 1024
        FORMAT = pyaudio.paInt16
        CHANNELS = 1
        RATE = 16000

        print("Recording... Please speak.")
        
        stream = self.p.open(
            format=FORMAT,
            channels=CHANNELS,
            rate=RATE,
            input=True,
            input_device_index=input_device_index,
            frames_per_buffer=CHUNK,
        )

        frames = []
        
        # Record for specified duration
        for _ in range(0, int(RATE / CHUNK * duration)):
            data = stream.read(CHUNK, exception_on_overflow=False)
            frames.append(data)

        print("Recording completed")
        
        stream.stop_stream()
        stream.close()

        # Save recording
        _, audio_path = tempfile.mkstemp(suffix=".wav")
        wf = wave.open(audio_path, "wb")
        wf.setnchannels(CHANNELS)
        wf.setsampwidth(self.p.get_sample_size(FORMAT))
        wf.setframerate(RATE)
        wf.writeframes(b"".join(frames))
        wf.close()

        return audio_path

    def create_conversation(self) -> str:
        """Create a conversation."""
        return self.coze.chat.create(bot_id=self.bot_id, user_id=self.user_id).conversation_id

    def chat_with_recorded_audio(self, audio_file_path: str, conversation_id: str) -> str:
        """Chat with recorded audio file."""
        # Upload audio file
        audio_file = self.coze.files.upload(file=Path(audio_file_path))
        
        pcm_datas = b""
        text_response = ""
        print("AI Response: ", end="", flush=True)
        
        for event in self.coze.chat.stream(
            bot_id=self.bot_id,
            user_id=self.user_id,
            conversation_id=conversation_id,
            additional_messages=[
                Message.build_user_question_objects(
                    [
                        MessageObjectString.build_audio(file_id=audio_file.id),
                    ]
                ),
            ],
        ):
            if event.event == ChatEventType.CONVERSATION_MESSAGE_DELTA:
                text_response += event.message.content
                print(event.message.content, end="", flush=True)
            elif event.event == ChatEventType.CONVERSATION_AUDIO_DELTA:
                pcm_datas += base64.b64decode(event.message.content)

        print()  # New line after response
        
        # Save audio response
        _, wav_audio_path = tempfile.mkstemp(suffix=".wav")
        write_pcm_to_wav_file(pcm_datas, wav_audio_path)
        
        return wav_audio_path

    def play_audio_response(self, wav_audio_path: str):
        """Play the audio response."""
        try:
            fs, data = scipy.io.wavfile.read(wav_audio_path)
            sd.play(data, fs)
            sd.wait()  # Wait until the audio finishes playing
            print("Audio response played")
        except Exception as e:
            print(f"Error playing audio: {e}")

    def close(self):
        """Clean up resources."""
        if self.p:
            self.p.terminate()


# Enhanced Audio Service with all advanced features
class EnhancedAudioService:
    """Enhanced service combining all audio functionalities."""

    def __init__(self):
        """Initialize all audio services."""
        self.transcription_service = AudioTranscriptionService()
        self.simple_audio_service = SimpleAudioChatService()
        self.one_to_one_service = OneToOneAudioChatService()
        
        # Audio parameters
        self.chunk = AUDIO_CHUNK_SIZE
        self.format = pyaudio.paInt16
        self.channels = AUDIO_CHANNELS
        self.rate = AUDIO_SAMPLE_RATE
        self.input_block_time = 0.05  # 50ms per block
        
        # PyAudio instance
        self.p = pyaudio.PyAudio()
        
        # Recording state
        self.recording = False
        self.stream: Optional[pyaudio.Stream] = None
        self.audio_queue = queue.Queue()
        
        # Playback state
        self.playback_queue = queue.Queue()
        self.is_playing = False
        self.playback_stream = None
        
        # Coze client
        self.coze = AsyncCoze(
            auth=AsyncTokenAuth(get_coze_api_token()),
            base_url=get_coze_api_base(),
        )
        self.bot_id = get_bot_id()
        
        # Event loop
        self.loop = asyncio.new_event_loop()
        self.chat_client: Optional[AsyncWebsocketsChatClient] = None
        
        # Start async loop in a separate thread
        threading.Thread(target=self._run_async_loop, daemon=True).start()
        
        # Start playback thread
        threading.Thread(target=self._playback_loop, daemon=True).start()

    def _run_async_loop(self):
        """Run the asyncio event loop in a separate thread."""
        asyncio.set_event_loop(self.loop)
        self.loop.run_forever()

    def start_recording(self):
        """Start recording audio from microphone."""
        try:
            self.recording = True
            
            # Calculate input buffer size
            input_frames_per_block = int(self.rate * self.input_block_time)
            
            # Open audio stream
            self.stream = self.p.open(
                format=self.format,
                channels=self.channels,
                rate=self.rate,
                input=True,
                frames_per_buffer=input_frames_per_block,
                stream_callback=self._audio_callback,
            )
            
            # Start WebSocket connection
            self.loop.call_soon_threadsafe(self._start_websocket_connection)
            
        except Exception as e:
            print(f"Error starting recording: {e}")
            self.recording = False

    def stop_recording(self):
        """Stop recording audio."""
        try:
            self.recording = False
            if self.stream is not None and self.stream.is_active():
                self.stream.stop_stream()
                self.stream.close()
            self.stream = None
        except Exception as e:
            print(f"Error stopping recording: {e}")
        finally:
            self.stream = None

    def _audio_callback(self, in_data, frame_count, time_info, status):
        """Callback function for audio stream."""
        if self.recording:
            try:
                self.audio_queue.put(in_data)
            except Exception as e:
                print(f"Error in audio callback: {e}")
        return (None, pyaudio.paContinue)

    def _start_websocket_connection(self):
        """Start WebSocket connection for audio chat."""
        async def start():
            class ChatEventHandler(AsyncWebsocketsChatEventHandler):
                def __init__(self, service):
                    self.service = service
                    self.is_first_audio = True
                    self.response_audio = []

                async def on_conversation_audio_delta(
                    self, cli: AsyncWebsocketsChatClient, event: ConversationAudioDeltaEvent
                ):
                    try:
                        audio_data = event.data.get_audio()
                        if audio_data:
                            # Add to response audio
                            self.response_audio.append(audio_data)
                            
                            # Start playing if this is the first audio chunk
                            if self.is_first_audio:
                                self.is_first_audio = False
                                self.service.is_playing = True
                            
                            # Put audio data in playback queue
                            self.service.playback_queue.put(audio_data)
                    except Exception as e:
                        print(f"Error handling audio delta: {e}")

                async def on_conversation_chat_completed(
                    self, cli: AsyncWebsocketsChatClient, event: ConversationChatCompletedEvent
                ):
                    try:
                        # Mark playback as complete
                        self.service.playback_queue.put(None)
                        
                        # Save audio to file for debugging
                        if self.response_audio:
                            write_pcm_to_wav_file(b"".join(self.response_audio), "enhanced_response_output.wav")
                    except Exception as e:
                        print(f"Error handling chat completion: {e}")

                async def on_conversation_chat_canceled(
                    self, cli: AsyncWebsocketsChatClient, event: ConversationChatCanceledEvent
                ):
                    try:
                        print("Chat was interrupted")
                    except Exception as e:
                        print(f"Error handling chat cancellation: {e}")

            self.chat_client = self.coze.websockets.chat.create(
                bot_id=self.bot_id,
                on_event=ChatEventHandler(self),
            )

            async with self.chat_client() as client:
                # Configure audio settings
                await client.chat_update(
                    ChatUpdateEvent.Data.model_validate(
                        {
                            "input_audio": InputAudio.model_validate(
                                {
                                    "format": AUDIO_FORMAT,
                                    "sample_rate": self.rate,
                                    "channel": self.channels,
                                    "bit_depth": 16,
                                    "codec": "pcm",
                                }
                            ),
                        }
                    )
                )
                
                # Send audio data as it comes in
                while self.chat_client:
                    if not self.audio_queue.empty():
                        audio_data = self.audio_queue.get()
                        await client.input_audio_buffer_append(
                            InputAudioBufferAppendEvent.Data.model_validate(
                                {
                                    "delta": audio_data,
                                }
                            )
                        )
                    await asyncio.sleep(0.1)

        asyncio.run_coroutine_threadsafe(start(), self.loop)

    def _playback_loop(self):
        """Loop for playing back audio responses."""
        while True:
            try:
                if self.is_playing:
                    # Get audio data from queue
                    audio_data = self.playback_queue.get()

                    # None means playback is complete
                    if audio_data is None:
                        if self.playback_stream:
                            self.playback_stream.stop_stream()
                            self.playback_stream.close()
                            self.playback_stream = None
                        self.is_playing = False
                        continue

                    # Create playback stream if needed
                    if not self.playback_stream:
                        self.playback_stream = self.p.open(
                            format=self.format,
                            channels=self.channels,
                            rate=self.rate,
                            output=True,
                            frames_per_buffer=self.chunk
                        )

                    # Play audio data
                    self.playback_stream.write(audio_data)

            except Exception as e:
                print(f"Error in playback loop: {e}")
                self.is_playing = False
                if self.playback_stream:
                    try:
                        self.playback_stream.stop_stream()
                        self.playback_stream.close()
                    except:
                        pass
                    self.playback_stream = None

            time.sleep(0.001)  # Small delay to prevent CPU overload

    def close(self):
        """Clean up resources."""
        # Stop recording
        self.stop_recording()
        
        # Stop playback
        self.is_playing = False
        if self.playback_stream:
            self.playback_stream.stop_stream()
            self.playback_stream.close()
        
        # Close PyAudio
        if self.p:
            self.p.terminate()
            
        # Close one-to-one service
        self.one_to_one_service.close()