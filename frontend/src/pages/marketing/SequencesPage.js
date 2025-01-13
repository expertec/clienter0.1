import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { auth } from "../../config/firebase"; // Importación de Firebase Auth para obtener el user
import axios from "axios";

const SequencesPage = () => {
  const [sequences, setSequences] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  // Cargar las secuencias desde la API al cargar la página
  useEffect(() => {
    const fetchSequences = async () => {
      try {
        const user = auth.currentUser;
        if (!user) {
          setError("Usuario no autenticado.");
          setLoading(false);
          return;
        }

        const companyId = user.uid; // Utilizamos el `uid` del usuario como `companyId`
        const response = await axios.get(`http://localhost:3000/api/sequences/${companyId}/list`);

        // Asegurarnos de que `response.data` sea un array
        if (!Array.isArray(response.data)) {
          throw new Error("Los datos de las secuencias no son válidos.");
        }

        setSequences(response.data);
        setLoading(false);
      } catch (err) {
        console.error("Error al cargar las secuencias:", err);
        setError("Error al cargar las secuencias.");
        setLoading(false);
      }
    };

    fetchSequences();
  }, []);

  // Función para eliminar una secuencia
  const handleDelete = async (sequenceId) => {
    if (!window.confirm("¿Estás seguro de que deseas eliminar esta secuencia?")) {
      return;
    }

    try {
      const user = auth.currentUser;
      const companyId = user.uid; // Asegurar que usamos el `companyId` al eliminar
      await axios.delete(`http://localhost:3000/api/sequences/${companyId}/${sequenceId}`);
      setSequences((prevSequences) => prevSequences.filter((sequence) => sequence.id !== sequenceId));
    } catch (err) {
      console.error("Error al eliminar la secuencia:", err);
      alert("Error al eliminar la secuencia.");
    }
  };

  return (
    <div className="p-6 bg-gradient-to-b from-white to-primary-light rounded-lg shadow-lg max-w-6xl mx-auto mt-10">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-primary">Secuencias</h1>
        <button
          onClick={() => navigate("/admin/marketing/sequences/create")}
          className="px-5 py-3 bg-primary text-white rounded-lg shadow hover:bg-secondary transition duration-300"
        >
          + Crear Nueva Secuencia
        </button>
      </div>

      {loading ? (
        <div className="text-center py-6">
          <p className="text-gray-500">Cargando secuencias...</p>
        </div>
      ) : error ? (
        <p className="text-red-500 text-center">{error}</p>
      ) : sequences.length === 0 ? (
        <div className="text-center py-6">
          <p className="text-gray-500">No hay secuencias creadas.</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="table-auto w-full border border-gray-300 rounded-lg shadow-sm">
            <thead className="bg-gray-100">
              <tr>
                <th className="p-4 border-b text-primary-dark">Nombre</th>
                <th className="p-4 border-b text-primary-dark">Etiquetas</th>
                <th className="p-4 border-b text-primary-dark">Estado</th>
                <th className="p-4 border-b text-primary-dark">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {sequences.map((sequence) => (
                <tr key={sequence.id} className="hover:bg-primary-lightest">
                  <td className="p-4 text-primary-dark">{sequence.name}</td>
                  <td className="p-4 text-primary-dark">
                    {sequence.triggers?.etiquetas?.join(", ") || "N/A"}
                  </td>
                  <td className="p-4">
                    <span
                      className={`px-2 py-1 rounded-full text-sm font-medium ${
                        sequence.status === "activa"
                          ? "bg-secondary text-secondary-dark"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {sequence.status === "activa" ? "Activa" : "Inactiva"}
                    </span>
                  </td>
                  <td className="p-4 flex space-x-3 justify-center">
                    <button
                      onClick={() => navigate(`/admin/marketing/sequences/edit/${sequence.id}`)}
                      className="px-4 py-2 bg-secondary text-white rounded-md hover:bg-secondary-dark transition"
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => handleDelete(sequence.id)}
                      className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition"
                    >
                      Eliminar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default SequencesPage;
