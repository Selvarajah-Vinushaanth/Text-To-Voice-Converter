import axios from 'axios';

export const openaiApi = axios.create({
  baseURL: 'https://api.ttsopenai.com/uapi/v1/text-to-speech',
  headers: {
    'Authorization': `Bearer tts-b4773c262737dcbad6c186d181843832`, // Hardcoded API key
    'Content-Type': 'application/json'
  }
});
