-- ============================================================================
-- TRES EN RAYA (NEON DELUXE) - ESQUEMA DE BASE DE DATOS SUPABASE (POSTGRESQL)
-- ============================================================================
-- Este script crea las tablas, índices, políticas de seguridad RLS y vistas
-- necesarias para guardar jugadores, partidas y la clasificación global.
--
-- INSTRUCCIONES:
-- 1. Ve a tu panel de Supabase: https://supabase.com/dashboard
-- 2. Entra en tu proyecto y selecciona "SQL Editor" en el menú izquierdo.
-- 3. Pega todo este archivo y presiona "Run".
-- ============================================================================

-- 1. Habilitar extensión UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- 2. TABLA: players (Perfiles y Estadísticas Acumuladas)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.players (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nickname TEXT NOT NULL UNIQUE,
    games_played INT NOT NULL DEFAULT 0,
    wins INT NOT NULL DEFAULT 0,
    losses INT NOT NULL DEFAULT 0,
    ties INT NOT NULL DEFAULT 0,
    current_streak INT NOT NULL DEFAULT 0,
    max_streak INT NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    last_active TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    CONSTRAINT nickname_length CHECK (char_length(nickname) >= 2 AND char_length(nickname) <= 25)
);

-- ============================================================================
-- 3. TABLA: games (Historial Detallado de Partidas)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.games (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    player_x_id UUID REFERENCES public.players(id) ON DELETE SET NULL,
    player_o_id UUID REFERENCES public.players(id) ON DELETE SET NULL,
    player_x_name TEXT NOT NULL DEFAULT 'Jugador X',
    player_o_name TEXT NOT NULL DEFAULT 'IA (O)',
    game_mode TEXT NOT NULL CHECK (game_mode IN ('pvp', 'ai', 'online')),
    ai_difficulty TEXT CHECK (ai_difficulty IN ('easy', 'normal', 'hard')),
    winner TEXT NOT NULL CHECK (winner IN ('X', 'O', 'tie')),
    total_moves INT NOT NULL CHECK (total_moves BETWEEN 5 AND 9),
    duration_seconds INT NOT NULL DEFAULT 0,
    final_board JSONB NOT NULL,
    winning_line INT[] DEFAULT NULL,
    played_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- ============================================================================
-- 4. ÍNDICES PARA CONSULTAS RÁPIDAS
-- ============================================================================
CREATE INDEX IF NOT EXISTS idx_players_wins ON public.players (wins DESC);
CREATE INDEX IF NOT EXISTS idx_players_max_streak ON public.players (max_streak DESC);
CREATE INDEX IF NOT EXISTS idx_games_played_at ON public.games (played_at DESC);
CREATE INDEX IF NOT EXISTS idx_games_mode ON public.games (game_mode);

-- ============================================================================
-- 5. SEGURIDAD: POLÍTICAS ROW LEVEL SECURITY (RLS)
-- ============================================================================
-- Permite que los clientes web (con clave anon pública) puedan leer y escribir
-- de forma segura en las tablas sin exponer permisos destructivos.

ALTER TABLE public.players ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.games ENABLE ROW LEVEL SECURITY;

-- Políticas para 'players':
DROP POLICY IF EXISTS "Lectura pública de jugadores" ON public.players;
CREATE POLICY "Lectura pública de jugadores"
    ON public.players FOR SELECT
    USING (true);

DROP POLICY IF EXISTS "Inserción pública de jugadores" ON public.players;
CREATE POLICY "Inserción pública de jugadores"
    ON public.players FOR INSERT
    WITH CHECK (true);

DROP POLICY IF EXISTS "Actualización de estadísticas de jugadores" ON public.players;
CREATE POLICY "Actualización de estadísticas de jugadores"
    ON public.players FOR UPDATE
    USING (true);

-- Políticas para 'games':
DROP POLICY IF EXISTS "Lectura pública de partidas" ON public.games;
CREATE POLICY "Lectura pública de partidas"
    ON public.games FOR SELECT
    USING (true);

DROP POLICY IF EXISTS "Inserción pública de partidas" ON public.games;
CREATE POLICY "Inserción pública de partidas"
    ON public.games FOR INSERT
    WITH CHECK (true);

-- ============================================================================
-- 6. VISTA: leaderboard (Top 50 Clasificación Global)
-- ============================================================================
CREATE OR REPLACE VIEW public.leaderboard AS
SELECT 
    id,
    nickname,
    wins,
    losses,
    ties,
    games_played,
    current_streak,
    max_streak,
    CASE 
        WHEN games_played > 0 THEN ROUND((wins::decimal / games_played) * 100, 1)
        ELSE 0 
    END AS win_rate_percentage,
    last_active
FROM public.players
ORDER BY wins DESC, max_streak DESC, games_played ASC
LIMIT 50;

-- ============================================================================
-- 7. FUNCIÓN RPC: registrar o actualizar resultado de jugador
-- ============================================================================
-- Permite actualizar de forma atómica las estadísticas del jugador al terminar
-- una partida, calculando rachas y victorias de manera consistente.
CREATE OR REPLACE FUNCTION public.record_match_result(
    p_nickname TEXT,
    p_is_win BOOLEAN,
    p_is_loss BOOLEAN,
    p_is_tie BOOLEAN
)
RETURNS public.players AS $$
DECLARE
    v_player public.players;
BEGIN
    -- Asegurar o insertar jugador
    INSERT INTO public.players (nickname, games_played, wins, losses, ties, current_streak, max_streak, last_active)
    VALUES (
        p_nickname,
        1,
        CASE WHEN p_is_win THEN 1 ELSE 0 END,
        CASE WHEN p_is_loss THEN 1 ELSE 0 END,
        CASE WHEN p_is_tie THEN 1 ELSE 0 END,
        CASE WHEN p_is_win THEN 1 ELSE 0 END,
        CASE WHEN p_is_win THEN 1 ELSE 0 END,
        timezone('utc'::text, now())
    )
    ON CONFLICT (nickname) DO UPDATE SET
        games_played = public.players.games_played + 1,
        wins = public.players.wins + (CASE WHEN p_is_win THEN 1 ELSE 0 END),
        losses = public.players.losses + (CASE WHEN p_is_loss THEN 1 ELSE 0 END),
        ties = public.players.ties + (CASE WHEN p_is_tie THEN 1 ELSE 0 END),
        current_streak = CASE 
            WHEN p_is_win THEN public.players.current_streak + 1 
            WHEN p_is_loss THEN 0 
            ELSE public.players.current_streak 
        END,
        max_streak = GREATEST(
            public.players.max_streak, 
            CASE WHEN p_is_win THEN public.players.current_streak + 1 ELSE public.players.max_streak END
        ),
        last_active = timezone('utc'::text, now())
    RETURNING * INTO v_player;

    RETURN v_player;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
