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
  const [selectedContact, setSelectedContact] = useState(null); // Contacto seleccionado para editar
  const [chatContact, setChatContact] = useState(null); // Contacto seleccionado para chatear
  const [messages, setMessages] = useState([]); // Mensajes del chat
  const [newMessage, setNewMessage] = useState(""); // Input para mensaje nuevo
  const [businessId, setBusinessId] = useState(null);
  const [isSending, setIsSending] = useState(false); // Estado para enviar mensaje

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

  const filteredContacts = contacts.filter(
    (contact) =>
      contact.phoneNumber?.includes(searchTerm) ||
      contact.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contact.tags?.some((tag) => tag.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // Abrir el modal para agregar o editar
  const handleOpenModal = (contact = null) => {
    setSelectedContact(contact);
    setIsModalOpen(true);
  };

  // Cerrar modal
  const handleCloseModal = () => {
    setSelectedContact(null);
    setIsModalOpen(false);
  };

  // Guardar contacto
  const handleSaveContact = (contact) => {
    if (contact.id) {
      setContacts((prev) => prev.map((c) => (c.id === contact.id ? contact : c)));
    } else {
      contact.id = Date.now();
      setContacts((prev) => [...prev, contact]);
    }
    handleCloseModal();
  };

  // Eliminar contacto
  const handleDeleteContact = (id) => {
    setContacts((prev) => prev.filter((contact) => contact.contactId !== id));
  };

  // Abrir el chat al seleccionar un contacto
  const handleOpenChat = (contact) => {
    setChatContact(contact);
    fetchMessages(contact.contactId);
  };

  // Cerrar el chat
  const handleCloseChat = () => {
    setChatContact(null);
    setMessages([]);
  };

  // Obtener mensajes del contacto seleccionado
  const fetchMessages = (contactId) => {
    if (!businessId || !contactId) return;

    const unsubscribe = onSnapshot(doc(db, "companies", businessId), (docSnap) => {
      const data = docSnap.data()?.contacts[contactId];
      if (data) {
        setMessages(data.messages || []);
      }
    });

    return () => unsubscribe();
  };

  // Manejar envío de mensaje
  const handleSendMessage = async () => {
    if (!newMessage.trim() || isSending) return;

    const messageContent = newMessage.trim();
    const newMsg = {
      content: messageContent,
      sender: "business",
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, newMsg]);
    setNewMessage("");
    setIsSending(true);

    try {
      await fetch("http://localhost:3000/api/messages/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          businessId,
          contactId: chatContact.contactId,
          content: messageContent,
        }),
      });
    } catch (error) {
      console.error("Error al enviar mensaje:", error);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg max-w-6xl mx-auto relative">
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

      {/* Botón "Agregar Contacto" */}
      <button
        onClick={() => handleOpenModal()}
        className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 flex items-center"
      >
        <FaPlus className="mr-2" /> Agregar Contacto
      </button>

      {/* Tabla de contactos */}
      <table className="min-w-full bg-white mt-4 shadow-md rounded-lg">
        <thead className="bg-gray-100">
          <tr>
            <th className="py-2 px-4 text-left">Nombre</th>
            <th className="py-2 px-4 text-left">Teléfono</th>
            <th className="py-2 px-4 text-left">Etiquetas</th>
            <th className="py-2 px-4 text-center">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {filteredContacts.length ? (
            filteredContacts.map((contact) => (
              <tr key={contact.contactId} className="hover:bg-gray-50">
                <td className="py-2 px-4">{contact.name || "Sin nombre"}</td>
                <td className="py-2 px-4">{contact.phoneNumber}</td>
                <td className="py-2 px-4">
                  {contact.tags?.map((tag, index) => (
                    <span
                      key={index}
                      className="bg-blue-200 text-blue-800 text-xs font-medium mr-2 px-2.5 py-0.5 rounded"
                    >
                      {tag}
                    </span>
                  ))}
                </td>
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
      {chatContact && (
        <div className="fixed top-0 right-0 w-1/3 h-full bg-white shadow-lg p-4 z-50">
          <div className="flex justify-between items-center border-b pb-2">
            <h2 className="text-lg font-semibold">Chat con: {chatContact.name || chatContact.contactId}</h2>
            <button onClick={handleCloseChat} className="text-gray-500 hover:text-red-500">
              <FaTimes />
            </button>
          </div>
          <div className="mt-4 overflow-y-auto flex-1 space-y-2">
            {messages.map((msg, index) => (
              <div
                key={index}
                className={`text-sm ${
                  msg.sender === "business" ? "text-right" : "text-left"
                }`}
              >
                <div className={`inline-block p-2 rounded-lg shadow-sm ${msg.sender === "business" ? "bg-blue-100" : "bg-gray-200"}`}>
                  {msg.content}
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Escribe un mensaje..."
              className="w-full p-2 border rounded-md focus:outline-none"
            />
            <button
              onClick={handleSendMessage}
              className="w-full mt-2 bg-blue-500 text-white py-2 rounded-md hover:bg-blue-600"
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
