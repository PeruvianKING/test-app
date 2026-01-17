import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import FolderView from '../components/FolderView';

describe('FolderView', () => {
    it('muestra el estado de carga', () => {
        render(
            <BrowserRouter>
                <FolderView cargando={true} folders={{}} />
            </BrowserRouter>
        );
        expect(screen.getByText('Cargando carpetas...')).toBeInTheDocument();
    });

    it('muestra el estado de error', () => {
        render(
            <BrowserRouter>
                <FolderView cargando={false} errorCarga="Error de prueba" folders={{}} />
            </BrowserRouter>
        );
        expect(screen.getByText('Error al cargar')).toBeInTheDocument();
        expect(screen.getByText('Error de prueba')).toBeInTheDocument();
    });

    it('muestra mensaje cuando no hay carpetas', () => {
        render(
            <BrowserRouter>
                <FolderView cargando={false} folders={{}} />
            </BrowserRouter>
        );
        expect(screen.getByText('No hay carpetas disponibles')).toBeInTheDocument();
    });

    it('renderiza las carpetas correctamente', () => {
        const folders = {
            'carpeta1': { fileCount: 5 },
            'carpeta2': { fileCount: 3 }
        };
        render(
            <BrowserRouter>
                <FolderView cargando={false} folders={folders} />
            </BrowserRouter>
        );

        expect(screen.getByText('carpeta1')).toBeInTheDocument();
        expect(screen.getByText('carpeta2')).toBeInTheDocument();
        // Verificamos que los números se muestren
        expect(screen.getByText('5')).toBeInTheDocument();
        expect(screen.getByText('3')).toBeInTheDocument();
    });
});
