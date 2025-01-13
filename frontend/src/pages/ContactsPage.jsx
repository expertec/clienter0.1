import React, { useState, useEffect } from "react";
import { FaSearch, FaPlus, FaEdit, FaTrash, FaTimes } from "react-icons/fa";
import ContactForm from "../components/ContactForm";
import { getFirestore, doc, onSnapshot } from "firebase/firestore";
import { auth } from "../config/firebase";

const db = getFirestore();

const ContactsPage = () => {
  const [contacts, setContacts] = useState([]); // Lista de contactos
  const [searchTerm, setSearchTerm] = useState(""); // Término de búsqueda
  const [isModalOpen, setIsModalOpen] = useState(false); // Estado para abrir/cerrar el modal
  const [selectedContact, setSelectedContact] = useState(null); // Contacto seleccionado para abrir el chat
  const [messages, setMessages] = useState([]); // Mensajes del chat
  const [newMessage, setNewMessage] = useState(""); // Input para mensaje nuevo
  const [businessId, setBusinessId] = useState(null);
  const [isSending, setIsSending] = useState(false); // Estado para saber si se está enviando un mensaje

  useEffect(() => {
    const user = auth.currentUser;
    if (user) {
      setBusinessId(user.uid);
    }
  }, []);

  // Obtener contactos desde Firestore
  useEffect(() => {
    if (!businessId) return;

    const unsubscribe = onSnapshot(doc(db, "companies", businessId), (docSnap) => {
      if (docSnap.exists()) {
        const contactsData = docSnap.data().contacts || {};
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

    const unsubscribe = onSnapshot(doc(db, "companies", businessId), (docSnap) => {
      if (docSnap.exists()) {
        const contactData = docSnap.data().contacts[selectedContact.contactId];
        setMessages(contactData?.messages || []);
      }
    });

    return () => unsubscribe();
  }, [selectedContact, businessId]);

  const filteredContacts = contacts.filter(
    (contact) =>
      contact.phoneNumber?.includes(searchTerm) ||
      contact.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Abrir el modal para agregar o editar contacto
  const handleOpenModal = (contact = null) => {
    setIsModalOpen(true);
  };

  // Abrir el chat
  const handleOpenChat = (contact) => {
    setSelectedContact(contact);
  };

  // Cerrar el chat
  const handleCloseChat = () => {
    setSelectedContact(null);
  };

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
    setNewMessage("");
    setIsSending(true);

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
        // Eliminar el mensaje local si falla
        setMessages((prev) => prev.filter((msg) => msg.content !== newMessage));
      }
    } catch (error) {
      console.error("Error de red al enviar mensaje:", error);
      alert("Error al enviar el mensaje. Por favor, revisa tu conexión.");
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Contactos</h1>

      {/* Barra de búsqueda */}
      <div className="flex items-center bg-gray-100 rounded-lg px-4 py-2 shadow-inner mb-4">
        <FaSearch className="text-gray-500 mr-2" />
        <input
          type="text"
          placeholder="Buscar contacto..."
          className="bg-transparent outline-none text-gray-700 w-full"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Tabla de contactos */}
      <table className="min-w-full bg-white mt-4 shadow-md rounded-lg">
        <thead className="bg-gray-100">
          <tr>
            <th className="py-2 px-4 text-left">Nombre</th>
            <th className="py-2 px-4 text-left">Teléfono</th>
            <th className="py-2 px-4 text-center">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {filteredContacts.length ? (
            filteredContacts.map((contact) => (
              <tr key={contact.contactId} className="hover:bg-gray-50">
                <td className="py-2 px-4">{contact.name || "Sin nombre"}</td>
                <td className="py-2 px-4">{contact.phoneNumber}</td>
                <td className="py-2 px-4 text-center">
                  <button
                    onClick={() => handleOpenChat(contact)}
                    className="bg-green-500 text-white p-2 rounded-full hover:bg-green-600"
                  >
                    Chat
                  </button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="4" className="text-center py-4 text-gray-500">
                No se encontraron contactos.
              </td>
            </tr>
          )}
        </tbody>
      </table>

      {/* Chat Sidebar */}
      {selectedContact && (
        <div className="fixed top-0 right-0 w-1/3 h-full bg-white shadow-lg p-4 z-50">
          <div className="flex justify-between items-center border-b pb-2">
            <h2 className="text-lg font-semibold">Chat con: {selectedContact.name || selectedContact.contactId}</h2>
            <button onClick={handleCloseChat} className="text-gray-500 hover:text-red-500">
              <FaTimes />
            </button>
          </div>

          {/* Mensajes */}
          <div className="flex-1 mt-4 overflow-y-auto space-y-4">
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
          <div className="mt-4">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Escribe un mensaje..."
              className="w-full p-2 border rounded-md focus:outline-none"
              disabled={isSending}
            />
            <button
              onClick={handleSendMessage}
              className={`w-full mt-2 bg-blue-500 text-white py-2 rounded-md hover:bg-blue-600 ${
                isSending ? "opacity-50 cursor-not-allowed" : ""
              }`}
              disabled={isSending}
            >
              {isSending ? "Enviando..." : "Enviar"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ContactsPage;
