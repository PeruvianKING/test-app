import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import TestListView from '../components/TestListView';

// Mock react-router-dom useParams
vi.mock('react-router-dom', async () => {
    const actual = await vi.importActual('react-router-dom');
    return {
        ...actual,
        useParams: () => ({ folderName: 'CarpetaPrueba' }),
    };
});

describe('TestListView', () => {
    const mockTests = [
        {
            id: 'test1',
            titulo: 'Test Fundamentos',
            descripcion: 'Descripcion de prueba',
            numeroPreguntas: 10,
            temas: ['Tema1', 'Tema2']
        },
        {
            id: 'test2',
            titulo: 'Test Avanzado',
            descripcion: 'Otra descripcion',
            numeroPreguntas: 5,
            temas: ['Tema3']
        }
    ];

    it('renderiza el título de la carpeta', () => {
        render(
            <BrowserRouter>
                <TestListView tests={mockTests} />
            </BrowserRouter>
        );
        expect(screen.getByText('CarpetaPrueba')).toBeInTheDocument();
    });

    it('lista los tests correctamente', () => {
        render(
            <BrowserRouter>
                <TestListView tests={mockTests} />
            </BrowserRouter>
        );
        expect(screen.getByText('Test Fundamentos')).toBeInTheDocument();
        expect(screen.getByText('Test Avanzado')).toBeInTheDocument();
    });

    it('filtra los tests por búsqueda', () => {
        render(
            <BrowserRouter>
                <TestListView tests={mockTests} />
            </BrowserRouter>
        );

        const searchInput = screen.getByPlaceholderText(/Buscar tests/i);
        fireEvent.change(searchInput, { target: { value: 'Avanzado' } });

        expect(screen.queryByText('Test Fundamentos')).not.toBeInTheDocument();
        expect(screen.getByText('Test Avanzado')).toBeInTheDocument();
    });

    it('muestra mensaje cuando no hay tests', () => {
        render(
            <BrowserRouter>
                <TestListView tests={[]} />
            </BrowserRouter>
        );
        expect(screen.getByText('No hay tests disponibles')).toBeInTheDocument();
    });
});
