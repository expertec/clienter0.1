import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { auth } from '../config/firebase';

const SettingsPage = () => {
  const [whatsappStatus, setWhatsappStatus] = useState('loading');
  const [qrCode, setQrCode] = useState(null);
  const [error, setError] = useState(null);
  const [userId, setUserId] = useState(null);
  const [companyId, setCompanyId] = useState(null);
  const [phoneNumber, setPhoneNumber] = useState(null);
  const [activeTab, setActiveTab] = useState('whatsapp'); // Pestaña activa
  const [showAgentModal, setShowAgentModal] = useState(false); // Modal de crear agente
  const [agentName, setAgentName] = useState('');
  const [agentEmail, setAgentEmail] = useState('');
  const [agentPassword, setAgentPassword] = useState('');
  const [successMessage, setSuccessMessage] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);
  const [agents, setAgents] = useState([]); // Lista de agentes
  const [plan, setPlan] = useState({ plan: '', maxAgents: 0, currentAgents: 0 }); // Estado del plan

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const user = auth.currentUser;
        if (!user) {
          setError('No se encontró un usuario autenticado.');
          return;
        }
        setUserId(user.uid);
        setCompanyId(user.uid);
      } catch (error) {
        console.error('Error al obtener los datos del usuario:', error);
        setError('No se pudo cargar la información del usuario.');
      }
    };
    fetchUserData();
  }, []);

  useEffect(() => {
    if (!companyId) return;

    const fetchStatus = async () => {
      try {
        const statusResponse = await axios.get(`http://localhost:3000/api/whatsapp/${companyId}/status`);
        const status = statusResponse.data.status;
        setWhatsappStatus(status);

        if (status === 'qr') {
          const qrResponse = await axios.get(`http://localhost:3000/api/whatsapp/${companyId}/qr`);
          setQrCode(qrResponse.data.qr);
          setPhoneNumber(null);
        } else if (status === 'connected') {
          const phoneResponse = await axios.get(`http://localhost:3000/api/whatsapp/${companyId}/phone`);
          setPhoneNumber(phoneResponse.data.phoneNumber);
          setQrCode(null);
        } else {
          setQrCode(null);
          setPhoneNumber(null);
        }
      } catch (error) {
        console.error('Error al obtener el estado de WhatsApp:', error);
        setError('No se pudo obtener el estado de WhatsApp.');
        setWhatsappStatus('error');
      }
    };

    fetchStatus();
  }, [companyId]);

  useEffect(() => {
    const fetchPlanData = async () => {
      if (!companyId) return;

      try {
        const response = await axios.get(`http://localhost:3000/api/companies/${companyId}/plan`);
        setPlan(response.data);
      } catch (error) {
        console.error('Error al obtener información del plan:', error);
        setPlan({ plan: 'error', maxAgents: 0, currentAgents: 0 });
      }
    };

    fetchPlanData();
  }, [companyId]);

  useEffect(() => {
    const fetchAgents = async () => {
      if (!companyId) return;

      try {
        const response = await axios.get(`http://localhost:3000/api/agents/${companyId}/list`);
        setAgents(response.data);
      } catch (error) {
        console.error('Error al obtener los agentes:', error);
      }
    };

    fetchAgents();
  }, [companyId, successMessage]);

  const handleCreateAgent = async (e) => {
    e.preventDefault();

    if (!agentName || !agentEmail || !agentPassword) {
      setErrorMessage('Todos los campos son obligatorios.');
      return;
    }

    if (plan.currentAgents >= plan.maxAgents) {
      setErrorMessage('Has alcanzado el número máximo de agentes permitidos para tu plan.');
      return;
    }

    try {
      const response = await axios.post('http://localhost:3000/api/agents/create', {
        companyId,
        name: agentName,
        email: agentEmail,
        password: agentPassword,
      });

      setSuccessMessage(response.data.message || 'Agente creado con éxito.');
      setErrorMessage(null);
      setShowAgentModal(false);
      setAgentName('');
      setAgentEmail('');
      setAgentPassword('');
    } catch (error) {
      setErrorMessage(error.response?.data?.error || 'Error al crear el agente. Intenta nuevamente.');
      setSuccessMessage(null);
    }
  };

  const handleDeleteAgent = async (agentId) => {
    try {
      await axios.delete(`http://localhost:3000/api/agents/${companyId}/delete/${agentId}`);
      setSuccessMessage('Agente eliminado correctamente.');
      setAgents(agents.filter((agent) => agent.id !== agentId));
    } catch (error) {
      console.error('Error al eliminar el agente:', error);
      setErrorMessage('Error al eliminar el agente.');
    }
  };

  return (
    <div className="p-6 bg-primary-light rounded-lg shadow">
      <h1 className="text-3xl font-extrabold text-primary mb-6">Configuración</h1>

      <div className="border-b border-secondary-dark">
        <nav className="flex space-x-4">
          <button
            className={`px-4 py-2 font-semibold rounded-md ${
              activeTab === 'whatsapp'
                ? 'text-secondary-dark bg-secondary-light border-b-4 border-secondary-dark'
                : 'text-gray-600 hover:text-primary'
            }`}
            onClick={() => setActiveTab('whatsapp')}
          >
            WhatsApp
          </button>
          <button
            className={`px-4 py-2 font-semibold rounded-md ${
              activeTab === 'agents'
                ? 'text-secondary-dark bg-secondary-light border-b-4 border-secondary-dark'
                : 'text-gray-600 hover:text-primary'
            }`}
            onClick={() => setActiveTab('agents')}
          >
            Agentes
          </button>
          <button
            className={`px-4 py-2 font-semibold rounded-md ${
              activeTab === 'plan'
                ? 'text-secondary-dark bg-secondary-light border-b-4 border-secondary-dark'
                : 'text-gray-600 hover:text-primary'
            }`}
            onClick={() => setActiveTab('plan')}
          >
            Plan
          </button>
        </nav>
      </div>

      <div className="mt-6">
        {activeTab === 'whatsapp' && (
          <div>
            <h2 className="text-xl font-bold text-primary-dark">Configuración de WhatsApp</h2>
            <p>
              <strong className="text-secondary">Estado de WhatsApp:</strong> {whatsappStatus}
            </p>
            {qrCode && <img src={qrCode} alt="Código QR de WhatsApp" className="mx-auto mt-4 shadow-lg rounded-md" />}
            {!qrCode && whatsappStatus === 'connected' && (
              <p className="text-primary mt-4">WhatsApp conectado: {phoneNumber}</p>
            )}
          </div>
        )}

        {activeTab === 'agents' && (
          <div>
            <h2 className="text-xl font-bold text-primary-dark">Gestión de Agentes</h2>
            <button
                       className="px-5 py-3 bg-primary text-white rounded-lg shadow hover:bg-secondary transition duration-300"

              onClick={() => setShowAgentModal(true)}
            >
              + Crear Nuevo Agente
            </button>

            <div className="mt-6">
              <table className="w-full border border-gray-300 rounded-md">
                <thead className="bg-primary-lightest">
                  <tr>
                    <th className="p-3">Nombre</th>
                    <th className="p-3">Correo</th>
                    <th className="p-3">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {agents.length === 0 ? (
                    <tr>
                      <td colSpan="3" className="text-center text-secondary-dark">
                        No hay agentes registrados.
                      </td>
                    </tr>
                  ) : (
                    agents.map((agent) => (
                      <tr key={agent.id} className="hover:bg-primary-lightest">
                        <td className="p-3">{agent.name}</td>
                        <td className="p-3">{agent.email}</td>
                        <td className="p-3">
                          <button
                            className="text-red-600 hover:underline"
                            onClick={() => handleDeleteAgent(agent.id)}
                          >
                            Eliminar agente
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {showAgentModal && (
              <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-10">
                <div className="bg-white rounded-lg p-6 w-1/3 shadow-lg">
                  <h3 className="text-xl font-semibold mb-4 text-primary-dark">Crear Agente</h3>
                  {errorMessage && <p className="text-red-500">{errorMessage}</p>}
                  {successMessage && <p className="text-green-500">{successMessage}</p>}
                  <form onSubmit={handleCreateAgent}>
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-secondary-dark">Nombre</label>
                      <input
                        type="text"
                        value={agentName}
                        onChange={(e) => setAgentName(e.target.value)}
                        className="mt-1 p-2 border rounded-lg w-full focus:ring focus:ring-secondary-light"
                        placeholder="Nombre del agente"
                      />
                    </div>
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-secondary-dark">Correo electrónico</label>
                      <input
                        type="email"
                        value={agentEmail}
                        onChange={(e) => setAgentEmail(e.target.value)}
                        className="mt-1 p-2 border rounded-lg w-full focus:ring focus:ring-secondary-light"
                        placeholder="Correo del agente"
                      />
                    </div>
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-secondary-dark">Contraseña</label>
                      <input
                        type="password"
                        value={agentPassword}
                        onChange={(e) => setAgentPassword(e.target.value)}
                        className="mt-1 p-2 border rounded-lg w-full focus:ring focus:ring-secondary-light"
                        placeholder="Contraseña"
                      />
                    </div>
                    <div className="flex justify-end space-x-2">
                      <button
                        type="button"
                        className="px-4 py-2 bg-gray-300 rounded-lg"
                        onClick={() => setShowAgentModal(false)}
                      >
                        Cancelar
                      </button>
                      <button type="submit" className="px-4 py-2 bg-secondary text-white rounded-lg">
                        Crear
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'plan' && (
          <div>
            <h2 className="text-xl font-bold text-primary-dark">Plan Actual</h2>

            <p>
              <strong>Plan:</strong> {plan.plan}
            </p>
            <p>
              <strong>Agentes permitidos:</strong> {plan.maxAgents}
            </p>
            <p>
              <strong>Agentes actuales:</strong> {plan.currentAgents}
            </p>
            <button                       className="px-5 py-3 bg-primary text-white rounded-lg shadow hover:bg-secondary transition duration-300"
            >
              Actualizar Plan
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default SettingsPage;
