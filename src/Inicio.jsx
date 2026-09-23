import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from './supabase';

export default function Inicio() {
  const [busqueda, setBusqueda] = useState('');
  
  // Estados para nuestros datos dinámicos
  const [profesores, setProfesores] = useState([]);
  const [ultimos, setUltimos] = useState([]);
  const [fama, setFama] = useState([]);
  const [temidos, setTemidos] = useState([]);
  const [materias, setMaterias] = useState([]);

  const theme = {
    bg: '#FDF8FF',
    primary: '#8B5CF6',
    secondary: '#FDE047',
    border: '#111827',
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    // 1. Traer Profesores con sus reseñas y facultad
    const { data: profData, error: profError } = await supabase
      .from('profesor')
      .select(`
        id, nombre, apellido,
        facultad(siglas),
        resena(calificacion, created_at)
      `);

    if (!profError && profData) {
      // Procesar los datos matemáticamente
      const profesProcesados = profData.map(prof => {
        const resenas = prof.resena || [];
        const cantResenas = resenas.length;
        const sumaNotas = resenas.reduce((acc, r) => acc + r.calificacion, 0);
        const promedio = cantResenas > 0 ? parseFloat((sumaNotas / cantResenas).toFixed(1)) : 0;
        
        // Buscar la fecha de la reseña más reciente
        const ultimaFecha = cantResenas > 0 
          ? Math.max(...resenas.map(r => new Date(r.created_at).getTime())) 
          : 0;

        return { ...prof, cantResenas, promedio, ultimaFecha };
      });

      // Guardar lista completa para el buscador
      setProfesores(profesProcesados.sort((a, b) => a.apellido.localeCompare(b.apellido)));

      // Filtrar solo los que tienen reseñas para los rankings
      const profesConNotas = profesProcesados.filter(p => p.cantResenas > 0);

      // Ordenar para "Últimos Calificados" (por fecha descendente)
      setUltimos([...profesConNotas].sort((a, b) => b.ultimaFecha - a.ultimaFecha).slice(0, 4));

      // Ordenar para "Salón de la Fama" (Promedio más alto)
      setFama([...profesConNotas].sort((a, b) => b.promedio - a.promedio).slice(0, 4));

      // Ordenar para "Los Más Temidos" (Promedio más bajo)
      setTemidos([...profesConNotas].sort((a, b) => a.promedio - b.promedio).slice(0, 4));
    }

    // 2. Traer Cátedras con sus reseñas para la sección "Explorar Materias"
    const { data: catData, error: catError } = await supabase
      .from('catedra')
      .select(`id, nombre, resena(id, profesor_id)`);

    if (!catError && catData) {
      const materiasProcesadas = catData.map(cat => {
        const resenas = cat.resena || [];
        // Contar cuántos profesores distintos tienen reseñas en esta cátedra
        const profesUnicos = new Set(resenas.map(r => r.profesor_id)).size;
        
        return { 
          id: cat.id, 
          nombre: cat.nombre, 
          cantResenas: resenas.length, 
          cantProfes: profesUnicos 
        };
      });

      // Ordenar por las materias con más reseñas y mostrar las top 4
      setMaterias(materiasProcesadas.sort((a, b) => b.cantResenas - a.cantResenas).slice(0, 4));
    }
  };

  const profesoresFiltrados = profesores.filter((prof) => {
    const nombreCompleto = `${prof.nombre} ${prof.apellido}`.toLowerCase();
    return nombreCompleto.includes(busqueda.toLowerCase());
  });

  // --- COMPONENTES UI REUTILIZABLES ---
  const SectionTitle = ({ icon, title }) => (
    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '10px', padding: '12px 20px', border: `3px solid ${theme.border}`, borderBottom: 'none', backgroundColor: 'white', borderTopLeftRadius: '12px', borderTopRightRadius: '12px', fontWeight: '900', fontSize: '1.2rem', textTransform: 'uppercase', marginTop: '40px' }}>
      <span>{icon}</span> {title}
    </div>
  );

  const CardProfesor = ({ id, nombre, apellido, rating, resenas, isTemido }) => (
    <Link to={`/profesor/${id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
      <div style={{ minWidth: '260px', backgroundColor: 'white', padding: '20px', borderRadius: '12px', border: `3px solid ${theme.border}`, boxShadow: `4px 4px 0px 0px ${isTemido ? '#EF4444' : theme.primary}`, cursor: 'pointer', transition: 'all 0.15s ease' }}
      onMouseEnter={(e) => { e.currentTarget.style.transform = 'translate(-4px, -4px)'; e.currentTarget.style.boxShadow = `8px 8px 0px 0px ${isTemido ? '#EF4444' : theme.primary}`; }}
      onMouseLeave={(e) => { e.currentTarget.style.transform = 'translate(0px, 0px)'; e.currentTarget.style.boxShadow = `4px 4px 0px 0px ${isTemido ? '#EF4444' : theme.primary}`; }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
          <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 'bold' }}>{apellido}, {nombre}</h3>
          <span style={{ backgroundColor: isTemido ? '#FEE2E2' : theme.secondary, color: theme.border, fontWeight: '900', padding: '4px 8px', borderRadius: '6px', border: `2px solid ${theme.border}` }}>
            {rating} ★
          </span>
        </div>
        <div style={{ borderTop: '2px dashed #ccc', paddingTop: '10px', fontSize: '0.8rem', color: '#666', fontWeight: 'bold', textTransform: 'uppercase', marginTop: '20px' }}>
          {resenas} Reseñas
        </div>
      </div>
    </Link>
  );

  const CardMateria = ({ nombre, cantProfes, resenas }) => (
    <div style={{ minWidth: '250px', backgroundColor: theme.secondary, padding: '20px', borderRadius: '12px', border: `3px solid ${theme.border}`, boxShadow: `4px 4px 0px 0px ${theme.border}`, cursor: 'pointer', transition: 'all 0.15s ease' }}
    onMouseEnter={(e) => e.currentTarget.style.transform = 'translate(-4px, -4px)'}
    onMouseLeave={(e) => e.currentTarget.style.transform = 'translate(0px, 0px)'}>
      <h3 style={{ margin: '0 0 15px 0', fontSize: '1.1rem', fontWeight: '900' }}>{nombre}</h3>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', fontWeight: 'bold', color: theme.border }}>
        <span>👨‍🏫 {cantProfes} Profes</span>
        <span>📝 {resenas} Reseñas</span>
      </div>
    </div>
  );

  return (
    <div style={{ minHeight: '100vh', backgroundColor: theme.bg, padding: '40px 20px', fontFamily: '"Inter", system-ui, sans-serif' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        
        {/* HERO Y BUSCADOR */}
        <div style={{ textAlign: 'center', marginBottom: '60px' }}>
          <h1 style={{ fontSize: '3.5rem', fontWeight: '900', color: theme.border, textTransform: 'uppercase', letterSpacing: '-2px', textShadow: `3px 3px 0px ${theme.secondary}`, marginBottom: '10px' }}>
            Buscá tu profe 🎓
          </h1>
          <p style={{ fontSize: '1.1rem', fontWeight: 'bold', color: theme.border, backgroundColor: theme.secondary, display: 'inline-block', padding: '8px 16px', border: `2px solid ${theme.border}`, borderRadius: '8px', boxShadow: `4px 4px 0px 0px ${theme.primary}`, marginBottom: '40px' }}>
            Zafá de cursadas de terror 🕸️ y encontrá las mejores cátedras 🧑‍🏫
          </p>

          <div style={{ position: 'relative', maxWidth: '600px', margin: '0 auto' }}>
            <div style={{ position: 'absolute', inset: 0, transform: 'translate(8px, 8px)', backgroundColor: theme.secondary, border: `3px solid ${theme.border}`, borderRadius: '12px', zIndex: 0 }}></div>
            <input type="text" placeholder="Buscá profe, materia etc..." value={busqueda} onChange={(e) => setBusqueda(e.target.value)} style={{ position: 'relative', zIndex: 1, width: '100%', padding: '20px 25px', fontSize: '1.1rem', fontWeight: 'bold', borderRadius: '12px', border: `3px solid ${theme.border}`, outline: 'none' }} />
          </div>

          {/* Buscador de Resultados */}
          {busqueda !== '' && (
            <div style={{ maxWidth: '600px', margin: '20px auto', textAlign: 'left', display: 'flex', flexDirection: 'column', gap: '15px' }}>
              {profesoresFiltrados.map((prof) => (
                <Link key={prof.id} to={`/profesor/${prof.id}`} style={{ padding: '20px', border: `3px solid ${theme.border}`, borderRadius: '12px', textDecoration: 'none', color: theme.border, backgroundColor: 'white', boxShadow: `4px 4px 0px 0px ${theme.primary}`, display: 'flex', justifyContent: 'space-between' }}>
                  <strong style={{ fontSize: '1.1rem' }}>{prof.apellido}, {prof.nombre}</strong>
                  <span style={{ backgroundColor: theme.secondary, padding: '4px 8px', border: `2px solid ${theme.border}`, borderRadius: '6px', fontWeight: 'bold', fontSize: '0.8rem' }}>{prof.facultad?.siglas}</span>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* SECCIONES DINÁMICAS */}
        <div style={{ opacity: busqueda ? 0.3 : 1, transition: 'opacity 0.3s', pointerEvents: busqueda ? 'none' : 'auto' }}>
          
          {ultimos.length > 0 && (
            <>
              <SectionTitle icon="🔥" title="Últimos Calificados" />
              <div style={{ border: `3px solid ${theme.border}`, padding: '20px', display: 'flex', gap: '20px', overflowX: 'auto', backgroundColor: '#f9f9f9' }}>
                {ultimos.map(prof => <CardProfesor key={`ult-${prof.id}`} id={prof.id} nombre={prof.nombre} apellido={prof.apellido} rating={prof.promedio} resenas={prof.cantResenas} />)}
              </div>
            </>
          )}

          {fama.length > 0 && (
            <>
              <SectionTitle icon="🏆" title="Salón de la Fama" />
              <div style={{ border: `3px solid ${theme.border}`, padding: '20px', display: 'flex', gap: '20px', overflowX: 'auto', backgroundColor: '#f9f9f9' }}>
                {fama.map(prof => <CardProfesor key={`fam-${prof.id}`} id={prof.id} nombre={prof.nombre} apellido={prof.apellido} rating={prof.promedio} resenas={prof.cantResenas} />)}
              </div>
            </>
          )}

          {temidos.length > 0 && (
            <>
              <SectionTitle icon="💀" title="Los Más Temidos" />
              <div style={{ border: `3px solid ${theme.border}`, padding: '20px', display: 'flex', gap: '20px', overflowX: 'auto', backgroundColor: '#f9f9f9' }}>
                {temidos.map(prof => <CardProfesor key={`tem-${prof.id}`} id={prof.id} nombre={prof.nombre} apellido={prof.apellido} rating={prof.promedio} resenas={prof.cantResenas} isTemido={true} />)}
              </div>
            </>
          )}

          {materias.length > 0 && (
            <>
              <SectionTitle icon="📚" title="Explorar Materias" />
              <div style={{ border: `3px solid ${theme.border}`, padding: '20px', display: 'flex', gap: '20px', overflowX: 'auto', backgroundColor: '#f9f9f9' }}>
                {materias.map(mat => <CardMateria key={`mat-${mat.id}`} nombre={mat.nombre} cantProfes={mat.cantProfes} resenas={mat.cantResenas} />)}
              </div>
            </>
          )}

          {/* Mensaje si la base de datos está vacía */}
          {ultimos.length === 0 && (
            <div style={{ textAlign: 'center', marginTop: '50px', color: '#666', fontWeight: 'bold' }}>
              🗃️ Aún no hay suficientes reseñas para mostrar los rankings. ¡Sé el primero en calificar!
            </div>
          )}

        </div>
      </div>
    </div>
  );
}