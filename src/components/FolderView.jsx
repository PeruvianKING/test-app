import React from 'react';
import { AlertCircle, Play } from 'lucide-react';
import { Link, useSearchParams } from 'react-router-dom';
import Pagination from './Pagination';

const ITEMS_PER_PAGE = 6;

const FolderView = ({
    cargando,
    errorCarga,
    folders
}) => {
    const [searchParams, setSearchParams] = useSearchParams();
    const currentPage = parseInt(searchParams.get('page') || '1', 10);

    const folderEntries = Object.entries(folders);
    const totalPages = Math.ceil(folderEntries.length / ITEMS_PER_PAGE);

    const currentFolders = folderEntries.slice(
        (currentPage - 1) * ITEMS_PER_PAGE,
        currentPage * ITEMS_PER_PAGE
    );

    const handlePageChange = (page) => {
        setSearchParams({ page: page.toString() });
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    return (
        <div className="fixed inset-0 bg-gradient-to-br from-blue-50 to-indigo-100 p-6 overflow-auto flex flex-col">
            <div className="max-w-5xl mx-auto w-full flex-grow flex flex-col pb-12">
                <div className="flex-none">
                    <div className="text-center mb-12">
                        <img
                            src="/riku.webp"
                            alt="Riku"
                            loading="lazy"
                            className="w-20 h-20 mx-auto mb-4 rounded-full object-cover shadow-xl ring-4 ring-white"
                        />
                        <h1 className="text-5xl font-bold text-gray-800 mb-3 tracking-tight">PeruvianKING Inc.</h1>
                        <a
                            href="https://github.com/PeruvianKING/test-app"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 bg-gray-900 hover:bg-gray-800 text-white px-6 py-3 rounded-full font-medium transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
                        >
                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
                            </svg>
                            Ver en GitHub
                        </a>
                    </div>
                </div>

                <div className="flex-grow">
                    {cargando ? (
                        <div className="bg-white rounded-xl shadow-lg p-12 text-center h-full flex flex-col justify-center">
                            <div className="animate-spin w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full mx-auto mb-4"></div>
                            <h3 className="text-2xl font-bold text-gray-700 mb-2">Cargando carpetas...</h3>
                            <p className="text-gray-500">Buscando tests disponibles</p>
                        </div>
                    ) : errorCarga ? (
                        <div className="bg-white rounded-xl shadow-lg p-12 text-center h-full flex flex-col justify-center">
                            <AlertCircle className="w-20 h-20 text-red-500 mx-auto mb-4" />
                            <h3 className="text-2xl font-bold text-gray-700 mb-2">Error al cargar</h3>
                            <p className="text-gray-500 mb-6">{errorCarga}</p>
                            <button onClick={() => window.location.reload()} className="bg-indigo-500 text-white px-6 py-3 rounded-lg hover:bg-indigo-600 transition">
                                Recargar página
                            </button>
                        </div>
                    ) : Object.keys(folders).length === 0 ? (
                        <div className="bg-white rounded-xl shadow-lg p-12 text-center h-full flex flex-col justify-center">
                            <h3 className="text-2xl font-bold text-gray-700 mb-2">No hay carpetas disponibles</h3>
                            <p className="text-gray-500 mb-4">No se encontraron tests</p>
                        </div>
                    ) : (
                        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                            {currentFolders.map(([carpeta, info]) => {
                                // Ahora usamos 'info.fileCount' para mostrar la cantidad
                                return (
                                    <Link
                                        key={carpeta}
                                        to={`/${encodeURIComponent(carpeta)}`}
                                        className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 block text-left flex flex-col h-full"
                                    >
                                        <div className="flex-1">
                                            <div className="mb-4">
                                                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center mb-4 overflow-hidden">
                                                    <img
                                                        src={`/${carpeta}.png`}
                                                        alt={carpeta}
                                                        loading="lazy"
                                                        className="w-full h-full object-cover"
                                                        onError={(e) => {
                                                            e.target.style.display = 'none';
                                                            const icon = document.createElement('div');
                                                            icon.innerHTML = '<svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path></svg>';
                                                            e.target.parentElement.appendChild(icon.firstChild);
                                                        }}
                                                    />
                                                </div>
                                                <h2 className="text-2xl font-bold text-gray-800 mb-2 break-words">{carpeta}</h2>
                                            </div>
                                            <div className="space-y-2 mb-4">
                                                <div className="flex items-center gap-2 text-sm text-gray-600">
                                                    <span className="font-semibold">{info.fileCount}</span>
                                                    <span>tests disponibles</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 text-white py-3 rounded-lg font-semibold hover:from-blue-600 hover:to-indigo-700 transition flex items-center justify-center gap-2 mt-auto">
                                            <Play className="w-5 h-5" />
                                            Ver Tests
                                        </div>
                                    </Link>
                                );
                            })}
                        </div>
                    )}
                </div>

                <div className="mt-8 flex-none">
                    {!cargando && !errorCarga && Object.keys(folders).length > 0 && (
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

export default FolderView;
