import asyncio
import logging
import os
import queue
import threading
import time
from typing import Optional

import pyaudio

from cozepy import (
    AsyncCoze,
    AsyncTokenAuth,
    AsyncWebsocketsChatClient,
    AsyncWebsocketsChatEventHandler,
    ChatUpdateEvent,
    ConversationAudioDeltaEvent,
    ConversationChatCompletedEvent,
    ConversationChatCanceledEvent,
    InputAudio,
    InputAudioBufferAppendEvent,
)
from cozepy.util import write_pcm_to_wav_file
from .config import get_coze_api_base, get_coze_api_token, get_bot_id, AUDIO_SAMPLE_RATE, AUDIO_CHANNELS, AUDIO_FORMAT, AUDIO_CHUNK_SIZE


class AudioService:
    """Service for handling audio recognition and synthesis."""

    def __init__(self):
        """Initialize the audio service."""
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
                            write_pcm_to_wav_file(b"".join(self.response_audio), "response_output.wav")
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