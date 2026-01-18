import React, { useState, useEffect } from 'react';
import { BookOpen, ArrowLeft, Plus, Search, X, Play } from 'lucide-react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import Pagination from './Pagination';

const ITEMS_PER_PAGE = 6;

const TestListView = ({
    tests = [],
    totalFiles = 0,
    loadAllTests
}) => {
    const { folderName } = useParams();
    const [searchParams, setSearchParams] = useSearchParams();
    const [busqueda, setBusqueda] = useState('');

    // Leer página de la URL o usar 1 por defecto
    const currentPage = parseInt(searchParams.get('page') || '1', 10);

    // Decodificar el nombre de la carpeta de la URL
    const carpetaActual = decodeURIComponent(folderName);

    // Si hay búsqueda, aseguramos cargar TODO.
    useEffect(() => {
        if (busqueda && loadAllTests) {
            loadAllTests();
        }
    }, [busqueda, loadAllTests]);

    const testsFiltrados = tests.filter(test => {
        if (!test) return false; // Ignorar slots vacíos
        const t = busqueda.toLowerCase();
        return test.titulo.toLowerCase().includes(t) ||
            test.descripcion.toLowerCase().includes(t) ||
            test.temas.some(tema => tema.toLowerCase().includes(t));
    });

    // Resetear a página 1 cuando cambia la búsqueda
    useEffect(() => {
        if (busqueda && currentPage !== 1) {
            setSearchParams({ page: '1' });
        }
    }, [busqueda]);

    // Calcular total de páginas
    // Si hay búsqueda, usamos la longitud de filtrados.
    // Si NO hay búsqueda, usamos el totalFiles que viene de metadatos.
    const effectiveTotal = busqueda ? testsFiltrados.length : totalFiles;
    const totalPages = Math.ceil(effectiveTotal / ITEMS_PER_PAGE);

    // Obtener los tests a mostrar.
    // Si hay búsqueda, paginamos sobre los filtrados.
    // Si NO hay búsqueda, tomamos el slice de la página actual directamente del array 'tests'
    // que ya debería tener los datos cargados en esas posiciones por el FolderLoader.
    let currentTests = [];
    if (busqueda) {
        currentTests = testsFiltrados.slice(
            (currentPage - 1) * ITEMS_PER_PAGE,
            currentPage * ITEMS_PER_PAGE
        );
    } else {
        const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
        const endIndex = currentPage * ITEMS_PER_PAGE;

        currentTests = tests.slice(startIndex, endIndex).filter(t => t);
    }

    const handlePageChange = (page) => {
        setSearchParams({ page: page.toString() });
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    return (
        <div className="fixed inset-0 bg-gradient-to-br from-blue-50 to-indigo-100 p-6 overflow-auto flex flex-col">
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

            {/* Contenedor principal que empuja el footer (si existiera) o usa mx-auto y flex-grow */}
            <div className="max-w-5xl mx-auto w-full flex-grow flex flex-col">
                <div className="flex-none">
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
                        <Link to={`/${encodeURIComponent(carpetaActual)}/add`} className="bg-gradient-to-r from-green-500 to-emerald-600 text-white hover:text-white px-6 py-3 rounded-lg font-semibold hover:from-green-600 hover:to-emerald-700 transition flex items-center gap-2 shadow-lg">
                            <Plus className="w-5 h-5" />
                            Añadir Nuevo Test
                        </Link>
                    </div>

                    {tests.some(t => t) && ( /* Mostrar búsqueda si hay ALGO cargado */
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
                </div>

                <div className="flex-grow">
                    {!tests.some(t => t) ? (
                        <div className="bg-white rounded-xl shadow-lg p-12 text-center">
                            <BookOpen className="w-20 h-20 text-gray-300 mx-auto mb-4" />
                            <h3 className="text-2xl font-bold text-gray-700 mb-2">No hay tests disponibles</h3>
                            <p className="text-gray-500 mb-4">No se encontraron tests en esta carpeta</p>
                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4 text-sm text-left">
                                <p className="font-semibold text-blue-900 mb-2">📁 Para cargar tests automáticamente:</p>
                                <ol className="list-decimal list-inside space-y-1 text-blue-800">
                                    <li>Asegúrate de que tus JSON están en <code className="bg-blue-100 px-2 py-0.5 rounded">src/data/{carpetaActual}/</code></li>
                                </ol>
                            </div>
                            <p className="text-sm text-gray-400">O usa el botón de arriba para añadir tests manualmente</p>
                        </div>
                    ) : busqueda && testsFiltrados.length === 0 ? (
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
                            {/* Rellenamos con placeholders invisibles para mantener el layout fijo */}
                            {[...Array(ITEMS_PER_PAGE)].map((_, index) => {
                                const test = currentTests[index];
                                if (!test) {
                                    return (
                                        <div key={`placeholder-${index}`} className="opacity-0 pointer-events-none p-6 flex flex-col h-full border-2 border-transparent">
                                            <div className="flex-1">
                                                <div className="mb-4">
                                                    <div className="h-8 bg-gray-200 rounded mb-2"></div>
                                                    <div className="h-16 bg-gray-100 rounded"></div>
                                                </div>
                                            </div>
                                            <div className="h-12 bg-gray-200 rounded mt-auto"></div>
                                        </div>
                                    );
                                }

                                return (
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
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* Paginación fijada al final del contenido o contenedor */}
                <div className="mt-8 flex-none pb-12">
                    {tests.some(t => t) && (
                        <Pagination
                            currentPage={currentPage}
                            totalPages={totalPages}
                            onPageChange={handlePageChange}
                        />
                    )}
                </div>
            </div>
        </div>
    );
};

export default TestListView;

