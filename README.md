# 👑 PeruvianKING Quiz System

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![React](https://img.shields.io/badge/React-19.0-61DAFB?logo=react&logoColor=black)
![Vite](https://img.shields.io/badge/Vite-6.0-646CFF?logo=vite&logoColor=white)
![Tailwind](https://img.shields.io/badge/Tailwind_CSS-3.4-38B2AC?logo=tailwind-css&logoColor=white)

Un sistema de evaluación moderno, interactivo y dinámico diseñado para la gestión y ejecución de tests automatizados. **PeruvianKING** ofrece una experiencia de usuario premium con animaciones fluidas, feedback inmediato y una interfaz intuitiva.

## ✨ Características Principales

*   **📂 Organización por Carpetas**: Navega fácilmente entre diferentes categorías de tests desde la pantalla de inicio.
*   **⚡ Carga Dinámica**: El sistema detecta y carga automáticamente los tests situados en la carpeta `src/tests`.
*   **🎮 Modo Interactivo**:
    *   Feedback inmediato (Correcto/Incorrecto).
    *   Explicaciones detalladas con soporte para bloques de código.
    *   Barra de progreso en tiempo real.
*   **📝 Creador de Tests**: Herramienta integrada para importar tests personalizados mediante JSON.
*   **🔍 Búsqueda Inteligente**: Filtra tests por título, descripción o temas.
*   **📱 Diseño Responsivo**: Interfaz adaptada a móviles y escritorio con estética moderna (Glassmorphism, gradientes).

---

## 🛠️ Tecnologías Usadas

*   **Frontend Framework**: [React 19](https://react.dev/)
*   **Build Tool**: [Vite](https://vitejs.dev/)
*   **Estilos**: [Tailwind CSS](https://tailwindcss.com/) (vía CDN para prototipado rápido)
*   **Iconos**: [Lucide React](https://lucide.dev/)

---

## 🚀 Comenzando

Sigue estos pasos para ejecutar el proyecto localmente:

### Prerrequisitos
*   Node.js (v18 o superior)
*   npm

### Instalación

1.  Clona el repositorio:
    ```bash
    git clone https://github.com/PeruvianKING/test-app.git
    cd test-app
    ```

2.  Instala las dependencias:
    ```bash
    npm install
    ```

3.  Inicia el servidor de desarrollo:
    ```bash
    npm run dev
    ```

---

## 📝 Añadir Nuevos Tests

Tienes dos formas de agregar contenido al sistema:

### 1. Método Automático (Recomendado)
Crea archivos `.json` dentro de la carpeta `src/tests`. El sistema organizará las subcarpetas automáticamente.

**Estructura de directorios:**
```text
src/
└── tests/
    ├── Historia/
    │   └── perú-siglo-xix.json
    └── Matemáticas/
        └── algebra-basica.json
```

### 2. Formato JSON Requerido
Copia y pega este formato para tus archivos de test:

```json
{
    "titulo": "Título del Test",
    "descripcion": "Breve descripción del contenido.",
    "examen_automatizacion": [
        {
            "id": "1",
            "pregunta": "¿Pregunta del examen?",
            "tema": "Categoría (opcional)",
            "opciones": {
                "a": "Primera opción",
                "b": "Segunda opción",
                "c": "Tercera opción",
                "d": "Cuarta opción"
            },
            "respuesta_correcta": "b",
            "explicacion": "Razón por la cual la respuesta es correcta. Soporta código entre backticks."
        }
    ]
}
```

> [!TIP]
> Puedes usar la interfaz gráfica (botón "Añadir Nuevo Test") para probar cuestionarios rápidamente sin crear archivos.

---

## 🤝 Contribución

¡Las contribuciones son bienvenidas! Por favor, abre un issue o envía un pull request para mejoras.

---

