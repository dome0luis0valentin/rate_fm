import { useState, useEffect } from 'react';
import { supabase } from './supabase';

export default function Facultades() {
  const [facultades, setFacultades] = useState([]);
  const [nombre, setNombre] = useState('');
  const [siglas, setSiglas] = useState('');

  // Función para obtener los datos
  const fetchFacultades = async () => {
    let { data, error } = await supabase.from('facultad').select('*');
    if (error) console.log("Error al traer datos:", error);
    else setFacultades(data);
  };

  // Función para guardar una nueva facultad
  const agregarFacultad = async (e) => {
    e.preventDefault();
    const { error } = await supabase
      .from('facultad')
      .insert([{ nombre: nombre, siglas: siglas }]);
      
    if (error) {
      alert("Hubo un error al guardar");
      console.error(error);
    } else {
      setNombre('');
      setSiglas('');
      fetchFacultades(); // Recargamos la lista
    }
  };

  // Cargar las facultades al entrar a la página
  useEffect(() => {
    fetchFacultades();
  }, []);

  return (
    <div style={{ padding: '20px', fontFamily: 'sans-serif' }}>
      <h2>ABM Facultades</h2>
      
      {/* Formulario de Alta */}
      <form onSubmit={agregarFacultad} style={{ marginBottom: '20px' }}>
        <input 
          type="text" 
          placeholder="Nombre (ej. Ingeniería)" 
          value={nombre} 
          onChange={(e) => setNombre(e.target.value)} 
          required 
          style={{ marginRight: '10px' }}
        />
        <input 
          type="text" 
          placeholder="Siglas (ej. FIUBA)" 
          value={siglas} 
          onChange={(e) => setSiglas(e.target.value)} 
          required 
          style={{ marginRight: '10px' }}
        />
        <button type="submit">Agregar Facultad</button>
      </form>

      {/* Lista de Facultades */}
      <h3>Facultades guardadas:</h3>
      <ul>
        {facultades.map((fac) => (
          <li key={fac.id}>
            <strong>{fac.siglas}</strong> - {fac.nombre}
          </li>
        ))}
      </ul>
    </div>
  );
}