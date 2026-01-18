import React, { useState, useEffect } from 'react';
import { ArrowLeft, CheckCircle, XCircle } from 'lucide-react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import ResultsView from './ResultsView';

const QuizView = ({ todosLosTests }) => {
    const { folderName, testId } = useParams();
    const navigate = useNavigate();

    // Decodificar el ID y buscar el test
    const decodedTestId = decodeURIComponent(testId);

    const [preguntaActual, setPreguntaActual] = useState(0);
    const [respuestas, setRespuestas] = useState({});
    const [respuestaSeleccionada, setRespuestaSeleccionada] = useState(null);
    const [mostrarExplicacion, setMostrarExplicacion] = useState(false);
    const [test, setTest] = useState(null);
    const [resultado, setResultado] = useState(false);

    useEffect(() => {
        // Encontrar el test en las props
        const testEncontrado = todosLosTests.find(t => t.id === decodedTestId);

        if (testEncontrado) {
            // Mezclar opciones al cargar el test
            const mezclarArray = (array) => [...array].sort(() => Math.random() - 0.5);

            const testPreparado = {
                ...testEncontrado,
                preguntas: testEncontrado.preguntas.map(p => {
                    const opcionesArray = Object.entries(p.opciones).map(
                        ([letra, texto]) => ({ letra, texto })
                    );
                    return {
                        ...p,
                        opcionesMezcladas: mezclarArray(opcionesArray)
                    };
                })
            };
            setTest(testPreparado);
        }
    }, [decodedTestId, todosLosTests]);

    if (!test) {
        return (
            <div className="fixed inset-0 flex items-center justify-center bg-gray-50">
                <div className="text-center">
                    <h3 className="text-xl font-bold text-gray-700">Cargando test...</h3>
                    <p>Si tarda mucho, puede que el test no exista.</p>
                    <button onClick={() => navigate('/')} className="mt-4 text-indigo-600 underline">Volver al inicio</button>
                </div>
            </div>
        );
    }

    // Si ya terminamos, mostrar resultados
    if (resultado) {
        return (
            <ResultsView
                test={test}
                respuestas={respuestas}
                onBack={() => navigate(`/${folderName}`)}
                onRetry={() => {
                    // Reiniciar estado
                    setPreguntaActual(0);
                    setRespuestas({});
                    setRespuestaSeleccionada(null);
                    setMostrarExplicacion(false);
                    setResultado(false);
                }}
            />
        );
    }

    const pregunta = test.preguntas[preguntaActual];
    const progreso = ((preguntaActual + 1) / test.preguntas.length) * 100;
    const esUltimaPregunta = preguntaActual === test.preguntas.length - 1;

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

    // Handlers
    const handleRespuesta = (opcion) => {
        setRespuestaSeleccionada(opcion);
        setRespuestas({ ...respuestas, [preguntaActual]: opcion });
        setMostrarExplicacion(true);
    };

    const handleNext = () => {
        if (preguntaActual < test.preguntas.length - 1) {
            setPreguntaActual(preguntaActual + 1);
            setRespuestaSeleccionada(respuestas[preguntaActual + 1] || null);
            setMostrarExplicacion(!!respuestas[preguntaActual + 1]);
        } else {
            setResultado(true);
        }
    };

    const handlePrevious = () => {
        if (preguntaActual > 0) {
            setPreguntaActual(preguntaActual - 1);
            setRespuestaSeleccionada(respuestas[preguntaActual - 1] || null);
            setMostrarExplicacion(!!respuestas[preguntaActual - 1]);
        }
    };

    const jumpToQuestion = (index) => {
        setPreguntaActual(index);
        setRespuestaSeleccionada(respuestas[index] || null);
        setMostrarExplicacion(!!respuestas[index]);
    };

    return (
        <div className="fixed inset-0 bg-gradient-to-br from-blue-50 to-indigo-100 overflow-y-auto" style={{ scrollbarGutter: 'stable' }}>
            <div className="min-h-full p-4 lg:p-6">
                <div className="grid grid-cols-1 lg:grid-cols-[1fr_minmax(0,768px)_1fr] gap-6 max-w-[1600px] mx-auto">
                    {/* Panel de Navegación */}
                    <div className="order-2 lg:order-1 lg:col-start-1 lg:pr-4 h-fit lg:h-full lg:self-start">
                        <Link to={`/${folderName}`} className="inline-flex items-center gap-2 bg-white px-4 py-2 rounded-lg text-gray-700 hover:bg-gray-50 transition border border-gray-200 shadow-sm mb-4">
                            <ArrowLeft className="w-5 h-5" />
                            Volver a la lista
                        </Link>
                        <div className="bg-white rounded-2xl shadow-xl p-6 lg:sticky lg:top-6">
                            <h3 className="text-gray-900 font-bold mb-4 flex items-center justify-between">
                                <span className="text-xs font-normal text-gray-500">{Object.keys(respuestas).length}/{test.preguntas.length}</span>
                            </h3>
                            <div className="grid gap-2" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(32px, 1fr))' }}>
                                {test.preguntas.map((pregunta, index) => {
                                    const isAnswered = respuestas[index] !== undefined;
                                    const isCurrent = index === preguntaActual;
                                    const isAccessible = index <= Object.keys(respuestas).length;
                                    const isCorrect = isAnswered && respuestas[index] === pregunta.respuesta_correcta;

                                    return (
                                        <button
                                            key={index}
                                            onClick={() => isAccessible && jumpToQuestion(index)}
                                            disabled={!isAccessible}
                                            title={`Pregunta ${index + 1}`}
                                            className={`aspect-square rounded flex items-center justify-center text-xs font-semibold transition-all duration-200
                                                ${isCurrent
                                                    ? 'bg-indigo-600 text-white shadow-md ring-2 ring-indigo-200 ring-offset-2 scale-110 z-10'
                                                    : isAnswered
                                                        ? isCorrect
                                                            ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200 border border-emerald-200'
                                                            : 'bg-red-100 text-red-700 hover:bg-red-200 border border-red-200'
                                                        : isAccessible
                                                            ? 'bg-white text-gray-700 hover:bg-gray-50 border-2 border-dashed border-gray-300'
                                                            : 'bg-gray-50 text-gray-300 cursor-not-allowed border border-transparent'
                                                }
                                            `}
                                        >
                                            {index + 1}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    </div>

                    {/* Tarjeta de Pregunta - Centrada */}
                    <div className="w-full lg:col-start-2 order-1 lg:order-2">
                        <div className="bg-white rounded-2xl shadow-xl p-6 lg:p-8">
                            <div className="mb-6">
                                <div className="flex justify-between items-center mb-2">
                                    <span className="text-sm font-medium text-gray-600">Pregunta {preguntaActual + 1} de {test.preguntas.length}</span>
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
                                <button onClick={handlePrevious} disabled={preguntaActual === 0} className="px-6 py-3 rounded-lg font-semibold bg-white border-2 border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition">Anterior</button>
                                <button onClick={handleNext} disabled={!respuestaSeleccionada} className="flex-1 bg-gradient-to-r from-blue-500 to-indigo-600 text-white py-3 rounded-lg font-semibold hover:from-blue-600 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition">
                                    {esUltimaPregunta ? 'Ver Resultados' : 'Siguiente'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default QuizView;
