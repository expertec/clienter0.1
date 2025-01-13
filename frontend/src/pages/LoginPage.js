import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom"; // Importar Link para la navegación
import { useAuth } from "../hooks/useAuth";
import logo from "../assets/logo.png"; // Importación del logo

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
    <div
      className="flex justify-center items-center h-screen"
      style={{ background: "linear-gradient(to top, #9AE26E, white)" }} // Degradado verde a blanco
    >
      <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
        <div className="flex justify-center mb-6">
          <img src={logo} alt="Logo" className="w-20 h-20 object-contain" />
        </div>
        <h2 className="text-3xl font-semibold text-center text-[#083416] mb-6">
          Iniciar Sesión
        </h2>
        {error && <p className="text-red-600 text-center mb-4">{error}</p>}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Correo Electrónico
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border border-gray-300 rounded-md p-3 focus:ring focus:ring-green-200 focus:outline-none"
              placeholder="Ingresa tu correo electrónico"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Contraseña
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border border-gray-300 rounded-md p-3 focus:ring focus:ring-green-200 focus:outline-none"
              placeholder="Ingresa tu contraseña"
            />
          </div>
          <button
            type="submit"
            className="w-full bg-[#083416] hover:bg-green-700 text-white font-semibold py-3 rounded-md transition duration-200"
          >
            Iniciar Sesión
          </button>
        </form>
        <p className="text-sm text-center text-gray-600 mt-6">
          ¿No tienes una cuenta?{" "}
          <Link to="/register" className="text-green-700 hover:underline">
            Regístrate aquí
          </Link>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
