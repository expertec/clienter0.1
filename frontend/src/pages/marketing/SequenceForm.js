import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FaArrowLeft } from "react-icons/fa";
import axios from "axios";
import { auth } from "../../config/firebase"; // Asegúrate de que este archivo exista
import { ReactMediaRecorder } from "react-media-recorder";
import AudioRecorderUI from "../../components/AudioRecorderUI";



const SequenceForm = () => {
  const navigate = useNavigate();

  const [step, setStep] = useState(1); // Controlar los pasos del formulario
  const [sequenceName, setSequenceName] = useState("");
  const [companyId, setCompanyId] = useState(null); // Manejar dinámicamente el companyId
  const [triggers, setTriggers] = useState({
    etiquetas: [],
  });
  const [delay, setDelay] = useState("immediately");
  const [messages, setMessages] = useState([{ type: "text", content: "", delay: 0 }]);
  const [error, setError] = useState("");

  // Agregar nuevas variables de estado para la grabación de audio
  const [recordingIndex, setRecordingIndex] = useState(null);
  const [mediaRecorder, setMediaRecorder] = useState(null);
  const [audioChunks, setAudioChunks] = useState([]);

  // Obtener el companyId al cargar el componente
  useEffect(() => {
    const fetchCompanyId = async () => {
      try {
        const user = auth.currentUser;
        if (user) {
          const token = await user.getIdTokenResult();
          const businessId = token.claims.businessId || user.uid; // Fallback al UID si `businessId` no está definido
          setCompanyId(businessId);
        } else {
          setError("No se ha podido obtener el ID de la empresa. Intenta iniciar sesión de nuevo.");
          navigate("/login");
        }
      } catch (err) {
        console.error("Error al obtener el ID de la empresa:", err);
        setError("Error al obtener el ID de la empresa. Por favor, inicia sesión nuevamente.");
        navigate("/login");
      }
    };

    fetchCompanyId();
  }, [navigate]);

  // Función para manejar el cambio de paso
  const nextStep = () => setStep((prev) => prev + 1);
  const prevStep = () => setStep((prev) => prev - 1);

  // Agregar un nuevo mensaje a la secuencia
  const addMessage = () => {
    if (messages.length >= 5) {
      setError("Solo puedes agregar hasta 5 mensajes por secuencia.");
      return;
    }
    setMessages([...messages, { type: "text", content: "", delay: 1 }]);
  };

  // Función para subir archivos al backend
  const uploadFile = async (file) => {
    const formData = new FormData();
    formData.append("file", file);
  
    try {
      const response = await axios.post("http://localhost:3000/api/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      console.log("URL del archivo subido:", response.data.url);
      return response.data.url; // Retorna la URL del archivo subido
    } catch (error) {
      console.error("Error al subir archivo:", error);
      return null;
    }
  };
  
  

  // Función para manejar la grabación de audio
  const startRecording = async (index) => {
    if (mediaRecorder) {
      mediaRecorder.stop(); // Detener cualquier grabación previa
    }
    setRecordingIndex(index);
    setAudioChunks([]);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream, { mimeType: "audio/mpeg" }); // Cambiar el tipo a "audio/mpeg"
      recorder.ondataavailable = (e) => setAudioChunks((prev) => [...prev, e.data]);
      recorder.onstop = async () => {
        const audioBlob = new Blob(audioChunks, { type: "audio/mpeg" }); // Cambiar el tipo del blob
        const file = new File([audioBlob], `audio_message_${index}.mp3`, { type: "audio/mpeg" }); // Cambiar la extensión a .mp3
        const url = await uploadFile(file);
        if (url) {
          const updatedMessages = [...messages];
          updatedMessages[index].content = url;
          setMessages(updatedMessages);
        }
      };
      recorder.start();
      setMediaRecorder(recorder);
    } catch (err) {
      console.error("Error al acceder al micrófono:", err);
      alert("No se pudo acceder al micrófono. Verifica tus permisos.");
    }
  };
  

  const stopRecording = () => {
    if (mediaRecorder) {
      mediaRecorder.stop();
      setRecordingIndex(null);
    }
  };

  const handleSaveAudio = async (audioBlob, index) => {
    try {
      const file = new File([audioBlob], `audio_message_${Date.now()}.mp3`, { type: "audio/mpeg" });
      console.log("Subiendo audio al servidor...");
  
      // Subir archivo a Firebase Storage y obtener la URL
      const url = await uploadFile(file);
      if (url) {
        console.log("Audio subido:", url);
  
        // Actualizar el mensaje de audio con la URL
        const updatedMessages = [...messages];
        updatedMessages[index].content = url; // Asignar la URL de Firebase
        updatedMessages[index].type = "audio"; // Asegurarse de que el tipo es "audio"
        setMessages(updatedMessages); // Actualiza el estado
      } else {
        console.error("Error: No se pudo obtener la URL del audio subido.");
      }
    } catch (error) {
      console.error("Error al guardar el audio:", error);
    }
  };

  const handleDeleteAudio = (index) => {
    const updatedMessages = [...messages];
    updatedMessages[index].content = null; // Borrar URL de Firestore en el mensaje
    setMessages(updatedMessages);
  
    try {
      // Opcional: Lógica para eliminar el archivo en Firestore si es necesario
      console.log(`Audio en posición ${index} eliminado del mensaje.`);
    } catch (error) {
      console.error("Error al eliminar el audio de la secuencia:", error);
    }
  };
  
  
  

  // Manejar la creación de la secuencia
  const handleSubmit = async (e) => {
    e.preventDefault();
    const validMessages = messages.every((msg) => msg.content); // Validar que cada mensaje tenga contenido
    if (!validMessages) {
      alert("Asegúrate de completar todos los mensajes antes de guardar.");
      return;
    }
  
    const sequenceData = {
      name: sequenceName,
      triggers,
      delay,
      messages,
    };
  
    try {
      await axios.post(`http://localhost:3000/api/sequences/${companyId}/create`, sequenceData);
      console.log("Secuencia guardada con éxito.");
      navigate("/admin/marketing/sequences");
    } catch (err) {
      console.error("Error al guardar la secuencia:", err);
    }
  };
  

  return (
    <div className="p-6 bg-white rounded-lg shadow-lg max-w-6xl mx-auto mt-10">
      {/* Botón para volver */}
      <button
        onClick={() => navigate("/admin/marketing/sequences")}
        className="flex items-center space-x-2 text-secondary hover:text-secondary-dark mb-6"

      >
        <FaArrowLeft />
        <span>Volver a Secuencias</span>
      </button>

      <h2 className="text-3xl font-extrabold text-primary-dark mb-6"
      >Crear Secuencia</h2>

{error && <p className="text-red-500">{error}</p>}


      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Paso 1: A quiénes */}
        {step === 1 && (
          <div className="space-y-4">
            <h3 className="text-xl font-semibold">Paso 1: ¿A quiénes?</h3>
            <div>
              <label className="block text-sm font-medium text-gray-700">Nombre de la Secuencia</label>
              <input
                type="text"
                value={sequenceName}
                onChange={(e) => setSequenceName(e.target.value)}
                placeholder="Ingresa un nombre para la secuencia"
                className="w-full border border-gray-300 rounded-md p-2 mt-1"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Etiquetas</label>
              <input
                type="text"
                placeholder="Ejemplo: Nuevo Cliente, VIP"
                value={triggers.etiquetas}
                onChange={(e) => setTriggers({ etiquetas: e.target.value.split(",") })}
                className="w-full border border-gray-300 rounded-md p-2 mt-1"
              />
            </div>

            <button
              type="button"
              onClick={nextStep}
               className="px-5 py-3 bg-primary text-white rounded-lg shadow hover:bg-secondary transition duration-300"

            >
              Siguiente
            </button>
          </div>
        )}

        {/* Paso 2: Cuándo */}
        {step === 2 && (
          <div className="space-y-4">
            <h3 className="text-xl font-semibold">Paso 2: ¿Cuándo?</h3>
            <label className="block text-sm font-medium text-gray-700">Retraso para activar la secuencia</label>
            <select
              value={delay}
              onChange={(e) => setDelay(e.target.value)}
              className="w-full border border-gray-300 rounded-md p-2"
            >
              <option value="immediately">Inmediatamente</option>
              <option value="1h">1 Hora Después</option>
              <option value="5h">5 Horas Después</option>
              <option value="1d">1 Día Después</option>
            </select>

            <div className="flex justify-between">
              <button
                type="button"
                onClick={prevStep}
                className="px-4 py-2 bg-secondary text-white rounded-md"



              >
                Anterior
              </button>
              <button
                type="button"
                onClick={nextStep}
                className="px-5 py-3 bg-primary text-white rounded-lg shadow hover:bg-secondary transition duration-300"


              >
                Siguiente
              </button>
            </div>
          </div>
        )}

        {/* Paso 3: Mensajes */}
        {step === 3 && (
          <div className="space-y-4">
            <h3 className="text-xl font-semibold">Paso 3: Definir Mensajes</h3>
            {messages.map((message, index) => (
              <div key={index} className="border border-gray-200 rounded-md p-4 mb-4">
                <label className="block text-sm font-medium text-gray-700">Mensaje {index + 1}</label>
                <select
                  value={message.type}
                  onChange={(e) => {
                    const updatedMessages = [...messages];
                    updatedMessages[index].type = e.target.value;
                    setMessages(updatedMessages);
                  }}
                  className="w-full border border-secondary-light rounded-md p-2 mt-1"

                >
                  <option value="text">Texto</option>
                  <option value="image">Imagen</option>
                  <option value="audio">Audio</option>
                  <option value="video">Video</option>
                  <option value="pdf">Archivo PDF</option>
                </select>

                {message.type === "text" && (
                  <textarea
                    value={message.content}
                    onChange={(e) => {
                      const updatedMessages = [...messages];
                      updatedMessages[index].content = e.target.value;
                      setMessages(updatedMessages);
                    }}
                    placeholder="Escribe el contenido del mensaje..."
                    className="w-full border border-secondary-light rounded-md p-2 mt-2"

                  />
                )}

{message.type === "audio" && (
  <div onClick={(e) => e.stopPropagation()}> {/* Evita la propagación del evento */}
    <AudioRecorderUI
  onSave={(audioBlob) => {
    const updatedMessages = [...messages];
    uploadFile(audioBlob).then((url) => {
      updatedMessages[index].content = url;
      setMessages(updatedMessages);
      console.log("Audio guardado:", url);
    });
  }}
  onDelete={() => handleDeleteAudio(index)} // Nuevo prop para eliminar el audio
/>


  </div>
)}





                {/* Otros inputs para multimedia */}
                {["image", "video", "pdf"].includes(message.type) && (
                  <input
                    type="file"
                    accept={
                      message.type === "image"
                        ? "image/*"
                        : message.type === "video"
                        ? "video/*"
                        : ".pdf"
                    }
                    onChange={async (e) => {
                      const file = e.target.files[0];
                      if (!file) return;

                      const url = await uploadFile(file);
                      if (url) {
                        const updatedMessages = [...messages];
                        updatedMessages[index].content = url;
                        setMessages(updatedMessages);
                      }
                    }}
                    className="w-full border border-gray-300 rounded-md p-2 mt-2"
                  />
                )}

                <label className="block text-sm mt-2">Enviar después de:</label>
                <select
                  value={message.delay}
                  onChange={(e) => {
                    const updatedMessages = [...messages];
                    updatedMessages[index].delay = e.target.value;
                    setMessages(updatedMessages);
                  }}
                  className="w-full border border-gray-300 rounded-md p-2 mt-1"
                >
                  <option value="1">1 Hora</option>
                  <option value="5">5 Horas</option>
                  <option value="24">1 Día</option>
                </select>

                <button
                  type="button"
                  className="text-red-500 mt-2"
                  onClick={() => setMessages(messages.filter((_, i) => i !== index))}
                >
                  Eliminar
                </button>
              </div>
            ))}

            <button
              type="button"
              onClick={addMessage}
              className="px-4 py-2 bg-green-500 text-white rounded-md"


            >
              + Agregar Mensaje
            </button>

            <div className="flex justify-between mt-6">
              <button
                type="button"
                onClick={prevStep}
                className="px-4 py-2 bg-secondary text-white rounded-md"


              >
                Anterior
              </button>
              <button
                type="submit"
                className="px-5 py-3 bg-primary text-white rounded-lg shadow hover:bg-secondary transition duration-300"

              >
                Guardar Secuencia
              </button>
            </div>
          </div>
        )}
      </form>
    </div>
  );
};

export default SequenceForm;
