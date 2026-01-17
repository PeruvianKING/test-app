import React, { useState } from 'react';
import FolderView from './components/FolderView';
import TestListView from './components/TestListView';
import AddTestView from './components/AddTestView';
import QuizView from './components/QuizView';
import ResultsView from './components/ResultsView';

const QuizSystem = () => {
  const [tests, setTests] = useState([]);
  const [subcarpetas, setSubcarpetas] = useState([]);
  const [carpetaSeleccionada, setCarpetaSeleccionada] = useState(null);
  const [todosLosTests, setTodosLosTests] = useState([]);
  const [vistaActual, setVistaActual] = useState('carpetas');
  const [testSeleccionado, setTestSeleccionado] = useState(null);
  const [preguntaActual, setPreguntaActual] = useState(0);
  const [respuestas, setRespuestas] = useState({});
  const [respuestaSeleccionada, setRespuestaSeleccionada] = useState(null);
  const [mostrarExplicacion, setMostrarExplicacion] = useState(false);

  // Estados movidos a componentes, se mantienen si se necesitan referencias globales
  // const [jsonInput, setJsonInput] = useState('');
  // const [errorJson, setErrorJson] = useState(null);

  const [busqueda, setBusqueda] = useState('');
  const [cargando, setCargando] = useState(true);
  const [errorCarga, setErrorCarga] = useState(null);

  React.useEffect(() => {
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

  const mezclarArray = (array) => {
    return [...array].sort(() => Math.random() - 0.5);
  };

  const iniciarTest = (test) => {
    const testConOpcionesMezcladas = {
      ...test,
      preguntas: test.preguntas.map(p => {
        const opcionesArray = Object.entries(p.opciones).map(
          ([letra, texto]) => ({ letra, texto })
        );

        return {
          ...p,
          opcionesMezcladas: mezclarArray(opcionesArray)
        };
      })
    };

    setTestSeleccionado(testConOpcionesMezcladas);
    setPreguntaActual(0);
    setRespuestas({});
    setRespuestaSeleccionada(null);
    setMostrarExplicacion(false);
    setVistaActual('quiz');
  };

  const volverALista = () => {
    if (carpetaSeleccionada) {
      setVistaActual('lista');
    } else {
      setVistaActual('carpetas');
    }
    setTestSeleccionado(null);
    setPreguntaActual(0);
    setRespuestas({});
    setRespuestaSeleccionada(null);
    setMostrarExplicacion(false);
    setBusqueda('');
  };

  const seleccionarCarpeta = (carpeta) => {
    const testsFiltrados = todosLosTests.filter(test => test.carpeta === carpeta);
    setTests(testsFiltrados);
    setCarpetaSeleccionada(carpeta);
    setVistaActual('lista');
  };

  const volverACarpetas = () => {
    setVistaActual('carpetas');
    setCarpetaSeleccionada(null);
    setTests(todosLosTests);
    setBusqueda('');
  };

  const handleRespuesta = (opcion) => {
    setRespuestaSeleccionada(opcion);
    setRespuestas({ ...respuestas, [preguntaActual]: opcion });
    setMostrarExplicacion(true);
  };

  const siguientePregunta = () => {
    if (preguntaActual < testSeleccionado.preguntas.length - 1) {
      setPreguntaActual(preguntaActual + 1);
      setRespuestaSeleccionada(respuestas[preguntaActual + 1] || null);
      setMostrarExplicacion(!!respuestas[preguntaActual + 1]);
    } else {
      setVistaActual('resultados');
    }
  };

  const preguntaAnterior = () => {
    if (preguntaActual > 0) {
      setPreguntaActual(preguntaActual - 1);
      setRespuestaSeleccionada(respuestas[preguntaActual - 1] || null);
      setMostrarExplicacion(!!respuestas[preguntaActual - 1]);
    }
  };

  const handleProcessJson = (nuevosTests) => {
    setTests([...tests, ...nuevosTests]);
    setTodosLosTests([...todosLosTests, ...nuevosTests]);
    setVistaActual('lista');
  };

  if (vistaActual === 'carpetas') {
    return (
      <FolderView
        cargando={cargando}
        errorCarga={errorCarga}
        subcarpetas={subcarpetas}
        todosLosTests={todosLosTests}
        onSelectFolder={seleccionarCarpeta}
      />
    );
  }

  if (vistaActual === 'lista') {
    return (
      <TestListView
        carpetaSeleccionada={carpetaSeleccionada}
        tests={tests}
        busqueda={busqueda}
        setBusqueda={setBusqueda}
        onBack={volverACarpetas}
        onAddTest={() => setVistaActual('añadir')}
        onSelectTest={iniciarTest}
      />
    );
  }

  if (vistaActual === 'añadir') {
    return (
      <AddTestView
        onCancel={volverALista}
        onProcessJson={handleProcessJson}
        defaultFolder={carpetaSeleccionada}
      />
    );
  }

  if (vistaActual === 'resultados') {
    return (
      <ResultsView
        test={testSeleccionado}
        respuestas={respuestas}
        onBack={volverALista}
        onRetry={iniciarTest}
      />
    );
  }

  // Vista quiz
  return (
    <QuizView
      test={testSeleccionado}
      preguntaActual={preguntaActual}
      respuestas={respuestas}
      respuestaSeleccionada={respuestaSeleccionada}
      mostrarExplicacion={mostrarExplicacion}
      onExit={volverALista}
      onAnswer={handleRespuesta}
      onPrevious={preguntaAnterior}
      onNext={siguientePregunta}
    />
  );
};

export default QuizSystem;