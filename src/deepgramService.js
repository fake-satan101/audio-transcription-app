export async function sendToDeepgram(audioBlob) {
  const API_URL = "https://api.deepgram.com/v1/listen";
  const API_KEY = "3509406ec2f50c26e11f3e1da04061da18533d5e"; // Replace with your actual API key

  const formData = new FormData();
  formData.append("audio", audioBlob);

  try {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: {
        Authorization: `Token ${API_KEY}`,
      },
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.err_msg || "Failed to transcribe audio");
    }

    const data = await response.json();
    return data.results.channels[0].alternatives[0].transcript;
  } catch (error) {
    console.error("Deepgram API Error:", error);
    throw new Error("Unable to transcribe the audio.");
  }
}
