import React, { useState, useEffect } from "react";
import { FaMicrophone, FaTrash, FaCheck } from "react-icons/fa";
import WaveSurfer from "wavesurfer.js";

const AudioRecorderUI = ({ onSave }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [duration, setDuration] = useState(0);
  const [audioBlob, setAudioBlob] = useState(null);
  const [mediaRecorder, setMediaRecorder] = useState(null);
  const [audioUrl, setAudioUrl] = useState(null);
  const [savedAudios, setSavedAudios] = useState([]);
  const [message, setMessage] = useState("");
  const [allowNewRecording, setAllowNewRecording] = useState(true); // Control para permitir nueva grabación

  const waveformRef = React.useRef(null);
  const waveSurferInstance = React.useRef(null);

  useEffect(() => {
    let timer;
    if (isRecording) {
      timer = setInterval(() => setDuration((prev) => prev + 1), 1000);
    } else {
      clearInterval(timer);
    }
    return () => clearInterval(timer);
  }, [isRecording]);

  useEffect(() => {
    if (waveformRef.current && !waveSurferInstance.current) {
      waveSurferInstance.current = WaveSurfer.create({
        container: waveformRef.current,
        waveColor: "#d9dcff",
        progressColor: "#4a56e2",
        cursorColor: "transparent",
        barWidth: 2,
        height: 80,
        responsive: true,
      });
    }
    return () => waveSurferInstance.current?.destroy();
  }, []);

  const startRecording = async () => {
    if (!allowNewRecording) {
      setMessage("Debes finalizar o eliminar el audio antes de grabar uno nuevo.");
      return;
    }
    setIsRecording(true);
    setAudioBlob(null);
    setMessage("");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      const audioChunks = [];

      recorder.ondataavailable = (e) => {
        audioChunks.push(e.data);
      };

      recorder.onstop = () => {
        const blob = new Blob(audioChunks, { type: "audio/mpeg" });
        const url = URL.createObjectURL(blob);
        setAudioUrl(url);
        setAudioBlob(blob);
        waveSurferInstance.current.load(url);
        setAllowNewRecording(false); // Evitar nueva grabación hasta que se elimine o guarde
      };

      recorder.start();
      setMediaRecorder(recorder);
    } catch (error) {
      console.error("Error al acceder al micrófono:", error);
      setMessage("No se pudo acceder al micrófono. Verifica tus permisos.");
      setIsRecording(false);
    }
  };

  const stopRecording = () => {
    mediaRecorder?.stop();
    setIsRecording(false);
    setDuration(0);
  };

  const discardRecording = () => {
    setIsRecording(false);
    setAudioBlob(null);
    setAudioUrl(null);
    setDuration(0);
    waveSurferInstance.current?.empty();
    setAllowNewRecording(true); // Permitir nueva grabación tras descartar
    setMessage("La grabación fue descartada.");
  };

  const saveAudio = () => {
    if (audioBlob) {
      onSave(audioBlob);
      setSavedAudios((prev) => [...prev, { url: audioUrl, blob: audioBlob }]);
      setMessage("¡Audio enviado y guardado!");
      setAudioBlob(null);
      setAudioUrl(null);
      setAllowNewRecording(true); // Permitir nueva grabación tras guardar
    } else {
      setMessage("Graba un audio antes de enviarlo.");
    }
  };

  const deleteAudio = (index) => {
    setSavedAudios((prev) => prev.filter((_, i) => i !== index));
    setMessage("Audio eliminado.");
    setAllowNewRecording(true); // Permitir nueva grabación tras eliminar
  };

  return (
    <div className="audio-recorder bg-gray-100 p-4 rounded shadow-md text-center">
      <div className="flex justify-center">
        {!isRecording ? (
          <button
            onClick={startRecording}
            className={`bg-green-500 p-6 rounded-full hover:bg-green-600 transition-all flex items-center justify-center ${
              !allowNewRecording ? "opacity-50 cursor-not-allowed" : ""
            }`}
            disabled={!allowNewRecording}
          >
            <FaMicrophone className="text-white text-4xl" />
          </button>
        ) : (
          <button
            onClick={stopRecording}
            className="bg-red-500 p-6 rounded-full hover:bg-red-600 transition-all flex items-center justify-center"
          >
            <FaCheck className="text-white text-4xl" />
          </button>
        )}
      </div>

      <div className="mt-4 text-lg font-semibold">
        {isRecording
          ? `Grabando: ${Math.floor(duration / 60)
              .toString()
              .padStart(2, "0")}:${(duration % 60).toString().padStart(2, "0")}`
          : audioBlob
          ? "Grabación lista"
          : ""}
      </div>

      <div className="mt-4">
        <div ref={waveformRef} className="w-full bg-gray-200 rounded"></div>
      </div>

      {audioUrl && (
        <div className="mt-4">
          <audio controls src={audioUrl} className="w-full"></audio>
          <div className="flex justify-center gap-4 mt-4">
            <button
              onClick={saveAudio}
              className="bg-blue-500 p-4 rounded-full hover:bg-blue-600 text-white flex items-center justify-center"
            >
              <FaCheck className="text-white text-3xl" />
            </button>
            <button
              onClick={discardRecording}
              className="bg-gray-500 p-4 rounded-full hover:bg-gray-600 text-white flex items-center justify-center"
            >
              <FaTrash className="text-white text-3xl" />
            </button>
          </div>
        </div>
      )}

      {message && <p className="mt-4 text-blue-500">{message}</p>}

      {/* Lista de audios enviados con opción de eliminar */}
      {savedAudios.length > 0 && (
        <div className="mt-6">
          <h3 className="text-lg font-semibold">Audios enviados:</h3>
          <ul className="mt-2">
            {savedAudios.map((audio, index) => (
              <li key={index} className="bg-white p-2 rounded shadow mt-2 flex items-center justify-between">
                <audio controls src={audio.url} className="w-full"></audio>
                <button
                  onClick={() => deleteAudio(index)}
                  className="ml-4 bg-red-500 p-2 rounded-full hover:bg-red-600 text-white"
                >
                  <FaTrash />
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default AudioRecorderUI;
