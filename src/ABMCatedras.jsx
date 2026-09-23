import { useState, useEffect } from 'react';
import { supabase } from './supabase';

export default function ABMCatedras() {
  const [facultades, setFacultades] = useState([]);
  const [catedras, setCatedras] = useState([]);
  
  // Estados para el formulario
  const [nombre, setNombre] = useState('');
  const [facultadId, setFacultadId] = useState('');

  // Cargar datos al montar el componente
  useEffect(() => {
    fetchFacultades();
    fetchCatedras();
  }, []);

  const fetchFacultades = async () => {
    let { data, error } = await supabase.from('facultad').select('*');
    if (!error) setFacultades(data);
  };

  const fetchCatedras = async () => {
    // Traemos la cátedra y las siglas de la facultad asociada
    let { data, error } = await supabase.from('catedra').select(`
      id,
      nombre,
      facultad ( siglas )
    `);
    if (!error) setCatedras(data);
  };

  const agregarCatedra = async (e) => {
    e.preventDefault();
    if (!facultadId) return alert("Selecciona una facultad");

    const { error } = await supabase
      .from('catedra')
      .insert([{ nombre: nombre, facultad_id: facultadId }]);
      
    if (error) {
      console.error("Error:", error);
    } else {
      setNombre('');
      setFacultadId('');
      fetchCatedras(); // Recargar lista
    }
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'sans-serif' }}>
      <h2>Agregar Cátedra</h2>
      
      <form onSubmit={agregarCatedra} style={{ marginBottom: '20px' }}>
        <input 
          type="text" 
          placeholder="Nombre de la Cátedra (ej. Análisis Matemático II)" 
          value={nombre} 
          onChange={(e) => setNombre(e.target.value)} 
          required 
          style={{ marginRight: '10px', width: '300px' }}
        />
        
        <select 
          value={facultadId} 
          onChange={(e) => setFacultadId(e.target.value)} 
          required
          style={{ marginRight: '10px' }}
        >
          <option value="" disabled>Seleccionar Facultad</option>
          {facultades.map(fac => (
            <option key={fac.id} value={fac.id}>{fac.siglas}</option>
          ))}
        </select>

        <button type="submit">Guardar</button>
      </form>

      <h3>Lista de Cátedras:</h3>
      <ul>
        {catedras.map((catedra) => (
          <li key={catedra.id}>
            {catedra.nombre} - <strong>({catedra.facultad?.siglas})</strong>
          </li>
        ))}
      </ul>
    </div>
  );
}