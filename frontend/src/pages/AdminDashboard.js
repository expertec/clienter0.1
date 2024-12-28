import React, { useEffect, useState } from "react";
import { collection, doc, onSnapshot } from "firebase/firestore";
import { db } from "../config/firebase";

const AdminDashboard = () => {
  const [businessInfo, setBusinessInfo] = useState(null);
  const [agents, setAgents] = useState([]);
  const [newAgent, setNewAgent] = useState({ name: "", email: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Suscripción a los datos de la empresa
    const businessDocRef = doc(db, "companies", "yourCompanyId"); // Reemplaza 'yourCompanyId' con el ID de la empresa
    const unsubscribeBusiness = onSnapshot(businessDocRef, (doc) => {
      if (doc.exists()) {
        setBusinessInfo(doc.data());
      }
    });

    // Suscripción a la lista de agentes
    const agentsCollectionRef = collection(db, "companies/yourCompanyId/agents"); // Reemplaza 'yourCompanyId'
    const unsubscribeAgents = onSnapshot(agentsCollectionRef, (snapshot) => {
      const agentsList = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setAgents(agentsList);
    });

    // Limpieza de las suscripciones
    return () => {
      unsubscribeBusiness();
      unsubscribeAgents();
    };
  }, []);

  const handleAddAgent = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // Verificar campos vacíos
      if (!newAgent.name || !newAgent.email) {
        setError("Por favor completa todos los campos.");
        return;
      }

      // Llamada al backend para agregar un agente
      const response = await fetch("/agents", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: newAgent.name,
          email: newAgent.email,
        }),
      });

      if (!response.ok) {
        const responseData = await response.json();
        setError(responseData.message || "Error al agregar el agente.");
        return;
      }

      // Limpiar formulario
      setNewAgent({ name: "", email: "" });
    } catch (err) {
      console.error("Error al agregar el agente:", err);
      setError("Error inesperado al agregar el agente.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: "1rem" }}>
        
      <h1>Panel de Administración</h1>

      {businessInfo ? (
        <div>
          <h2>{businessInfo.name}</h2>
          <p>Plan actual: {businessInfo.plan}</p>
          <p>Número de agentes: {agents.length}</p>
        </div>
      ) : (
        <p>Cargando información del negocio...</p>
      )}

      <h2>Lista de Agentes</h2>
      {agents.length > 0 ? (
        <ul>
          {agents.map((agent) => (
            <li key={agent.id}>
              {agent.name} ({agent.email})
            </li>
          ))}
        </ul>
      ) : (
        <p>No hay agentes registrados.</p>
      )}

      <h2>Agregar Nuevo Agente</h2>
      <form onSubmit={handleAddAgent} style={{ maxWidth: "400px", marginTop: "1rem" }}>
        <div>
          <label>Nombre:</label>
          <input
            type="text"
            value={newAgent.name}
            onChange={(e) => setNewAgent({ ...newAgent, name: e.target.value })}
            required
            style={{ width: "100%", padding: "0.5rem", margin: "0.5rem 0" }}
          />
        </div>
        <div>
          <label>Email:</label>
          <input
            type="email"
            value={newAgent.email}
            onChange={(e) => setNewAgent({ ...newAgent, email: e.target.value })}
            required
            style={{ width: "100%", padding: "0.5rem", margin: "0.5rem 0" }}
          />
        </div>
        <button type="submit" disabled={loading} style={{ padding: "0.5rem 1rem" }}>
          {loading ? "Guardando..." : "Agregar Agente"}
        </button>
        {error && <p style={{ color: "red", marginTop: "1rem" }}>{error}</p>}
      </form>
    </div>
  );
};

export default AdminDashboard;
