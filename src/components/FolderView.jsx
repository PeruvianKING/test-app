import React from 'react';
import { AlertCircle, Play } from 'lucide-react';

const FolderView = ({
    cargando,
    errorCarga,
    subcarpetas,
    todosLosTests,
    onSelectFolder
}) => {
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
                    <p className="text-gray-600 mb-4">Selecciona una carpeta</p>
                    <a
                        href="https://github.com/PeruvianKING/test-app"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-indigo-600 hover:text-indigo-800 underline text-sm"
                    >
                        Ver repositorio en GitHub
                    </a>
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
                        <h3 className="text-2xl font-bold text-gray-700 mb-2">No hay carpetas disponibles</h3>
                        <p className="text-gray-500 mb-4">No se encontraron tests</p>
                    </div>
                ) : (
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                        {subcarpetas.map((carpeta) => {
                            const testsEnCarpeta = todosLosTests.filter(t => t.carpeta === carpeta);
                            const totalPreguntas = testsEnCarpeta.reduce((sum, t) => sum + t.numeroPreguntas, 0);

                            return (
                                <div
                                    key={carpeta}
                                    onClick={() => onSelectFolder(carpeta)}
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
};

export default FolderView;
