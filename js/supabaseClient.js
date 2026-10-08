/**
 * SupabaseClient - Gestor de persistencia en la nube para Tres en Raya.
 * Soporta modo desconectado / fallback local si las credenciales aún no se han configurado.
 */

class SupabaseService {
  constructor() {
    this.client = null;
    this.isConfigured = false;
    this.nicknameStorageKey = 'tictactoe_player_nickname';
    this.init();
  }

  init() {
    const config = window.SUPABASE_CONFIG;
    const hasValidConfig = config && 
      typeof config.url === 'string' && 
      config.url.startsWith('https://') && 
      typeof config.anonKey === 'string' && 
      config.anonKey.length > 20;

    if (hasValidConfig && window.supabase && typeof window.supabase.createClient === 'function') {
      try {
        this.client = window.supabase.createClient(config.url, config.anonKey);
        this.isConfigured = true;
        console.log('✅ Supabase conectado correctamente.');
      } catch (err) {
        console.warn('⚠️ Error al inicializar cliente de Supabase:', err);
        this.isConfigured = false;
      }
    } else {
      this.isConfigured = false;
      // Aviso amigable en consola
      console.info('ℹ️ Supabase no configurado o sin credenciales válidas en js/config.js. La partida se guardará en modo local.');
    }
  }

  getNickname() {
    return localStorage.getItem(this.nicknameStorageKey) || 'Jugador X';
  }

  setNickname(nickname) {
    const clean = (nickname || '').trim().substring(0, 25);
    if (clean) {
      localStorage.setItem(this.nicknameStorageKey, clean);
      return clean;
    }
    return this.getNickname();
  }

  /**
   * Guarda el resultado de una partida en Supabase
   */
  async recordGame({ winner, gameMode, aiDifficulty, totalMoves, durationSeconds, finalBoard, winningLine, playerXName, playerOName }) {
    if (!this.isConfigured || !this.client) {
      return { success: false, reason: 'unconfigured' };
    }

    try {
      // 1. Si el jugador humano es X, actualizar sus estadísticas
      const humanNick = this.getNickname();
      const isHumanX = true; // Por defecto el usuario local es Jugador X

      if (isHumanX && humanNick) {
        const isWin = winner === 'X';
        const isLoss = winner === 'O';
        const isTie = winner === 'tie';

        // Llamar a función RPC para actualizar jugador
        await this.client.rpc('record_match_result', {
          p_nickname: humanNick,
          p_is_win: isWin,
          p_is_loss: isLoss,
          p_is_tie: isTie
        });
      }

      // 2. Insertar registro de la partida en 'games'
      const { data, error } = await this.client
        .from('games')
        .insert([
          {
            player_x_name: playerXName || humanNick || 'Jugador X',
            player_o_name: playerOName || (gameMode === 'ai' ? 'IA' : 'Jugador O'),
            game_mode: gameMode,
            ai_difficulty: aiDifficulty || null,
            winner: winner,
            total_moves: totalMoves,
            duration_seconds: durationSeconds,
            final_board: finalBoard,
            winning_line: winningLine || null
          }
        ])
        .select();

      if (error) {
        console.warn('Error al guardar partida en Supabase:', error);
        return { success: false, error };
      }

      return { success: true, data };
    } catch (err) {
      console.warn('Excepción al registrar partida en Supabase:', err);
      return { success: false, error: err };
    }
  }

  /**
   * Obtiene la tabla de clasificación global (Top 50)
   */
  async fetchLeaderboard() {
    if (!this.isConfigured || !this.client) {
      return { success: false, reason: 'unconfigured', data: [] };
    }

    try {
      const { data, error } = await this.client
        .from('leaderboard')
        .select('*')
        .limit(50);

      if (error) {
        console.warn('Error al consultar leaderboard:', error);
        return { success: false, error, data: [] };
      }

      return { success: true, data: data || [] };
    } catch (err) {
      console.warn('Excepción al consultar leaderboard:', err);
      return { success: false, error: err, data: [] };
    }
  }
}

window.supabaseService = new SupabaseService();
