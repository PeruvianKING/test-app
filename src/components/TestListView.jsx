import React, { useState } from 'react';
import { BookOpen, ArrowLeft, Plus, Search, X, Play } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';

const TestListView = ({
    tests = [],
}) => {
    const { folderName } = useParams();
    const [busqueda, setBusqueda] = useState('');

    // Decodificar el nombre de la carpeta de la URL
    const carpetaActual = decodeURIComponent(folderName);

    // Tests ya vienen filtrados por carpeta desde el padre (FolderLoader)
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
                <Link
                    to="/"
                    className="inline-flex items-center gap-2 bg-white px-4 py-2 rounded-lg text-gray-700 hover:bg-gray-50 transition border border-gray-200 mb-4"
                >
                    <ArrowLeft className="w-5 h-5" />
                    Volver a carpetas
                </Link>

                <div className="text-center mb-12">
                    <BookOpen className="w-16 h-16 text-indigo-600 mx-auto mb-4" />
                    <h1 className="text-4xl font-bold text-gray-800 mb-2">{carpetaActual}</h1>
                    <p className="text-gray-600">Selecciona un test para comenzar</p>
                </div>

                <div className="mb-6 flex justify-center">
                    <Link to={`/${encodeURIComponent(carpetaActual)}/add`} className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-6 py-3 rounded-lg font-semibold hover:from-green-600 hover:to-emerald-700 transition flex items-center gap-2 shadow-lg">
                        <Plus className="w-5 h-5" />
                        Añadir Nuevo Test
                    </Link>
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
                        <p className="text-gray-500 mb-4">No se encontraron tests en esta carpeta</p>
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4 text-sm text-left">
                            <p className="font-semibold text-blue-900 mb-2">📁 Para cargar tests automáticamente:</p>
                            <ol className="list-decimal list-inside space-y-1 text-blue-800">
                                <li>Asegúrate de que tus JSON están en <code className="bg-blue-100 px-2 py-0.5 rounded">src/tests/{carpetaActual}/</code></li>
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
                                <Link to={`/${encodeURIComponent(carpetaActual)}/${encodeURIComponent(test.id)}`} className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 text-white py-3 rounded-lg font-semibold hover:from-blue-600 hover:to-indigo-700 transition flex items-center justify-center gap-2 mt-auto">
                                    <Play className="w-5 h-5" />
                                    Comenzar Test
                                </Link>
                            </div>
                        ))}
                    </div>
                )}

            </div>
        </div>
    );
};

export default TestListView;
