import { useState, useEffect } from 'react';
import { supabase } from './supabase';

export default function ABMProfesores() {
  const [facultades, setFacultades] = useState([]);
  const [profesores, setProfesores] = useState([]);
  
  // Estados para el formulario
  const [nombre, setNombre] = useState('');
  const [apellido, setApellido] = useState('');
  const [facultadId, setFacultadId] = useState('');

  // Cargar datos al montar el componente
  useEffect(() => {
    fetchFacultades();
    fetchProfesores();
  }, []);

  const fetchFacultades = async () => {
    let { data, error } = await supabase.from('facultad').select('*');
    if (!error) setFacultades(data);
  };

  const fetchProfesores = async () => {
    // El select('*, facultad(siglas)') trae los datos del profesor y las siglas de su facultad relacionada
    let { data, error } = await supabase.from('profesor').select(`
      id,
      nombre,
      apellido,
      facultad ( siglas )
    `);
    if (!error) setProfesores(data);
  };

  const agregarProfesor = async (e) => {
    e.preventDefault();
    if (!facultadId) return alert("Selecciona una facultad");

    const { error } = await supabase
      .from('profesor')
      .insert([{ nombre, apellido, facultad_id: facultadId }]);
      
    if (error) {
      console.error("Error:", error);
    } else {
      setNombre('');
      setApellido('');
      setFacultadId('');
      fetchProfesores(); // Recargar lista
    }
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'sans-serif' }}>
      <h2>Agregar Profesor</h2>
      
      <form onSubmit={agregarProfesor} style={{ marginBottom: '20px' }}>
        <input 
          type="text" 
          placeholder="Nombre" 
          value={nombre} 
          onChange={(e) => setNombre(e.target.value)} 
          required 
          style={{ marginRight: '10px' }}
        />
        <input 
          type="text" 
          placeholder="Apellido" 
          value={apellido} 
          onChange={(e) => setApellido(e.target.value)} 
          required 
          style={{ marginRight: '10px' }}
        />
        
        {/* Desplegable leyendo desde la base de datos */}
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

      <h3>Lista de Profesores:</h3>
      <ul>
        {profesores.map((prof) => (
          <li key={prof.id}>
            {prof.nombre} {prof.apellido} - <strong>({prof.facultad?.siglas})</strong>
          </li>
        ))}
      </ul>
    </div>
  );
}