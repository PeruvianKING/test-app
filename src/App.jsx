import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import FolderView from './components/FolderView';
import TestListView from './components/TestListView';
import AddTestView from './components/AddTestView';
import QuizView from './components/QuizView';
import ResultsView from './components/ResultsView';

const QuizSystem = () => {
  const [tests, setTests] = useState([]);
  const [subcarpetas, setSubcarpetas] = useState([]);
  const [todosLosTests, setTodosLosTests] = useState([]);

  // Estados para búsqueda y carga
  const [cargando, setCargando] = useState(true);
  const [errorCarga, setErrorCarga] = useState(null);

  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const cargarTests = async () => {
      try {
        setCargando(true);

        // Cargar archivos JSON de tests
        const archivos = import.meta.glob('./tests/**/*.json', { eager: true });

        // Extraer nombres de subcarpetas únicas
        const nombresCarpetas = Object.keys(archivos).map(ruta => {
          // Extrae el nombre de la subcarpeta
          const match = ruta.match(/\.\/tests\/([^\/]+)\//);
          return match ? match[1] : null;
        }).filter(Boolean);

        // Obtener nombres únicos
        const carpetasUnicas = [...new Set(nombresCarpetas)];
        setSubcarpetas(carpetasUnicas);

        // Cargar tests como antes
        const testsCargados = Object.entries(archivos).map(([ruta, modulo]) => {
          const datos = modulo.default;

          // Extraer carpeta del test
          const match = ruta.match(/\.\/tests\/([^\/]+)\//);
          const carpeta = match ? match[1] : 'General';

          const temas = datos.examen_automatizacion
            .map(p => p.tema)
            .filter(Boolean)
            .filter((v, i, a) => a.indexOf(v) === i);

          // Generar un ID único basado en la ruta o nombre
          // Usamos btoa para codificar la ruta y hacerlo seguro para URL, aunque ruta tiene caracteres feos
          // Mejor usar algo determinista simple si es posible, o slugify
          return {
            id: ruta,
            carpeta: carpeta,
            titulo: datos.titulo || ruta,
            descripcion: datos.descripcion || 'Test cargado automáticamente',
            numeroPreguntas: datos.examen_automatizacion.length,
            temas: temas,
            preguntas: datos.examen_automatizacion.map(p => ({
              id: p.id,
              pregunta: p.pregunta,
              opciones: p.opciones,
              respuesta_correcta: p.respuesta_correcta,
              explicacion: p.explicacion || ''
            }))
          };
        });

        setTodosLosTests(testsCargados);
        setTests(testsCargados);
      } catch (e) {
        setErrorCarga('Error al cargar tests');
        console.error(e);
      } finally {
        setCargando(false);
      }
    };

    cargarTests();
  }, []);

  const handleProcessJson = (nuevosTests) => {
    setTests(prev => [...prev, ...nuevosTests]);
    setTodosLosTests(prev => [...prev, ...nuevosTests]);
    navigate(-1); // Volver atrás
  };

  return (
    <Routes>
      <Route path="/" element={
        <FolderView
          cargando={cargando}
          errorCarga={errorCarga}
          subcarpetas={subcarpetas}
          todosLosTests={todosLosTests}
        />
      } />

      <Route path="/:folderName" element={
        <TestWrapper
          todosLosTests={todosLosTests}
        />
      } />

      <Route path="/:folderName/add" element={
        <AddWrapper
          onProcessJson={handleProcessJson}
        />
      } />

      <Route path="/:folderName/:testId" element={
        <QuizWrapper
          todosLosTests={todosLosTests}
        />
      } />

      {/* Redirección por defecto */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

// Wrappers para pasar params y props
const TestWrapper = ({ todosLosTests }) => {
  // Nota: La lógica de filtrado se mueve al componente o se pasa filtrada
  // TestListView se actualizará para usar useParams
  return <TestListView tests={todosLosTests} />;
};

const AddWrapper = ({ onProcessJson }) => {
  const navigate = useNavigate();
  // Obtener carpeta de params si es necesario pre-llenarla
  // AddTestView puede usar useParams
  return <AddTestView onCancel={() => navigate(-1)} onProcessJson={onProcessJson} />;
};

const QuizWrapper = ({ todosLosTests }) => {
  // QuizView manejará la lógica de encontrar el test por ID
  return <QuizView todosLosTests={todosLosTests} />;
};

export default QuizSystem;