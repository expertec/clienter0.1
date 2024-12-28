import React from "react";

const AdminHome = () => {
  const stats = [
    { title: "Nuevos Leads", value: 120, icon: "\ud83d\udcc8" },
    { title: "Ventas del Mes", value: "$45,000", icon: "\ud83d\uded2" },
    { title: "Agentes Activos", value: 8, icon: "\ud83d\udd11" },
    { title: "Tasa de Conversión", value: "15%", icon: "\ud83d\udcca" },
  ];

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Panel de Estadísticas</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => (
          <div
            key={index}
            className="bg-white shadow-md rounded-lg p-4 flex items-center justify-between hover:shadow-lg transition-shadow"
          >
            <div>
              <h2 className="text-xl font-semibold">{stat.title}</h2>
              <p className="text-gray-600 text-lg mt-2">{stat.value}</p>
            </div>
            <div className="text-4xl text-blue-500">{stat.icon}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminHome;
