import logging
import os
from pathlib import Path

from cozepy import (
    COZE_CN_BASE_URL,
    Coze,
    TokenAuth,
    setup_logging,
)


class AudioHttpService:
    """Service for handling HTTP-based audio operations."""

    def __init__(self):
        """Initialize the audio HTTP service."""
        self.coze = Coze(
            auth=TokenAuth(token=self._get_coze_api_token()),
            base_url=self._get_coze_api_base(),
        )

    def _get_coze_api_base(self) -> str:
        """Get the Coze API base URL."""
        coze_api_base = os.getenv("COZE_API_BASE")
        if coze_api_base:
            return coze_api_base
        return COZE_CN_BASE_URL  # default

    def _get_coze_api_token(self) -> str:
        """Get the Coze API token from environment variables."""
        coze_api_token = os.getenv("COZE_API_TOKEN")
        if not coze_api_token:
            raise ValueError("COZE_API_TOKEN environment variable is required")
        return coze_api_token

    def list_voices(self) -> list:
        """
        List available voices for text-to-speech.
        
        Returns:
            List of available voices
        """
        voices = self.coze.audio.voices.list()
        
        voice_list = []
        for voice in voices.items:
            voice_data = {
                "voice_id": voice.voice_id,
                "name": voice.name,
                "language_code": voice.language_code,
                "language_name": voice.language_name,
                "preview_text": voice.preview_text,
                "preview_audio": voice.preview_audio
            }
            voice_list.append(voice_data)
            print(f"Voice: {voice.voice_id} - {voice.name} ({voice.language_name})")
        
        return voice_list

    def get_voice_id(self, preferred_voice_name: str = None) -> str:
        """
        Get a voice ID, either from environment variable or by selecting one.
        
        Args:
            preferred_voice_name: Preferred voice name to search for
            
        Returns:
            Voice ID
        """
        # Check if voice ID is specified in environment
        if os.getenv("COZE_VOICE_ID"):
            return os.getenv("COZE_VOICE_ID")
            
        # List available voices
        voices = self.coze.audio.voices.list()
        
        # If preferred voice name is specified, try to find it
        if preferred_voice_name:
            for voice in voices.items:
                if preferred_voice_name.lower() in voice.name.lower():
                    print(f"Found preferred voice: {voice.voice_id} - {voice.name}")
                    return voice.voice_id
        
        # Return the last voice in the list as default
        if voices.items:
            selected_voice = voices.items[-1]
            print(f"Selected default voice: {selected_voice.voice_id} - {selected_voice.name}")
            return selected_voice.voice_id
        
        # If no voices available, raise an error
        raise ValueError("No voices available")

    def create_speech_from_text(self, text: str, voice_id: str = None, output_format: str = "mp3", 
                               sample_rate: int = 24000, speed: float = 1.0, 
                               output_directory: str = None) -> str:
        """
        Convert text to speech audio file.
        
        Args:
            text: Text to convert to speech
            voice_id: Voice ID to use (optional, will auto-select if not provided)
            output_format: Output format (mp3, wav, etc.)
            sample_rate: Sample rate for the audio
            speed: Speed of speech (0.5-2.0)
            output_directory: Directory to save the output file (optional)
            
        Returns:
            Path to the generated audio file
        """
        # Get voice ID if not provided
        if not voice_id:
            voice_id = self.get_voice_id()
        
        # Create speech using the Coze API
        speech_file = self.coze.audio.speech.create(
            input=text,
            voice_id=voice_id,
            response_format=output_format,
            sample_rate=sample_rate,
            speed=speed
        )
        
        # Determine output file path
        if output_directory:
            # Use specified directory
            file_path = os.path.join(output_directory, f"coze_{voice_id}_speech.{output_format}")
        else:
            # Use Downloads directory
            file_path = os.path.join(os.path.expanduser("~"), "Downloads", f"coze_{voice_id}_speech.{output_format}")
        
        # Ensure the directory exists
        os.makedirs(os.path.dirname(file_path), exist_ok=True)
        
        # Write the speech file
        speech_file.write_to_file(file_path)
        print(f"Created speech with voice {voice_id} saved to: {file_path}")
        
        return file_path

    def create_speech_with_custom_settings(self, text: str, voice_name: str = None, 
                                          language: str = "zh-CN", gender: str = "female",
                                          output_format: str = "mp3", sample_rate: int = 24000,
                                          speed: float = 1.0, output_directory: str = None) -> str:
        """
        Convert text to speech with custom settings.
        
        Args:
            text: Text to convert to speech
            voice_name: Preferred voice name (optional)
            language: Language code (e.g., "zh-CN", "en-US")
            gender: Voice gender ("male" or "female")
            output_format: Output format (mp3, wav, etc.)
            sample_rate: Sample rate for the audio
            speed: Speed of speech (0.5-2.0)
            output_directory: Directory to save the output file (optional)
            
        Returns:
            Path to the generated audio file
        """
        # Find a suitable voice based on preferences
        voice_id = self._find_voice_by_preferences(language, gender, voice_name)
        
        # Create speech
        return self.create_speech_from_text(
            text=text,
            voice_id=voice_id,
            output_format=output_format,
            sample_rate=sample_rate,
            speed=speed,
            output_directory=output_directory
        )

    def _find_voice_by_preferences(self, language: str = "zh-CN", gender: str = "female", 
                                  voice_name: str = None) -> str:
        """
        Find a voice based on language, gender, and name preferences.
        
        Args:
            language: Language code (e.g., "zh-CN", "en-US")
            gender: Voice gender ("male" or "female")
            voice_name: Preferred voice name (optional)
            
        Returns:
            Voice ID
        """
        voices = self.coze.audio.voices.list()
        
        # Filter voices by language
        filtered_voices = [v for v in voices.items if v.language_code.lower() == language.lower()]
        
        # If no voices found for language, use all voices
        if not filtered_voices:
            filtered_voices = voices.items
            print(f"No voices found for language {language}, using all available voices")
        
        # If voice name is specified, try to find it
        if voice_name:
            for voice in filtered_voices:
                if voice_name.lower() in voice.name.lower():
                    return voice.voice_id
        
        # Filter by gender if specified
        if gender:
            gender_filtered = [v for v in filtered_voices if gender.lower() in v.name.lower()]
            if gender_filtered:
                filtered_voices = gender_filtered
        
        # Return the first voice in the filtered list, or the last voice if list is empty
        if filtered_voices:
            selected_voice = filtered_voices[0]
        else:
            selected_voice = voices.items[-1]
            
        print(f"Selected voice: {selected_voice.voice_id} - {selected_voice.name}")
        return selected_voice.voice_id

    def batch_create_speech(self, texts: list, voice_id: str = None, output_format: str = "mp3",
                           sample_rate: int = 24000, speed: float = 1.0,
                           output_directory: str = None) -> list:
        """
        Convert multiple texts to speech audio files.
        
        Args:
            texts: List of texts to convert to speech
            voice_id: Voice ID to use (optional, will auto-select if not provided)
            output_format: Output format (mp3, wav, etc.)
            sample_rate: Sample rate for the audio
            speed: Speed of speech (0.5-2.0)
            output_directory: Directory to save the output files (optional)
            
        Returns:
            List of paths to the generated audio files
        """
        # Get voice ID if not provided
        if not voice_id:
            voice_id = self.get_voice_id()
        
        file_paths = []
        
        for i, text in enumerate(texts):
            # Create speech for each text
            speech_file = self.coze.audio.speech.create(
                input=text,
                voice_id=voice_id,
                response_format=output_format,
                sample_rate=sample_rate,
                speed=speed
            )
            
            # Determine output file path
            if output_directory:
                file_path = os.path.join(output_directory, f"coze_{voice_id}_speech_{i}.{output_format}")
            else:
                file_path = os.path.join(os.path.expanduser("~"), "Downloads", f"coze_{voice_id}_speech_{i}.{output_format}")
            
            # Ensure the directory exists
            os.makedirs(os.path.dirname(file_path), exist_ok=True)
            
            # Write the speech file
            speech_file.write_to_file(file_path)
            print(f"Created speech {i+1}/{len(texts)} with voice {voice_id} saved to: {file_path}")
            
            file_paths.append(file_path)
        
        return file_paths

    def create_speech_preview(self, text: str = None) -> str:
        """
        Create a preview speech file using a default voice.
        
        Args:
            text: Text to convert (uses default if not provided)
            
        Returns:
            Path to the generated audio file
        """
        if not text:
            text = "This is a preview of text-to-speech conversion using Coze API."
        
        # Get a voice ID
        voice_id = self.get_voice_id()
        
        # Create speech
        return self.create_speech_from_text(text, voice_id)