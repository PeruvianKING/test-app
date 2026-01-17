# Test App
## Setup
- npm install
- npm run dev

## Añadir tests
- Crear una carpeta en /tests
- Añadir un archivo .json con el siguiente formato:
    ```json
    {
        "titulo": "Test de ejemplo",
        "descripcion": "Test de ejemplo",
        "examen_automatizacion": [
            {
                "id": "1",
                "pregunta": "¿Cuál es la capital de Perú?",
                "opciones": {
                    "a": "Lima",
                    "b": "Arequipa",
                    "c": "Cusco",
                    "d": "Trujillo"
                },
                "respuesta_correcta": "a",
                "explicacion": "Lima es la capital de Perú"
            }
        ]
    }
    ```

