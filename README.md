# 🎮 Tres en Raya (Neon Deluxe Edition)

Un juego interactivo, moderno y elegante de **Tres en Raya (Tic-Tac-Toe)** desarrollado con **HTML5, CSS3 Glassmorphism, JavaScript Vanilla y persistencia en la nube con Supabase (PostgreSQL)**.

![Estilo](https://img.shields.io/badge/Estilo-Dark%20Glassmorphism-00f2fe?style=for-the-badge)
![Base de Datos](https://img.shields.io/badge/Base%20de%20Datos-Supabase%20%7C%20PostgreSQL-34d399?style=for-the-badge)
![Tecnologías](https://img.shields.io/badge/Tecnolog%C3%ADas-HTML5%20%7C%20CSS3%20%7C%20JS-ff007f?style=for-the-badge)
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

- **☁️ Persistencia y Clasificación con Supabase**:
  - **Tabla `players`**: Apodos de jugadores, partidas jugadas, victorias, derrotas, empates, racha actual y récord histórico.
  - **Tabla `games`**: Registro detallado de cada partida (duración, número de jugadas, tablero final, modo, dificultad y fecha).
  - **🏆 Leaderboard Global (Top 50)**: Clasificación pública en tiempo real con medallas (🥇, 🥈, 🥉), cálculo automático de *Win Rate %* y resalte de tu posición.
  - **Modo Resiliente / Offline Fallback**: Si las claves de Supabase no están configuradas, el juego sigue funcionando 100% en modo local sin bloqueos ni errores.

- **Audio Integrado (Web Audio API)**:
  - Efectos de sonido sintetizados en tiempo real (clic, victoria, derrota, reinicio) sin archivos externos.
  - Control de volumen / silenciar.

- **Totalmente Responsivo y Accesible**:
  - Adaptado a teléfonos móviles, tablets y pantallas de escritorio.
  - Atributos ARIA y soporte para navegación con teclado (`Tab`, `Enter`, `Espacio`).

---

## 🗄️ Esquema de Base de Datos (Supabase)

El archivo `supabase_schema.sql` define la estructura relacional completa en PostgreSQL:

| Objeto | Tipo | Descripción |
| :--- | :--- | :--- |
| **`players`** | Tabla | Perfiles con apodo único, estadísticas acumuladas y rachas de victorias. |
| **`games`** | Tabla | Historial completo de cada partida con estado final del tablero y duración. |
| **`leaderboard`** | Vista | Top 50 jugadores ordenados por victorias, racha máxima y tasa de victoria. |
| **`record_match_result`** | Función RPC | Actualización atómica de estadísticas y cálculo de rachas al terminar una partida. |
| **RLS Policies** | Seguridad | Políticas de lectura e inserción pública seguras para el cliente web. |

---

## ⚡ Cómo Conectar Supabase en 2 Minutos

1. Crea una cuenta gratuita en [https://supabase.com](https://supabase.com) e inicia un nuevo proyecto.
2. En el panel de Supabase, ve a **SQL Editor** en el menú izquierdo.
3. Copia todo el contenido del archivo [`supabase_schema.sql`](supabase_schema.sql), pégalo en el editor y pulsa **Run**.
4. Ve a **Project Settings -> API** y copia:
   - **Project URL**
   - **Project API Keys -> `anon` `public`**
5. Abre [`js/config.js`](js/config.js) y pega tus credenciales:
   ```javascript
   window.SUPABASE_CONFIG = {
     url: 'https://tu-proyecto.supabase.co',
     anonKey: 'tu-anon-key-aqui'
   };
   ```
6. ¡Listo! Abre el juego y pulsa el botón **🏆** para ver la clasificación global en tiempo real.

---

## 🚀 Cómo Ejecutar Localmente

### Opción 1: Apertura directa
Abre el archivo `index.html` con cualquier navegador web moderno (doble clic).

### Opción 2: Con un servidor local
```bash
# Con Python:
python -m http.server 8000

# O con npx serve:
npx serve .
```
Luego abre `http://localhost:8000`.

---

## 📁 Estructura del Proyecto

```
Proyecto01/
├── index.html            # Estructura semántica, controles, tablero y modal de leaderboard
├── style.css             # Sistema de diseño Neon Glassmorphism y estilos de ranking
├── supabase_schema.sql   # Script SQL con tablas, índices, RLS y vistas para Supabase
├── js/
│   ├── config.js         # Configuración de credenciales de Supabase
│   ├── supabaseClient.js # Cliente y servicio de persistencia en la nube
│   ├── audio.js          # Sintetizador de audio nativo (Web Audio API)
│   ├── confetti.js       # Generador de partículas de confeti en Canvas
│   ├── ai.js             # Algoritmos de IA (Fácil, Normal, Minimax)
│   └── app.js            # Controlador principal del juego y ranking
└── README.md             # Documentación del proyecto
```
