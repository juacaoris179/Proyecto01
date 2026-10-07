# 🎮 Tres en Raya (Neon Deluxe Edition)

Un juego interactivo, moderno y elegante de **Tres en Raya (Tic-Tac-Toe)** desarrollado con **HTML5, CSS3 Glassmorphism y JavaScript Vanilla**.

![Vista previa](https://img.shields.io/badge/Estilo-Dark%20Glassmorphism-00f2fe?style=for-the-badge)
![Tecnología](https://img.shields.io/badge/Tecnolog%C3%ADas-HTML5%20%7C%20CSS3%20%7C%20JS-ff007f?style=for-the-badge)
![Licencia](https://img.shields.io/badge/Licencia-MIT-brightgreen?style=for-the-badge)

---

## ✨ Características Destacadas

- **Diseño Glassmorphism & Neón**:
  - Efectos visuales de desenfoque (`backdrop-filter`) y resplandores dinámicos (*neon glows*).
  - Trazo fluido animado en SVG para las fichas **X** (cian eléctrico) y **O** (magenta cósmico).
  - Línea ganadora animada con cálculo vectorial exacto.
  - Celebración con lluvia de confeti en Canvas en cada victoria.

- **Modos de Juego**:
  - 👥 **2 Jugadores (Local)**: Juega con un amigo en el mismo dispositivo por turnos.
  - 🤖 **Contra la IA**:
    - **Fácil**: Movimientos relajados y casuales.
    - **Normal**: Estratégico (bloquea y busca ganar, con margen de error humano).
    - **Imbatible (Minimax)**: Algoritmo óptimo invencible con poda alfa-beta.

- **Audio Integrado (Web Audio API)**:
  - Efectos de sonido sintetizados en tiempo real (clic, victoria, derrota, reinicio) sin depender de archivos de audio externos.
  - Botón para silenciar o reactivar el sonido en cualquier momento.

- **Marcador y Persistencia**:
  - Contador de victorias para X, O y empates guardado automáticamente en `localStorage`.
  - Botón para reiniciar estadísticas.

- **Totalmente Responsivo y Accesible**:
  - Adaptado a teléfonos móviles, tablets y pantallas de escritorio.
  - Atributos ARIA y soporte para navegación con teclado (`Tab`, `Enter`, `Espacio`).

---

## 🚀 Cómo Ejecutar

No requiere instalación de dependencias ni compilación.

### Opción 1: Apertura directa
Abre el archivo `index.html` con cualquier navegador web moderno (Chrome, Firefox, Edge, Safari).

### Opción 2: Con un servidor local
Si prefieres un servidor local ligero:

```bash
# Con npx serve o live-server:
npx serve .

# O con Python:
python -m http.server 8000
```

Luego abre tu navegador en `http://localhost:8000`.

---

## 📁 Estructura del Proyecto

```
Proyecto01/
├── index.html        # Estructura semántica, controles y tablero
├── style.css         # Sistema de diseño, temas glassmorphism y animaciones
├── js/
│   ├── audio.js      # Sintetizador de audio nativo (Web Audio API)
│   ├── confetti.js   # Generador de partículas de confeti en Canvas
│   ├── ai.js         # Algoritmos de IA (Fácil, Normal, Minimax)
│   └── app.js        # Lógica de juego, eventos y renderizado
└── README.md         # Documentación del proyecto
```
