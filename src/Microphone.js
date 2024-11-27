import React, { useState, useRef } from "react";
import { sendToDeepgram } from "./deepgramService";

function Microphone() {
  const [isRecording, setIsRecording] = useState(false);
  const [transcription, setTranscription] = useState("Live Transcription will appear here...");
  const [pastTranscriptions, setPastTranscriptions] = useState([]);
  const [error, setError] = useState("");
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);

  const handleStartRecording = async () => {
    setError("");
    setTranscription("Listening...");
    setIsRecording(true);
    audioChunksRef.current = [];

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.start();
    } catch (err) {
      setError("Failed to access the microphone. Please grant permissions.");
      console.error(err);
    }
  };

  const handleStopRecording = async () => {
    setIsRecording(false);
    mediaRecorderRef.current.stop();

    mediaRecorderRef.current.onstop = async () => {
      const audioBlob = new Blob(audioChunksRef.current, { type: "audio/webm" });
      try {
        const text = await sendToDeepgram(audioBlob);
        setPastTranscriptions((prev) => [text, ...prev]);
        setTranscription(text || "No transcription found.");
      } catch (err) {
        setError(`Transcription failed: ${err.message}`);
      }
    };
  };

  return (
    <div className="microphone">
      <button onClick={isRecording ? handleStopRecording : handleStartRecording}>
        {isRecording ? "Stop Recording" : "Start Recording"}
      </button>
      {error && <p className="error">{error}</p>}
      <div className="transcription">
        <h3>Live Transcription:</h3>
        <p>{transcription}</p>
        <h3>Past Transcriptions:</h3>
        <ul>
          {pastTranscriptions.map((text, index) => (
            <li key={index}>{text}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default Microphone;
