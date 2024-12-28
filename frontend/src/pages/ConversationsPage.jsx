import { useState } from "react";

const mockConversations = [
  { id: 1, name: "Sergio Maldonado", lastMessage: "Hola, ¿cómo estás?" },
  { id: 2, name: "Ana García", lastMessage: "Nos vemos mañana" },
  { id: 3, name: "Juan Pérez", lastMessage: "Gracias por tu ayuda" },
];

const mockMessages = [
  { id: 1, sender: "Sergio Maldonado", content: "Hola, ¿cómo estás?", mine: false },
  { id: 2, sender: "Tú", content: "¡Hola Sergio! Todo bien, gracias.", mine: true },
  { id: 3, sender: "Sergio Maldonado", content: "Perfecto. ¡Gracias!", mine: false },
];

const ConversationsPage = () => {
  const [activeConversation, setActiveConversation] = useState(mockConversations[0]);
  const [messages, setMessages] = useState(mockMessages);
  const [newMessage, setNewMessage] = useState("");

  const handleSendMessage = () => {
    if (newMessage.trim() !== "") {
      setMessages((prevMessages) => [
        ...prevMessages,
        { id: Date.now(), sender: "Tú", content: newMessage, mine: true },
      ]);
      setNewMessage("");
    }
  };

  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <div className="w-1/3 bg-gray-800 text-white flex flex-col">
        <div className="p-4 text-xl font-semibold">Conversaciones</div>
        <div className="flex-1 overflow-y-auto">
          {mockConversations.map((conversation) => (
            <div
              key={conversation.id}
              onClick={() => setActiveConversation(conversation)}
              className={`p-4 cursor-pointer hover:bg-gray-700 ${
                activeConversation?.id === conversation.id ? "bg-gray-700" : ""
              }`}
            >
              <p className="font-bold">{conversation.name}</p>
              <p className="text-sm text-gray-300 truncate">{conversation.lastMessage}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Chat Panel */}
      <div className="w-2/3 flex flex-col">
        {/* Header */}
        <div className="bg-gray-100 p-4 border-b border-gray-300">
          <h1 className="text-xl font-semibold">{activeConversation?.name}</h1>
        </div>

        {/* Messages */}
        <div className="flex-1 p-4 overflow-y-auto bg-gray-50">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`mb-4 flex ${
                message.mine ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`p-3 rounded-lg ${
                  message.mine ? "bg-blue-500 text-white" : "bg-gray-200 text-black"
                }`}
              >
                {message.content}
              </div>
            </div>
          ))}
        </div>

        {/* Input */}
        <div className="p-4 bg-gray-100 border-t border-gray-300">
          <div className="flex items-center space-x-4">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Escribe un mensaje..."
              className="flex-1 p-2 border rounded-md focus:outline-none"
            />
            <button
              onClick={handleSendMessage}
              className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600"
            >
              Enviar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConversationsPage;
