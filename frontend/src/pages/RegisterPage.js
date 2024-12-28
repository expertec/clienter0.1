import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { signInWithCustomToken } from "firebase/auth"; // Importar función de autenticación
import { auth } from "../config/firebase"; // Tu configuración de Firebase

const RegisterPage = () => {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { name, email, password } = form;

    if (!name || !email || !password) {
      setError("Todos los campos son obligatorios.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      // Llamar al backend para registrar al usuario
      const response = await axios.post("http://localhost:3000/api/register", {
        name,
        email,
        password,
      });

      const { token, companyId } = response.data; // Obtener token y companyId

      // Iniciar sesión automáticamente con el token de Firebase Auth
      await signInWithCustomToken(auth, token);

      console.log(`Usuario registrado y autenticado para la compañía: ${companyId}`);

      // Redirigir al dashboard de administración
      navigate("/admin-dashboard");
    } catch (err) {
      console.error("Error al registrar:", err);
      setError("Hubo un error al registrar. Por favor, intenta de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h1>Registro</h1>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Nombre</label>
          <input
            type="text"
            name="name"
            value={form.name}
            onChange={handleChange}
            placeholder="Ingresa tu nombre"
            required
          />
        </div>
        <div>
          <label>Email</label>
          <input
            type="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            placeholder="Ingresa tu email"
            required
          />
        </div>
        <div>
          <label>Contraseña</label>
          <input
            type="password"
            name="password"
            value={form.password}
            onChange={handleChange}
            placeholder="Ingresa tu contraseña"
            required
          />
        </div>
        {error && <p style={{ color: "red" }}>{error}</p>}
        <button type="submit" disabled={loading}>
          {loading ? "Registrando..." : "Registrarse"}
        </button>
      </form>
    </div>
  );
};

export default RegisterPage;
