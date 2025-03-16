export const initializeGoogleApi = async () => {
  await new Promise((resolve) => {
    gapi.load('client:auth2', async () => {
      await gapi.auth2.init({
        client_id: process.env.GOOGLE_CLOUD_CLIENT_ID
      });
      resolve(true);
    });
  });
};

export const googleTTS = {
  authenticate: async () => {
    try {
      await gapi.auth2.getAuthInstance().signIn({
        scope: "https://www.googleapis.com/auth/cloud-platform"
      });
      gapi.client.setApiKey(process.env.GOOGLE_CLOUD_API_KEY);
      await gapi.client.load("https://texttospeech.googleapis.com/$discovery/rest?version=v1");
      return true;
    } catch (error) {
      console.error("Authentication error:", error);
      throw error;
    }
  },

  listVoices: async () => {
    try {
      const response = await gapi.client.texttospeech.voices.list({});
      return response.result.voices;
    } catch (error) {
      console.error("List voices error:", error);
      throw error;
    }
  }
};
