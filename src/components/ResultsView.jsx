import React from 'react';
import { Award, CheckCircle, XCircle, ArrowLeft, RotateCcw } from 'lucide-react';

const ResultsView = ({ test, respuestas, onBack, onRetry }) => {
    const calcularResultados = () => {
        return test.preguntas.filter((p, i) => respuestas[i] === p.respuesta_correcta).length;
    };

    const correctas = calcularResultados();
    const porcentaje = ((correctas / test.preguntas.length) * 100).toFixed(1);

    return (
        <div className="fixed inset-0 bg-gradient-to-br from-blue-50 to-indigo-100 p-6 overflow-auto">
            <div className="max-w-3xl mx-auto">
                <div className="bg-white rounded-2xl shadow-xl p-8">
                    <div className="text-center mb-8">
                        <Award className="w-20 h-20 text-yellow-500 mx-auto mb-4" />
                        <h2 className="text-3xl font-bold text-gray-800 mb-2">¡Quiz Completado!</h2>
                        <p className="text-xl text-gray-600">{test.titulo}</p>
                    </div>
                    <div className="bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl p-8 text-white text-center mb-8">
                        <div className="text-6xl font-bold mb-2">{correctas}/{test.preguntas.length}</div>
                        <div className="text-2xl">{porcentaje}% correctas</div>
                    </div>
                    <div className="space-y-4 mb-8">
                        {test.preguntas.map((pregunta, index) => {
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
                        <button onClick={onBack} className="flex-1 bg-gray-200 text-gray-700 py-4 rounded-lg font-semibold hover:bg-gray-300 transition flex items-center justify-center gap-2">
                            <ArrowLeft className="w-5 h-5" />
                            Volver a la Lista
                        </button>
                        <button onClick={() => onRetry(test)} className="flex-1 bg-gradient-to-r from-blue-500 to-indigo-600 text-white py-4 rounded-lg font-semibold hover:from-blue-600 hover:to-indigo-700 transition flex items-center justify-center gap-2">
                            <RotateCcw className="w-5 h-5" />
                            Repetir Test
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ResultsView;
