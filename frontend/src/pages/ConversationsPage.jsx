import { useState, useEffect } from "react";
import { getFirestore, doc, onSnapshot } from "firebase/firestore";
import { auth } from "../config/firebase";

const db = getFirestore();

const ConversationsPage = () => {
  const [contacts, setContacts] = useState([]); // Lista de contactos
  const [selectedContact, setSelectedContact] = useState(null); // Contacto seleccionado
  const [messages, setMessages] = useState([]); // Mensajes del chat
  const [newMessage, setNewMessage] = useState(""); // Input para mensaje nuevo
  const [businessId, setBusinessId] = useState(null);
  const [isSending, setIsSending] = useState(false); // Estado para indicar si se está enviando un mensaje

  useEffect(() => {
    const user = auth.currentUser;
    if (user) {
      setBusinessId(user.uid);
    }
  }, []);

  // Obtener lista de contactos en tiempo real
  useEffect(() => {
    if (!businessId) return;

    const unsubscribe = onSnapshot(doc(db, "companies", businessId), (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        const contactsData = data.contacts || {};
        const contactsArray = Object.entries(contactsData).map(([contactId, contactData]) => ({
          contactId,
          ...contactData,
        }));
        setContacts(contactsArray);
      } else {
        setContacts([]);
      }
    });

    return () => unsubscribe();
  }, [businessId]);

  // Obtener mensajes en tiempo real del contacto seleccionado
  useEffect(() => {
    if (!selectedContact || !businessId) return;

    const unsubscribe = onSnapshot(
      doc(db, "companies", businessId),
      (docSnap) => {
        const data = docSnap.data();
        const updatedContact = data.contacts[selectedContact.contactId];
        setMessages(updatedContact?.messages || []);
      }
    );

    return () => unsubscribe();
  }, [selectedContact, businessId]);

  // Manejar el envío de mensaje
  const handleSendMessage = async () => {
    if (!newMessage.trim() || isSending) return;

    const messageContent = newMessage.trim();

    const newMsg = {
      content: messageContent,
      sender: "business",
      timestamp: new Date().toISOString(),
    };

    // Simular el envío en el frontend
    setMessages((prev) => [...prev, newMsg]);
    setNewMessage(""); // Limpiar input
    setIsSending(true); // Deshabilitar botón mientras se envía el mensaje

    try {
      // Llamada al backend para enviar mensaje
      const response = await fetch("http://localhost:3000/api/messages/send", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          businessId,
          contactId: selectedContact.contactId,
          content: messageContent,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        console.error("Error al enviar mensaje:", result.error || "Error desconocido");
        alert("Error al enviar el mensaje. Inténtalo de nuevo.");
        // Eliminar el mensaje local si el envío falla
        setMessages((prev) => prev.filter((msg) => msg.content !== newMessage));
      } else {
        console.log("Mensaje enviado correctamente:", result);
      }
    } catch (error) {
      console.error("Error de red al enviar mensaje:", error);
      alert("Error al enviar el mensaje. Por favor, revisa tu conexión.");
    } finally {
      setIsSending(false); // Habilitar el botón de enviar nuevamente
    }
  };

  return (
    <div className="h-screen flex">
      {/* Sidebar */}
      <div className="w-1/3 bg-gray-100 border-r overflow-y-auto">
        <div className="p-4 text-2xl font-semibold text-center">Conversaciones</div>
        <div className="flex-1">
          {contacts.length ? (
            contacts.map((contact) => (
              <div
                key={contact.contactId}
                onClick={() => setSelectedContact(contact)}
                className={`p-4 cursor-pointer hover:bg-gray-200 ${
                  selectedContact?.contactId === contact.contactId ? "bg-gray-300" : ""
                }`}
              >
                <p className="font-bold">📱 {contact.contactId}</p>
                <p className="text-sm text-gray-500 truncate">
                  {contact.lastMessage || "Sin mensajes aún"}
                </p>
              </div>
            ))
          ) : (
            <p className="p-4 text-center text-gray-600">No se encontraron contactos</p>
          )}
        </div>
      </div>

      {/* Panel de chat */}
      <div className="w-2/3 flex flex-col bg-white">
        {selectedContact ? (
          <>
            {/* Header */}
            <div className="p-4 bg-gray-100 border-b">
              <h2 className="text-lg font-bold">Chat con: {selectedContact.contactId}</h2>
            </div>

            {/* Mensajes */}
            <div className="flex-1 p-4 overflow-y-auto space-y-4">
              {messages.length ? (
                messages.map((msg, index) => (
                  <div
                    key={index}
                    className={`flex ${
                      msg.sender === "business" ? "justify-end" : "justify-start"
                    }`}
                  >
                    <div
                      className={`p-3 rounded-lg shadow-sm ${
                        msg.sender === "business"
                          ? "bg-blue-100 text-blue-700"
                          : "bg-gray-200 text-gray-800"
                      }`}
                    >
                      {msg.content}
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-center text-gray-500">No hay mensajes aún</p>
              )}
            </div>

            {/* Input para enviar mensaje */}
            <div className="p-4 border-t bg-gray-100">
              <div className="flex items-center space-x-2">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Escribe un mensaje..."
                  className="flex-1 p-2 border rounded-lg focus:outline-none focus:ring focus:ring-blue-300"
                  disabled={isSending}
                />
                <button
                  onClick={handleSendMessage}
                  className={`px-4 py-2 rounded-lg ${
                    isSending ? "bg-gray-300 cursor-not-allowed" : "bg-blue-500 hover:bg-blue-600"
                  } text-white`}
                  disabled={isSending}
                >
                  {isSending ? "Enviando..." : "Enviar"}
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-600">
            Selecciona una conversación para ver los mensajes.
          </div>
        )}
      </div>
    </div>
  );
};

export default ConversationsPage;
