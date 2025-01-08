import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom"; // Importar Link para la navegación
import { useAuth } from "../hooks/useAuth";

const LoginPage = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const role = await login(email, password);

      if (role === "admin") {
        navigate("/admin");
      } else if (role === "agent") {
        navigate("/agent");
      } else {
        setError("No tienes permisos para acceder.");
      }
    } catch (err) {
      setError("Credenciales inválidas. Intenta nuevamente.");
    }
  };

  return (
    <div className="flex justify-center items-center h-screen bg-gradient-to-r from-blue-100 to-blue-300">
      <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
        <h2 className="text-3xl font-semibold text-center text-gray-800 mb-6">Iniciar Sesión</h2>
        {error && <p className="text-red-600 text-center mb-4">{error}</p>}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Correo Electrónico</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border border-gray-300 rounded-md p-3 focus:ring focus:ring-blue-200 focus:outline-none"
              placeholder="Ingresa tu correo electrónico"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Contraseña</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border border-gray-300 rounded-md p-3 focus:ring focus:ring-blue-200 focus:outline-none"
              placeholder="Ingresa tu contraseña"
            />
          </div>
          <button
            type="submit"
            className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-3 rounded-md transition duration-200"
          >
            Iniciar Sesión
          </button>
        </form>
        <p className="text-sm text-center text-gray-600 mt-6">
          ¿No tienes una cuenta?{" "}
          <Link to="/register" className="text-blue-600 hover:underline">
            Regístrate aquí
          </Link>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
