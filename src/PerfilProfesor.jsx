import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from './supabase';

export default function PerfilProfesor() {
  // Obtenemos el ID del profesor desde la URL
  const { id } = useParams(); 
  
  // Estados para mostrar datos
  const [profesor, setProfesor] = useState(null);
  const [resenas, setResenas] = useState([]);
  const [promedio, setPromedio] = useState(0);
  const [catedras, setCatedras] = useState([]); // Cátedras de la facultad del profesor

  // Estados para el formulario de la reseña
  const [calificacion, setCalificacion] = useState(5);
  const [comentario, setComentario] = useState('');
  const [catedraId, setCatedraId] = useState('');

  useEffect(() => {
    if (id) {
      fetchProfesorYDatos();
    }
  }, [id]);

  const fetchProfesorYDatos = async () => {
    // 1. Traer datos del profesor y su facultad
    const { data: dataProf } = await supabase
      .from('profesor')
      .select('*, facultad(siglas)')
      .eq('id', id)
      .single();
    
    if (dataProf) {
      setProfesor(dataProf);
      
      // 2. Traer las cátedras que pertenecen a la misma facultad que el profesor
      const { data: dataCat } = await supabase
        .from('catedra')
        .select('*')
        .eq('facultad_id', dataProf.facultad_id);
      if (dataCat) setCatedras(dataCat);
    }

    // 3. Traer las reseñas de este profesor, incluyendo el nombre de la cátedra
    fetchResenas();
  };

  const fetchResenas = async () => {
    const { data, error } = await supabase
      .from('resena')
      .select('*, catedra(nombre)')
      .eq('profesor_id', id)
      .order('created_at', { ascending: false }); // Las más nuevas primero

    if (!error && data) {
      setResenas(data);
      // Calcular promedio
      if (data.length > 0) {
        const suma = data.reduce((acc, res) => acc + res.calificacion, 0);
        setPromedio((suma / data.length).toFixed(1)); // Redondear a 1 decimal
      } else {
        setPromedio(0);
      }
    }
  };

  const enviarResena = async (e) => {
    e.preventDefault();
    if (!catedraId) return alert("Por favor, selecciona una cátedra.");

    const { error } = await supabase
      .from('resena')
      .insert([{ 
        profesor_id: id, 
        catedra_id: catedraId, 
        calificacion: Number(calificacion), 
        comentario 
      }]);

    if (error) {
      console.error("Error al guardar reseña:", error);
      alert("Hubo un error al enviar tu reseña.");
    } else {
      // Limpiar formulario y recargar reseñas
      setComentario('');
      setCalificacion(5);
      setCatedraId('');
      fetchResenas();
    }
  };

  if (!profesor) return <p>Cargando perfil...</p>;

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto', padding: '20px', fontFamily: 'sans-serif' }}>
      
      {/* Cabecera del Perfil */}
      <div style={{ textAlign: 'center', marginBottom: '30px' }}>
        <h1>{profesor.nombre} {profesor.apellido}</h1>
        <p style={{ color: 'gray' }}>Facultad: {profesor.facultad?.siglas}</p>
        
        <div style={{ background: '#f4f4f4', padding: '15px', borderRadius: '10px', display: 'inline-block' }}>
          <h2 style={{ margin: 0 }}>{promedio} / 5 ⭐</h2>
          <small>{resenas.length} reseñas</small>
        </div>
      </div>

      {/* Formulario para dejar reseña */}
      <div style={{ border: '1px solid #ddd', padding: '20px', borderRadius: '8px', marginBottom: '30px' }}>
        <h3>Califica a este profesor</h3>
        <form onSubmit={enviarResena} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          
          <select value={catedraId} onChange={(e) => setCatedraId(e.target.value)} required>
            <option value="" disabled>¿En qué cátedra cursaste?</option>
            {catedras.map(cat => (
              <option key={cat.id} value={cat.id}>{cat.nombre}</option>
            ))}
          </select>

          <label>
            Calificación (1 al 5):
            <input 
              type="number" 
              min="1" max="5" 
              value={calificacion} 
              onChange={(e) => setCalificacion(e.target.value)} 
              required 
              style={{ marginLeft: '10px', width: '50px' }}
            />
          </label>

          <textarea 
            placeholder="¿Qué tal fue tu experiencia? (Opcional)" 
            value={comentario} 
            onChange={(e) => setComentario(e.target.value)}
            rows="4"
          />

          <button type="submit" style={{ padding: '10px', background: 'black', color: 'white', border: 'none', cursor: 'pointer' }}>
            Enviar Reseña
          </button>
        </form>
      </div>

      {/* Lista de Reseñas */}
      <h3>Reseñas de alumnos</h3>
      {resenas.length === 0 ? (
        <p>Aún no hay reseñas. ¡Sé el primero!</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          {resenas.map((resena) => (
            <div key={resena.id} style={{ borderBottom: '1px solid #eee', paddingBottom: '10px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <strong>{resena.calificacion} ⭐ - Cátedra: {resena.catedra?.nombre}</strong>
                <small style={{ color: 'gray' }}>{new Date(resena.created_at).toLocaleDateString()}</small>
              </div>
              <p style={{ marginTop: '5px' }}>{resena.comentario}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}