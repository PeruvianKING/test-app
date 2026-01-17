import React, { useState } from 'react';
import { CheckCircle, XCircle, RotateCcw, Award, BookOpen, ArrowLeft, Play, Plus, Upload, X, AlertCircle, Search } from 'lucide-react';

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
  const [jsonInput, setJsonInput] = useState('');
  const [errorJson, setErrorJson] = useState(null);
  const [busqueda, setBusqueda] = useState('');
  const [cargando, setCargando] = useState(true);
  const [errorCarga, setErrorCarga] = useState(null);

  React.useEffect(() => {
    const cargarTests = async () => {
      try {
        setCargando(true);

        // Cargar archivos
        const archivos = import.meta.glob('./tests/**/*.json', { eager: true });

        // Extraer nombres de subcarpetas únicas
        const nombresCarpetas = Object.keys(archivos).map(ruta => {
          // Extrae el nombre de la subcarpeta: ./tests/NOMBRE/...
          const match = ruta.match(/\.\/tests\/([^\/]+)\//);
          return match ? match[1] : null;
        }).filter(Boolean); // Elimina nulls

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

        setTodosLosTests(testsCargados);  // ← GUARDAMOS TODOS
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

  // Puedes ver las subcarpetas en consola o usarlas donde necesites
  console.log('Subcarpetas encontradas:', subcarpetas);


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
    setJsonInput('');
    setErrorJson(null);
    setBusqueda('');
  };

  const procesarJson = () => {
    try {
      setErrorJson(null);
      const datos = JSON.parse(jsonInput);

      // Detectar si es un array de tests o un solo test
      const esArray = Array.isArray(datos);
      const listaTests = esArray ? datos : [datos];

      const nuevosTests = [];

      listaTests.forEach((testData, testIndex) => {
        // Validar estructura
        if (!testData.examen_automatizacion || !Array.isArray(testData.examen_automatizacion)) {
          throw new Error(`Test ${testIndex + 1}: Debe contener un array "examen_automatizacion"`);
        }

        const preguntas = testData.examen_automatizacion;
        if (preguntas.length === 0) {
          throw new Error(`Test ${testIndex + 1}: El array de preguntas está vacío`);
        }

        preguntas.forEach((p, idx) => {
          if (!p.pregunta || !p.opciones || !p.respuesta_correcta) {
            throw new Error(`Test ${testIndex + 1}, Pregunta ${idx + 1}: Faltan campos requeridos`);
          }
          if (!p.opciones.a || !p.opciones.b || !p.opciones.c || !p.opciones.d) {
            throw new Error(`Test ${testIndex + 1}, Pregunta ${idx + 1}: Debe tener opciones a, b, c y d`);
          }
        });

        const temas = preguntas.map(p => p.tema).filter(Boolean).filter((v, i, a) => a.indexOf(v) === i);

        nuevosTests.push({
          id: `test_${Date.now()}_${testIndex}`,
          carpeta: carpetaSeleccionada || 'Manual',
          titulo: testData.titulo || `Test Personalizado ${testIndex + 1}`,
          descripcion: testData.descripcion || 'Test importado desde JSON',
          numeroPreguntas: preguntas.length,
          temas: temas.length > 0 ? temas : ['General'],
          preguntas: preguntas.map(p => ({
            id: p.id,
            pregunta: p.pregunta,
            opciones: p.opciones,
            respuesta_correcta: p.respuesta_correcta,
            explicacion: p.explicacion || 'Sin explicación disponible.'
          }))
        });
      });

      // Añadir todos los tests
      setTests([...tests, ...nuevosTests]);
      setTodosLosTests([...todosLosTests, ...nuevosTests]);

      setJsonInput('');
      setVistaActual('lista');

    } catch (error) {
      setErrorJson(error.message);
    }
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

  const mezclarArray = (array) => {
    return [...array].sort(() => Math.random() - 0.5);
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

  const calcularResultados = () => {
    return testSeleccionado.preguntas.filter((p, i) => respuestas[i] === p.respuesta_correcta).length;
  };

  const formatearExplicacion = (texto) => {
    const partes = [];
    let ultimoIndice = 0;
    const regex = /```([^`]+)```/g;
    let match;

    while ((match = regex.exec(texto)) !== null) {
      if (match.index > ultimoIndice) {
        partes.push({ tipo: 'texto', contenido: texto.substring(ultimoIndice, match.index) });
      }
      partes.push({ tipo: 'codigo', contenido: match[1] });
      ultimoIndice = match.index + match[0].length;
    }

    if (ultimoIndice < texto.length) {
      partes.push({ tipo: 'texto', contenido: texto.substring(ultimoIndice) });
    }

    return partes.length === 0 ? [{ tipo: 'texto', contenido: texto }] : partes;
  };

  if (vistaActual === 'carpetas') {
    return (
      <div className="fixed inset-0 bg-gradient-to-br from-blue-50 to-indigo-100 p-6 overflow-auto">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <img
              src="/riku.webp"
              alt="Riku"
              className="w-16 h-16 mx-auto mb-4 rounded-full object-cover shadow-lg"
            />
            <h1 className="text-4xl font-bold text-gray-800 mb-2">PeruvianKING Inc.</h1>
            <p className="text-gray-600">Selecciona una carpeta</p>
          </div>

          {cargando ? (
            <div className="bg-white rounded-xl shadow-lg p-12 text-center">
              <div className="animate-spin w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full mx-auto mb-4"></div>
              <h3 className="text-2xl font-bold text-gray-700 mb-2">Cargando carpetas...</h3>
              <p className="text-gray-500">Buscando tests disponibles</p>
            </div>
          ) : errorCarga ? (
            <div className="bg-white rounded-xl shadow-lg p-12 text-center">
              <AlertCircle className="w-20 h-20 text-red-500 mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-gray-700 mb-2">Error al cargar tests</h3>
              <p className="text-gray-500 mb-6">{errorCarga}</p>
              <button onClick={() => window.location.reload()} className="bg-indigo-500 text-white px-6 py-3 rounded-lg hover:bg-indigo-600 transition">
                Recargar página
              </button>
            </div>
          ) : subcarpetas.length === 0 ? (
            <div className="bg-white rounded-xl shadow-lg p-12 text-center">
              <img
                src="/riku.webp"
                alt="Riku"
                className="w-20 h-20 mx-auto mb-4 rounded-full object-cover opacity-30"
              />
              <h3 className="text-2xl font-bold text-gray-700 mb-2">No hay carpetas disponibles</h3>
              <p className="text-gray-500 mb-4">No se encontraron carpetas en ./tests/</p>
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {subcarpetas.map((carpeta) => {
                const testsEnCarpeta = todosLosTests.filter(t => t.carpeta === carpeta);
                const totalPreguntas = testsEnCarpeta.reduce((sum, t) => sum + t.numeroPreguntas, 0);

                return (
                  <div
                    key={carpeta}
                    onClick={() => seleccionarCarpeta(carpeta)}
                    className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 cursor-pointer"
                  >
                    <div className="mb-4">
                      <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center mb-4 overflow-hidden">
                        <img
                          src={`/${carpeta}.png`}
                          alt={carpeta}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.target.style.display = 'none';
                            const icon = document.createElement('div');
                            icon.innerHTML = '<svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path></svg>';
                            e.target.parentElement.appendChild(icon.firstChild);
                          }}
                        />
                      </div>
                      <h2 className="text-2xl font-bold text-gray-800 mb-2">{carpeta}</h2>
                    </div>
                    <div className="space-y-2 mb-4">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <span className="font-semibold">{testsEnCarpeta.length}</span>
                        <span>tests disponibles</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <span className="font-semibold">{totalPreguntas}</span>
                        <span>preguntas en total</span>
                      </div>
                    </div>
                    <button className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 text-white py-3 rounded-lg font-semibold hover:from-blue-600 hover:to-indigo-700 transition flex items-center justify-center gap-2">
                      <Play className="w-5 h-5" />
                      Ver Tests
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    );
  }

  if (vistaActual === 'lista') {
    const testsFiltrados = tests.filter(test => {
      const t = busqueda.toLowerCase();
      return test.titulo.toLowerCase().includes(t) ||
        test.descripcion.toLowerCase().includes(t) ||
        test.temas.some(tema => tema.toLowerCase().includes(t));
    });

    return (
      <div className="fixed inset-0 bg-gradient-to-br from-blue-50 to-indigo-100 p-6 overflow-auto">
        <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #cbd5e1;
          border-radius: 10px;
        }
        
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #94a3b8;
        }
        
        .custom-scrollbar {
          scrollbar-width: thin;
          scrollbar-color: #cbd5e1 transparent;
        }
      `}</style>

        <div className="max-w-5xl mx-auto">
          <button
            onClick={volverACarpetas}
            className="flex items-center gap-2 bg-white px-4 py-2 rounded-lg text-gray-700 hover:bg-gray-50 transition border border-gray-200 mb-4"
          >
            <ArrowLeft className="w-5 h-5" />
            Volver a carpetas
          </button>

          <div className="text-center mb-12">
            <BookOpen className="w-16 h-16 text-indigo-600 mx-auto mb-4" />
            <h1 className="text-4xl font-bold text-gray-800 mb-2">{carpetaSeleccionada}</h1>
            <p className="text-gray-600">Selecciona un test para comenzar</p>
          </div>

          <div className="mb-6 flex justify-center">
            <button onClick={() => setVistaActual('añadir')} className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-6 py-3 rounded-lg font-semibold hover:from-green-600 hover:to-emerald-700 transition flex items-center gap-2 shadow-lg">
              <Plus className="w-5 h-5" />
              Añadir Nuevo Test
            </button>
          </div>

          {tests.length > 0 && (
            <div className="mb-6 max-w-2xl mx-auto">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input type="text" placeholder="Buscar tests por título, descripción o tema..." value={busqueda} onChange={(e) => setBusqueda(e.target.value)} className="w-full pl-12 pr-4 py-3 bg-white border-2 border-gray-300 rounded-lg text-gray-800 placeholder-gray-400 focus:border-indigo-500 focus:outline-none shadow-sm" />
                {busqueda && (
                  <button onClick={() => setBusqueda('')} className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600">
                    <X className="w-5 h-5" />
                  </button>
                )}
              </div>
            </div>
          )}

          {tests.length === 0 ? (
            <div className="bg-white rounded-xl shadow-lg p-12 text-center">
              <BookOpen className="w-20 h-20 text-gray-300 mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-gray-700 mb-2">No hay tests disponibles</h3>
              <p className="text-gray-500 mb-4">No se encontraron tests en la carpeta public/tests</p>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4 text-sm text-left">
                <p className="font-semibold text-blue-900 mb-2">📁 Para cargar tests automáticamente:</p>
                <ol className="list-decimal list-inside space-y-1 text-blue-800">
                  <li>Crea un archivo <code className="bg-blue-100 px-2 py-0.5 rounded">public/tests/index.json</code></li>
                  <li>Con el formato: <code className="bg-blue-100 px-2 py-0.5 rounded">{"{ \"folders\": [\"tema4\", \"tema5\"] }"}</code></li>
                  <li>Coloca tus archivos JSON en: <code className="bg-blue-100 px-2 py-0.5 rounded">public/tests/tema4/gradle.json</code></li>
                </ol>
              </div>
              <p className="text-sm text-gray-400">O usa el botón de arriba para añadir tests manualmente</p>
            </div>
          ) : testsFiltrados.length === 0 ? (
            <div className="bg-white rounded-xl shadow-lg p-12 text-center">
              <Search className="w-20 h-20 text-gray-300 mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-gray-700 mb-2">No se encontraron tests</h3>
              <p className="text-gray-500 mb-6">Intenta con otros términos de búsqueda</p>
              <button onClick={() => setBusqueda('')} className="bg-indigo-500 text-white px-6 py-2 rounded-lg hover:bg-indigo-600 transition">
                Limpiar búsqueda
              </button>
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {testsFiltrados.map((test) => (
                <div key={test.id} className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 flex flex-col h-full">
                  <div className="flex-1 flex flex-col">
                    <div className="mb-4">
                      <h2 className="text-xl font-bold text-gray-800 mb-2 line-clamp-2 min-h-[3.5rem]">{test.titulo}</h2>
                      <div className="text-gray-600 text-sm mb-4 h-[4rem] overflow-y-auto pr-2 custom-scrollbar">
                        {test.descripcion}
                      </div>
                    </div>
                    <div className="mb-4 flex-1">
                      <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                        <span className="font-semibold">{test.numeroPreguntas}</span>
                        <span>preguntas</span>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {test.temas.map((tema, idx) => (
                          <span key={idx} className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-xs font-medium">{tema}</span>
                        ))}
                      </div>
                    </div>
                  </div>
                  <button onClick={() => iniciarTest(test)} className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 text-white py-3 rounded-lg font-semibold hover:from-blue-600 hover:to-indigo-700 transition flex items-center justify-center gap-2 mt-auto">
                    <Play className="w-5 h-5" />
                    Comenzar Test
                  </button>
                </div>
              ))}
            </div>
          )}

        </div>
      </div>
    );
  }
  if (vistaActual === 'añadir') {
    return (
      <div className="fixed inset-0 bg-gradient-to-br from-blue-50 to-indigo-100 p-6 overflow-auto">
        <div className="max-w-4xl mx-auto">
          <button onClick={volverALista} className="flex items-center gap-2 bg-white px-4 py-2 rounded-lg text-gray-700 hover:bg-gray-50 transition border border-gray-200 mb-4">
            <ArrowLeft className="w-5 h-5" />
            Volver a la lista
          </button>
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <div className="flex items-center gap-3 mb-6">
              <Upload className="w-8 h-8 text-indigo-600" />
              <h2 className="text-3xl font-bold text-gray-800">Añadir Nuevo Test</h2>
            </div>

            {/* AVISO */}
            <div className="mb-6 p-4 bg-yellow-50 border-l-4 border-yellow-500 rounded-r-lg flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-semibold text-yellow-900 mb-1">⚠️ Aviso importante</h4>
                <p className="text-yellow-800 text-sm">
                  Los tests añadidos manualmente se almacenan temporalmente. Si recargas la página o sales de la carpeta, se perderán.
                </p>
              </div>
            </div>

            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-3">📋 Formatos JSON aceptados</h3>

              {/* Tabs para mostrar diferentes formatos */}
              <div className="bg-gray-50 rounded-lg p-4 mb-4">
                <p className="text-sm text-gray-700 mb-3 font-medium">Puedes añadir un test individual o múltiples tests a la vez:</p>

                <details className="mb-3">
                  <summary className="cursor-pointer font-semibold text-indigo-600 hover:text-indigo-700 mb-2">
                    📄 Un solo test
                  </summary>
                  <pre className="bg-gray-900 text-green-400 p-4 rounded-lg overflow-x-auto text-xs">{`{
  "titulo": "Mi Test",
  "descripcion": "Descripción del test",
  "examen_automatizacion": [
    {
      "id": 1,
      "pregunta": "¿Tu pregunta?",
      "opciones": {
        "a": "Opción A",
        "b": "Opción B",
        "c": "Opción C",
        "d": "Opción D"
      },
      "respuesta_correcta": "b",
      "explicacion": "Explicación aquí"
    }
  ]
}`}</pre>
                </details>

                <details>
                  <summary className="cursor-pointer font-semibold text-indigo-600 hover:text-indigo-700 mb-2">
                    📚 Múltiples tests
                  </summary>
                  <pre className="bg-gray-900 text-green-400 p-4 rounded-lg overflow-x-auto text-xs">{`[
  {
    "titulo": "Test 1",
    "descripcion": "Primer test",
    "examen_automatizacion": [
      {
        "id": 1,
        "pregunta": "Pregunta 1",
        "opciones": {
          "a": "Opción A",
          "b": "Opción B",
          "c": "Opción C",
          "d": "Opción D"
        },
        "respuesta_correcta": "a",
        "explicacion": "Explicación"
      }
    ]
  },
  {
    "titulo": "Test 2",
    "descripcion": "Segundo test",
    "examen_automatizacion": [
      {
        "id": 1,
        "pregunta": "Pregunta 2",
        "opciones": {
          "a": "Opción A",
          "b": "Opción B",
          "c": "Opción C",
          "d": "Opción D"
        },
        "respuesta_correcta": "b",
        "explicacion": "Explicación"
      }
    ]
  }
]`}</pre>
                </details>
              </div>
            </div>

            <textarea
              value={jsonInput}
              onChange={(e) => setJsonInput(e.target.value)}
              placeholder="Pega tu JSON aquí (un test individual o un array de tests)..."
              className="w-full h-64 p-4 border-2 border-gray-300 rounded-lg font-mono text-sm focus:border-indigo-500 focus:outline-none mb-4"
            />

            {errorJson && (
              <div className="mb-4 p-4 bg-red-50 border-l-4 border-red-500 rounded-r-lg flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
                <div>
                  <h4 className="font-semibold text-red-800">Error:</h4>
                  <p className="text-red-700 text-sm">{errorJson}</p>
                </div>
              </div>
            )}

            <div className="flex gap-3">
              <button onClick={volverALista} className="px-6 py-3 rounded-lg font-semibold bg-white border-2 border-gray-300 text-gray-700 hover:bg-gray-50 transition">
                Cancelar
              </button>
              <button
                onClick={procesarJson}
                disabled={!jsonInput.trim()}
                className="flex-1 bg-gradient-to-r from-green-500 to-emerald-600 text-white py-3 rounded-lg font-semibold hover:from-green-600 hover:to-emerald-700 disabled:opacity-50 transition flex items-center justify-center gap-2"
              >
                <Plus className="w-5 h-5" />
                Añadir Test(s)
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }
  if (vistaActual === 'resultados') {
    const correctas = calcularResultados();
    const porcentaje = ((correctas / testSeleccionado.preguntas.length) * 100).toFixed(1);

    return (
      <div className="fixed inset-0 bg-gradient-to-br from-blue-50 to-indigo-100 p-6 overflow-auto">
        <div className="max-w-3xl mx-auto">
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <div className="text-center mb-8">
              <Award className="w-20 h-20 text-yellow-500 mx-auto mb-4" />
              <h2 className="text-3xl font-bold text-gray-800 mb-2">¡Quiz Completado!</h2>
              <p className="text-xl text-gray-600">{testSeleccionado.titulo}</p>
            </div>
            <div className="bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl p-8 text-white text-center mb-8">
              <div className="text-6xl font-bold mb-2">{correctas}/{testSeleccionado.preguntas.length}</div>
              <div className="text-2xl">{porcentaje}% correctas</div>
            </div>
            <div className="space-y-4 mb-8">
              {testSeleccionado.preguntas.map((pregunta, index) => {
                const esCorrecta = respuestas[index] === pregunta.respuesta_correcta;
                return (
                  <div key={index} className={`p-4 rounded-lg border-2 ${esCorrecta ? 'bg-green-50 border-green-300' : 'bg-red-50 border-red-300'}`}>
                    <div className="flex items-start gap-3">
                      {esCorrecta ? <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0 mt-1" /> : <XCircle className="w-6 h-6 text-red-600 flex-shrink-0 mt-1" />}
                      <div className="flex-1">
                        <p className="font-medium text-gray-800 mb-2">Pregunta {index + 1}</p>
                        <p className="text-sm text-gray-600 mb-2">{pregunta.pregunta}</p>
                        {!esCorrecta && (
                          <p className="text-sm">
                            <span className="text-red-600">Tu respuesta: {pregunta.opciones[respuestas[index]]}</span><br />
                            <span className="text-green-600">Correcta: {pregunta.opciones[pregunta.respuesta_correcta]}</span>
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="flex gap-3">
              <button onClick={volverALista} className="flex-1 bg-gray-200 text-gray-700 py-4 rounded-lg font-semibold hover:bg-gray-300 transition flex items-center justify-center gap-2">
                <ArrowLeft className="w-5 h-5" />
                Volver a la Lista
              </button>
              <button onClick={() => iniciarTest(testSeleccionado)} className="flex-1 bg-gradient-to-r from-blue-500 to-indigo-600 text-white py-4 rounded-lg font-semibold hover:from-blue-600 hover:to-indigo-700 transition flex items-center justify-center gap-2">
                <RotateCcw className="w-5 h-5" />
                Repetir Test
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const pregunta = testSeleccionado.preguntas[preguntaActual];
  const progreso = ((preguntaActual + 1) / testSeleccionado.preguntas.length) * 100;

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-blue-50 to-indigo-100 p-6 overflow-auto">
      <div className="max-w-3xl mx-auto">
        <button onClick={volverALista} className="flex items-center gap-2 bg-white px-4 py-2 rounded-lg text-gray-700 hover:bg-gray-50 transition border border-gray-200 mb-4">
          <ArrowLeft className="w-5 h-5" />
          Volver a la lista
        </button>
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="mb-6">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-gray-600">Pregunta {preguntaActual + 1} de {testSeleccionado.preguntas.length}</span>
              <span className="text-sm font-medium text-indigo-600">{progreso.toFixed(0)}% completado</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div className="bg-gradient-to-r from-blue-500 to-indigo-600 h-2 rounded-full transition-all duration-300" style={{ width: `${progreso}%` }} />
            </div>
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-6">{pregunta.pregunta}</h2>
          <div className="space-y-3 mb-8">
            {pregunta.opcionesMezcladas.map(({ letra, texto }) => (
              <button key={letra} onClick={() => handleRespuesta(letra)} disabled={mostrarExplicacion} className={`w-full text-left p-4 rounded-lg border-2 transition-all ${mostrarExplicacion
                ? letra === pregunta.respuesta_correcta ? 'border-green-500 bg-green-50' : letra === respuestaSeleccionada ? 'border-red-500 bg-red-50' : 'border-gray-200 bg-white opacity-60'
                : respuestaSeleccionada === letra ? 'border-indigo-500 bg-indigo-50 shadow-md' : 'border-gray-200 bg-white hover:border-indigo-300 hover:bg-gray-50'
                } ${mostrarExplicacion ? 'cursor-default' : 'cursor-pointer'}`}>
                <div className="flex items-start gap-3">
                  <span className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center font-semibold ${mostrarExplicacion
                    ? letra === pregunta.respuesta_correcta ? 'bg-green-500 text-white' : letra === respuestaSeleccionada ? 'bg-red-500 text-white' : 'bg-gray-300 text-gray-700'
                    : respuestaSeleccionada === letra ? 'bg-indigo-500 text-white' : 'bg-indigo-100 text-indigo-700'
                    }`}>{letra.toUpperCase()}</span>
                  <div className="flex-1">
                    <span className="block pt-1 text-gray-800">{texto}</span>
                    {mostrarExplicacion && letra === pregunta.respuesta_correcta && (
                      <span className="flex items-center gap-1 mt-2 text-sm text-green-700 font-medium">
                        <CheckCircle className="w-4 h-4" />Respuesta correcta
                      </span>
                    )}
                    {mostrarExplicacion && letra === respuestaSeleccionada && letra !== pregunta.respuesta_correcta && (
                      <span className="flex items-center gap-1 mt-2 text-sm text-red-700 font-medium">
                        <XCircle className="w-4 h-4" />Respuesta incorrecta
                      </span>
                    )}
                  </div>
                </div>
              </button>
            ))}
          </div>
          {mostrarExplicacion && (
            <div className="mb-6 p-4 bg-blue-50 border-l-4 border-blue-500 rounded-r-lg">
              <h3 className="font-semibold text-blue-900 mb-2">Explicación:</h3>
              <div className="text-blue-800 text-sm leading-relaxed">
                {formatearExplicacion(pregunta.explicacion).map((parte, idx) =>
                  parte.tipo === 'codigo' ? (
                    <code key={idx} className="bg-blue-900 text-green-300 px-2 py-1 rounded font-mono text-xs mx-1 inline-block">{parte.contenido}</code>
                  ) : (
                    <span key={idx}>{parte.contenido}</span>
                  )
                )}
              </div>
            </div>
          )}
          <div className="flex gap-3">
            <button onClick={preguntaAnterior} disabled={preguntaActual === 0} className="px-6 py-3 rounded-lg font-semibold bg-white border-2 border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition">Anterior</button>
            <button onClick={siguientePregunta} disabled={!respuestaSeleccionada} className="flex-1 bg-gradient-to-r from-blue-500 to-indigo-600 text-white py-3 rounded-lg font-semibold hover:from-blue-600 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition">
              {preguntaActual === testSeleccionado.preguntas.length - 1 ? 'Ver Resultados' : 'Siguiente'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuizSystem;