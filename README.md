# WhatsApp Multi-Sesión

Este proyecto es una aplicación que permite gestionar múltiples sesiones de WhatsApp integradas en un CRM. Está desarrollado con un backend que utiliza Baileys para la conexión con WhatsApp y un frontend construido con React.

## Características

- **Multiempresa:** Soporte para gestionar múltiples empresas en un solo sistema.
- **Conexión con WhatsApp:** Utiliza Baileys para manejar mensajes, contactos y estados de sesión.
- **Interfaz amigable:** Un frontend intuitivo que facilita la interacción del usuario.
- **Seguridad:** Manejo seguro de credenciales mediante variables de entorno.

## Estructura del proyecto

clienter/ ├── backend/ # Código del servidor │ ├── config/ # Configuración (Firebase, Baileys, etc.) │ ├── controllers/ # Lógica de los controladores │ ├── routes/ # Definición de rutas API │ ├── middlewares/ # Middlewares de autenticación y autorización │ ├── services/ # Lógica de negocio │ └── whatsapp/ # Manejo de clientes de WhatsApp ├── frontend/ # Código del cliente (React) │ ├── src/ # Código fuente principal │ ├── public/ # Archivos estáticos │ └── .env # Variables de entorno del frontend └── README.md # Este archivo


## Requisitos

### Backend
- Node.js >= 14.x
- Firebase Admin SDK
- Baileys (para la integración con WhatsApp)

### Frontend
- Node.js >= 14.x
- React.js

## Configuración del entorno

### Backend
1. Crea un archivo `.env` en el directorio `backend` con las siguientes variables:
   ```env
   GOOGLE_APPLICATION_CREDENTIALS=backend/firebase-credentials.json
   JWT_SECRET=tu_secreto
