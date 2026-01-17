import React, { useState } from 'react';
import { ArrowLeft, Upload, AlertCircle, Plus } from 'lucide-react';

const AddTestView = ({ onCancel, onProcessJson, defaultFolder }) => {
    const [jsonInput, setJsonInput] = useState('');
    const [errorJson, setErrorJson] = useState(null);

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
                    carpeta: defaultFolder || 'Manual',
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

            // Enviar tests al componente padre
            onProcessJson(nuevosTests);
            setJsonInput('');

        } catch (error) {
            setErrorJson(error.message);
        }
    };

    return (
        <div className="fixed inset-0 bg-gradient-to-br from-blue-50 to-indigo-100 p-6 overflow-auto">
            <div className="max-w-4xl mx-auto">
                <button onClick={onCancel} className="flex items-center gap-2 bg-white px-4 py-2 rounded-lg text-gray-700 hover:bg-gray-50 transition border border-gray-200 mb-4">
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
                        <button onClick={onCancel} className="px-6 py-3 rounded-lg font-semibold bg-white border-2 border-gray-300 text-gray-700 hover:bg-gray-50 transition">
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
};

export default AddTestView;
