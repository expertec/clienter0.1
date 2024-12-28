import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { auth } from '../config/firebase';

const SettingsPage = () => {
  const [whatsappStatus, setWhatsappStatus] = useState('loading');
  const [qrCode, setQrCode] = useState(null);
  const [error, setError] = useState(null);
  const [userId, setUserId] = useState(null);
  const [companyId, setCompanyId] = useState(null);
  const [phoneNumber, setPhoneNumber] = useState(null); // Estado para número de teléfono

  // Obtener información del usuario autenticado
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const user = auth.currentUser;
        if (!user) {
          setError('No se encontró un usuario autenticado.');
          return;
        }
        setUserId(user.uid);
        setCompanyId(user.uid); // Suponiendo que userId es igual al companyId
      } catch (error) {
        console.error('Error al obtener los datos del usuario:', error);
        setError('No se pudo cargar la información del usuario.');
      }
    };

    fetchUserData();
  }, []);

  // Obtener el estado de WhatsApp y manejar QR/número de teléfono
  useEffect(() => {
    if (!companyId) return;

    const fetchStatus = async () => {
      try {
        // Consultar el estado de conexión
        const statusResponse = await axios.get(`http://localhost:3000/api/whatsapp/${companyId}/status`);
        const status = statusResponse.data.status;
        setWhatsappStatus(status);

        if (status === 'qr') {
          // Obtener el QR si está en estado 'qr'
          const qrResponse = await axios.get(`http://localhost:3000/api/whatsapp/${companyId}/qr`);
          setQrCode(qrResponse.data.qr);
          setPhoneNumber(null);
        } else if (status === 'connected') {
          // Obtener el número de teléfono si está conectado
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

  return (
    <div>
      <h1>Configuración de WhatsApp</h1>
      {userId && <p><strong>ID de Usuario:</strong> {userId}</p>}
      {companyId && <p><strong>ID de Negocio:</strong> {companyId}</p>}
      <p><strong>Estado de WhatsApp:</strong> {whatsappStatus}</p>
      {error && <p style={{ color: 'red' }}>{error}</p>}

      {qrCode && (
        <div>
          <p>Escanea el siguiente código QR para iniciar sesión (ID de negocio: {companyId}):</p>
          <img src={qrCode} alt="Código QR de WhatsApp" />
        </div>
      )}

      {!qrCode && whatsappStatus === 'connected' && (
        <div>
          <p>WhatsApp ya está conectado para este negocio.</p>
          {phoneNumber ? (
            <p><strong>Número de teléfono asociado:</strong> {phoneNumber}</p>
          ) : (
            <p>Cargando número de teléfono...</p>
          )}
        </div>
      )}

      {!qrCode && whatsappStatus === 'disconnected' && (
        <p>WhatsApp no está conectado para este negocio.</p>
      )}
    </div>
  );
};

export default SettingsPage;
