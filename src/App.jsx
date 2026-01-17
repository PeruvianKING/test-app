import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate, useParams } from 'react-router-dom';
import FolderView from './components/FolderView';
import TestListView from './components/TestListView';
import AddTestView from './components/AddTestView';
import QuizView from './components/QuizView';

const QuizSystem = () => {
  // folders: { [folderName]: { loaded: boolean, tests: Test[], fileCount: number, filePaths: string[] } }
  const [folders, setFolders] = useState({});
  const [cargandoMeta, setCargandoMeta] = useState(true);
  const [rawTestModules, setRawTestModules] = useState({}); // Guardar las referencias a las funciones de importación

  const navigate = useNavigate();

  useEffect(() => {
    const cargarMetadatos = async () => {
      try {
        setCargandoMeta(true);
        // Cargar solo las referencias a los archivos (lazy)
        const archivos = import.meta.glob('./tests/**/*.json');
        setRawTestModules(archivos);

        const estructuraInicial = {};

        Object.keys(archivos).forEach(ruta => {
          const match = ruta.match(/\.\/tests\/([^\/]+)\//);
          if (match) {
            const nombreCarpeta = match[1];
            if (!estructuraInicial[nombreCarpeta]) {
              estructuraInicial[nombreCarpeta] = {
                loaded: false,
                tests: [],
                fileCount: 0,
                filePaths: []
              };
            }
            estructuraInicial[nombreCarpeta].fileCount += 1;
            estructuraInicial[nombreCarpeta].filePaths.push(ruta);
          }
        });

        setFolders(estructuraInicial);

      } catch (e) {
        console.error("Error al cargar metadatos de archivos:", e);
      } finally {
        setCargandoMeta(false);
      }
    };

    cargarMetadatos();
  }, []);

  // Función para cargar tests de una carpeta específica
  const cargarTestsDeCarpeta = async (nombreCarpeta) => {
    if (!folders[nombreCarpeta] || folders[nombreCarpeta].loaded) {
      return; // Ya cargado o no existe
    }

    const carpetaInfo = folders[nombreCarpeta];
    const nuevosTests = [];

    try {
      await Promise.all(carpetaInfo.filePaths.map(async (ruta) => {
        const importFn = rawTestModules[ruta];
        if (importFn) {
          const modulo = await importFn();
          const datos = modulo.default;

          const temas = datos.examen_automatizacion
            .map(p => p.tema)
            .filter(Boolean)
            .filter((v, i, a) => a.indexOf(v) === i);

          nuevosTests.push({
            id: ruta,
            carpeta: nombreCarpeta,
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
          });
        }
      }));

      // Actualizar estado solo para esta carpeta
      setFolders(prev => ({
        ...prev,
        [nombreCarpeta]: {
          ...prev[nombreCarpeta],
          loaded: true,
          tests: nuevosTests
        }
      }));

    } catch (error) {
      console.error(`Error cargando tests de ${nombreCarpeta}:`, error);
    }
  };

  const handleProcessJson = (nuevosTests) => {
    // Al añadir manualmente, actualizamos la carpeta correspondiente si existe
    if (!nuevosTests || nuevosTests.length === 0) return;

    const carpetaDestino = nuevosTests[0].carpeta; // Asumimos que todos van a la misma en este flujo

    setFolders(prev => {
      const carpetaState = prev[carpetaDestino] || { loaded: true, tests: [], fileCount: 0, filePaths: [] };
      return {
        ...prev,
        [carpetaDestino]: {
          ...carpetaState,
          tests: [...carpetaState.tests, ...nuevosTests],
          // Nota: No actualizamos fileCount/Paths de manera precisa porque son generados en memoria, 
          // pero para la sesión actual funcionará.
          loaded: true
        }
      };
    });

    navigate(-1);
  };

  return (
    <Routes>
      <Route path="/" element={
        <FolderView
          cargando={cargandoMeta}
          folders={folders}
        />
      } />

      <Route path="/:folderName" element={
        <FolderLoader
          folders={folders}
          cargarTests={cargarTestsDeCarpeta}
        >
          <TestListView />
        </FolderLoader>
      } />

      <Route path="/:folderName/add" element={
        <AddTestView
          onCancel={() => navigate(-1)}
          onProcessJson={handleProcessJson}
        />
      } />

      <Route path="/:folderName/:testId" element={
        <FolderLoader
          folders={folders}
          cargarTests={cargarTestsDeCarpeta}
        >
          <QuizLoadedWrapper />
        </FolderLoader>
      } />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

// Componente Wrapper para manejar la carga Lazy
const FolderLoader = ({ folders, cargarTests, children }) => {
  const { folderName } = useParams();
  const folderDecoded = decodeURIComponent(folderName);
  const folderData = folders[folderDecoded];
  const [cargando, setCargando] = useState(false);

  useEffect(() => {
    if (folderData && !folderData.loaded) {
      setCargando(true);
      cargarTests(folderDecoded).finally(() => setCargando(false));
    }
  }, [folderDecoded, folderData]);

  if (!folderData && !cargando) {
    if (Object.keys(folders).length === 0) return <div className="p-10 text-center">Cargando aplicación...</div>;
    return <div className="p-10 text-center text-red-500">Carpeta no encontrada</div>;
  }

  if (cargando || (folderData && !folderData.loaded)) {
    return (
      <div className="fixed inset-0 bg-white bg-opacity-90 z-50 flex items-center justify-center">
        <div className="flex flex-col items-center">
          <div className="animate-spin w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full mb-4"></div>
          <h3 className="text-xl font-bold text-gray-700">Cargando tests de {folderDecoded}...</h3>
        </div>
      </div>
    );
  }

  // Clonamos el elemento hijo para pasarle los tests cargados
  return React.cloneElement(children, { tests: folderData.tests });
};

const QuizLoadedWrapper = ({ tests }) => {
  // QuizView espera 'todosLosTests' prop para buscar por ID.
  return <QuizView todosLosTests={tests} />;
};

export default QuizSystem;