import React from "react";
import ReactDOM from "react-dom/client"; // Importa createRoot desde react-dom/client
import "./index.css";
import App from "./App";
import { AuthProvider } from "./hooks/useAuth";

const root = ReactDOM.createRoot(document.getElementById("root")); // Usa createRoot
root.render(
  <React.StrictMode>
    <AuthProvider>
      <App />
    </AuthProvider>
  </React.StrictMode>
);
