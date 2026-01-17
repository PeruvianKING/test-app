import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const Pagination = ({ currentPage, totalPages, onPageChange }) => {
    if (totalPages <= 1) return null;

    const pages = [];
    // Estrategia simple: mostrar todas las páginas si son pocas, o un rango si son muchas.
    // Para simplificar y mantener estética: mostramos ventana alrededor de currentPage.

    let startPage = Math.max(1, currentPage - 2);
    let endPage = Math.min(totalPages, startPage + 4);

    if (endPage - startPage < 4) {
        startPage = Math.max(1, endPage - 4);
    }

    for (let i = startPage; i <= endPage; i++) {
        pages.push(i);
    }

    return (
        <div className="flex justify-center items-center gap-2 mt-8">
            <button
                onClick={() => onPageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className={`p-2 rounded-lg transition-colors ${currentPage === 1
                    ? 'text-indigo-200 cursor-not-allowed opacity-50'
                    : 'text-indigo-700 hover:bg-white hover:text-indigo-900 hover:shadow-sm bg-white/50'
                    }`}
                aria-label="Página anterior"
            >
                <ChevronLeft className="w-5 h-5" />
            </button>

            {pages.map(page => (
                <button
                    key={page}
                    onClick={() => onPageChange(page)}
                    className={`w-10 h-10 rounded-lg font-medium transition-all duration-200 flex items-center justify-center ${currentPage === page
                        ? 'bg-indigo-600 text-white shadow-md transform scale-105'
                        : 'text-indigo-700 hover:bg-white hover:text-indigo-900 hover:shadow-sm bg-white/50'
                        }`}
                >
                    {page}
                </button>
            ))}

            <button
                onClick={() => onPageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className={`p-2 rounded-lg transition-colors ${currentPage === totalPages
                    ? 'text-indigo-200 cursor-not-allowed opacity-50'
                    : 'text-indigo-700 hover:bg-white hover:text-indigo-900 hover:shadow-sm bg-white/50'
                    }`}
                aria-label="Siguiente página"
            >
                <ChevronRight className="w-5 h-5" />
            </button>
        </div>
    );
};

export default Pagination;
