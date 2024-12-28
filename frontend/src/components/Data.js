// /src/components/Data.js
import React, { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { firestore } from "../config/firebase";

const Data = () => {
  const [data, setData] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const querySnapshot = await getDocs(collection(firestore, "nombre_de_tu_coleccion"));
        const items = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
        setData(items);
      } catch (error) {
        console.error("Error al obtener los datos:", error);
      }
    };

    fetchData();
  }, []);

  return (
    <ul>
      {data.map((item) => (
        <li key={item.id}>{item.nombre}</li> // Cambia "nombre" por un campo de tu colección
      ))}
    </ul>
  );
};

export default Data;
