const EDEN_AI_API_KEY = process.env.EDEN_AI_API_KEY;

export const edenAI = {
  textToSpeech: async (text: string, voice: string) => {
    const response = await fetch('https://api.edenai.run/v2/audio/text_to_speech', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${EDEN_AI_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        providers: "amazon",
        language: "en-US",
        text: text,
        option: voice
      })
    });

    if (!response.ok) {
      throw new Error('Eden AI API request failed');
    }

    return response.json();
  },

  chat: async (text: string) => {
    const response = await fetch('https://api.edenai.run/v2/llm/chat', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${EDEN_AI_API_KEY}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({
        logprobs: false,
        n: 1,
        stream: false,
        top_p: 1,
        
      })
    });

    if (!response.ok) {
      throw new Error('Eden AI Chat API request failed');
    }

    return response.json();
  }
};
