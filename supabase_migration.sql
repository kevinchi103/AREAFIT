-- ============================================================
-- AREAFIT — Migración completa
-- Ejecutar en Supabase SQL Editor (https://supabase.com/dashboard)
-- ============================================================

-- ─── 1. NUEVAS TABLAS ───────────────────────────────────────

-- Entrenamientos personalizados creados por el admin/entrenador
CREATE TABLE IF NOT EXISTS custom_workouts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_by UUID REFERENCES auth.users(id),
  name TEXT NOT NULL,
  description TEXT,
  exercises JSONB NOT NULL DEFAULT '[]',
  -- [{name, reps, sets, rest_seconds, duration_seconds, muscles, difficulty, name_ca, name_en}]
  xp_multiplier FLOAT DEFAULT 1.0,
  difficulty TEXT DEFAULT 'medium' CHECK (difficulty IN ('easy', 'medium', 'hard', 'elite')),
  is_template BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Asignaciones de entrenamientos a usuarios
CREATE TABLE IF NOT EXISTS workout_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  workout_id UUID REFERENCES custom_workouts(id) ON DELETE CASCADE,
  assigned_by UUID REFERENCES auth.users(id),
  day_of_week INT CHECK (day_of_week BETWEEN 0 AND 6),
  -- 0=lunes, 6=domingo. NULL = cualquier día
  week_number INT,
  -- semana del programa. NULL = recurrente
  start_date DATE,
  end_date DATE,
  is_active BOOLEAN DEFAULT true,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Feedback del usuario sobre entrenamientos
CREATE TABLE IF NOT EXISTS workout_feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  workout_id UUID REFERENCES custom_workouts(id) ON DELETE CASCADE,
  difficulty_rating INT CHECK (difficulty_rating BETWEEN 1 AND 5),
  energy_level INT CHECK (energy_level BETWEEN 1 AND 5),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Notificaciones in-app
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL DEFAULT 'info',
  -- tipos: info, achievement, league, trainer, reminder
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  data JSONB DEFAULT '{}',
  read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ─── 2. COLUMNAS NUEVAS EN TABLAS EXISTENTES ────────────────

-- subscriptions: añadir expires_at si no existe
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
    WHERE table_name = 'subscriptions' AND column_name = 'expires_at') THEN
    ALTER TABLE subscriptions ADD COLUMN expires_at TIMESTAMPTZ;
  END IF;
END $$;

-- achievements: añadir campos descriptivos
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
    WHERE table_name = 'achievements' AND column_name = 'achievement_type') THEN
    ALTER TABLE achievements ADD COLUMN achievement_type TEXT;
  END IF;
END $$;

-- users: añadir campo role para admin
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
    WHERE table_name = 'users' AND column_name = 'role') THEN
    ALTER TABLE users ADD COLUMN role TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin', 'trainer'));
  END IF;
END $$;

-- ─── 3. ÍNDICES ─────────────────────────────────────────────

CREATE INDEX IF NOT EXISTS idx_custom_workouts_created_by ON custom_workouts(created_by);
CREATE INDEX IF NOT EXISTS idx_workout_assignments_user ON workout_assignments(user_id);
CREATE INDEX IF NOT EXISTS idx_workout_assignments_workout ON workout_assignments(workout_id);
CREATE INDEX IF NOT EXISTS idx_workout_assignments_active ON workout_assignments(user_id, is_active);
CREATE INDEX IF NOT EXISTS idx_workout_feedback_user ON workout_feedback(user_id);
CREATE INDEX IF NOT EXISTS idx_workout_feedback_workout ON workout_feedback(workout_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id, read);
CREATE INDEX IF NOT EXISTS idx_notifications_created ON notifications(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_points_history_user ON points_history(user_id);
CREATE INDEX IF NOT EXISTS idx_workout_sessions_user ON workout_sessions(user_id);

-- ─── 4. DEFINICIONES DE LOGROS ──────────────────────────────

-- Tabla de definición de logros (catálogo)
CREATE TABLE IF NOT EXISTS achievement_definitions (
  id TEXT PRIMARY KEY,
  -- ej: 'first_spark', 'on_fire', 'unstoppable'
  icon TEXT NOT NULL,
  name_es TEXT NOT NULL,
  name_ca TEXT NOT NULL,
  name_en TEXT NOT NULL,
  desc_es TEXT NOT NULL,
  desc_ca TEXT NOT NULL,
  desc_en TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'general',
  -- streak, phase, league, xp, special
  xp_reward INT DEFAULT 0,
  sort_order INT DEFAULT 0
);

-- Insertar definiciones de logros
INSERT INTO achievement_definitions (id, icon, name_es, name_ca, name_en, desc_es, desc_ca, desc_en, category, xp_reward, sort_order)
VALUES
  ('first_spark',   '🔥', 'Primera chispa',   'Primera espurna',   'First spark',    'Completa tu primer entrenamiento',           'Completa el teu primer entrenament',           'Complete your first workout',          'general', 50,  1),
  ('on_fire',       '🔥', 'En llamas',        'En flames',         'On fire',        'Racha de 7 días',                            'Ratxa de 7 dies',                              '7-day streak',                         'streak',  100, 2),
  ('unstoppable',   '🔥', 'Imparable',        'Imparable',         'Unstoppable',    'Racha de 30 días',                           'Ratxa de 30 dies',                             '30-day streak',                        'streak',  500, 3),
  ('beginner_done', '💪', 'Principiante',     'Principiant',       'Beginner',       'Completa la fase Principiante',               'Completa la fase Principiant',                 'Complete Beginner phase',              'phase',   200, 4),
  ('inter_done',    '💪', 'Intermedio',       'Intermedi',         'Intermediate',   'Completa la fase Intermedia',                 'Completa la fase Intermèdia',                  'Complete Intermediate phase',          'phase',   300, 5),
  ('advanced_done', '💪', 'Avanzado',         'Avançat',           'Advanced',       'Completa la fase Avanzada',                   'Completa la fase Avançada',                    'Complete Advanced phase',              'phase',   400, 6),
  ('elite_done',    '💪', 'Élite',            'Èlit',              'Elite',          'Completa las 20 semanas',                     'Completa les 20 setmanes',                     'Complete all 20 weeks',               'phase',   1000,7),
  ('silver_league', '🏆', 'Primera liga',     'Primera lliga',     'First league',   'Entra en liga Plata',                         'Entra a la lliga Plata',                       'Enter Silver league',                  'league',  150, 8),
  ('diamond_league','🏆', 'Campeón',          'Campió',            'Champion',       'Llega a liga Diamante',                       'Arriba a la lliga Diamant',                    'Reach Diamond league',                'league',  500, 9),
  ('xp_1000',       '⚡', 'Mil puntos',       'Mil punts',         'Thousand points','Acumula 1.000 XP',                           'Acumula 1.000 XP',                             'Accumulate 1,000 XP',                 'xp',      0,   10),
  ('xp_10000',      '⚡', 'Diez mil',         'Deu mil',           'Ten thousand',   'Acumula 10.000 XP',                          'Acumula 10.000 XP',                            'Accumulate 10,000 XP',                'xp',      0,   11),
  ('early_bird',    '📅', 'Madrugador',       'Matiner',           'Early bird',     'Entrena antes de las 7am',                    'Entrena abans de les 7am',                     'Work out before 7am',                 'special', 75,  12),
  ('night_owl',     '📅', 'Noctámbulo',       'Noctàmbul',         'Night owl',      'Entrena después de las 22pm',                 'Entrena després de les 22h',                   'Work out after 10pm',                 'special', 75,  13),
  ('consistent',    '🗓️', 'Constante',         'Constant',          'Consistent',     'Entrena 4+ días en una semana',               'Entrena 4+ dies en una setmana',               'Train 4+ days in a week',             'special', 100, 14),
  ('premium_user',  '👑', 'Premium',          'Premium',           'Premium',        'Activa suscripción premium',                  'Activa subscripció premium',                   'Activate premium subscription',       'special', 0,   15)
ON CONFLICT (id) DO NOTHING;

-- ─── 5. MARCAR ADMIN ────────────────────────────────────────

-- Marcar kevinchi_90@hotmail.com como admin (ejecutar después de que se registre)
UPDATE users SET role = 'admin' WHERE email = 'kevinchi_90@hotmail.com';

-- ─── 6. RLS POLICIES ────────────────────────────────────────

-- Función helper para detectar admin
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM users
    WHERE id = auth.uid() AND role = 'admin'
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- ── users ──
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can read all profiles" ON users;
DROP POLICY IF EXISTS "Users can update own profile" ON users;
DROP POLICY IF EXISTS "Users can insert own profile" ON users;

CREATE POLICY "Users can read all profiles" ON users
  FOR SELECT USING (true);
  -- Ranking público: todos pueden ver a todos

CREATE POLICY "Users can insert own profile" ON users
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON users
  FOR UPDATE USING (auth.uid() = id OR is_admin());

-- ── workout_sessions ──
ALTER TABLE workout_sessions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users manage own sessions" ON workout_sessions;
DROP POLICY IF EXISTS "Admin reads all sessions" ON workout_sessions;

CREATE POLICY "Users manage own sessions" ON workout_sessions
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Admin reads all sessions" ON workout_sessions
  FOR SELECT USING (is_admin());

-- ── points_history ──
ALTER TABLE points_history ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users manage own points" ON points_history;
DROP POLICY IF EXISTS "Admin reads all points" ON points_history;

CREATE POLICY "Users manage own points" ON points_history
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Admin reads all points" ON points_history
  FOR SELECT USING (is_admin());

-- ── subscriptions ──
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users read own subscription" ON subscriptions;
DROP POLICY IF EXISTS "Admin manages subscriptions" ON subscriptions;

CREATE POLICY "Users read own subscription" ON subscriptions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Admin manages subscriptions" ON subscriptions
  FOR ALL USING (is_admin());

-- ── achievements ──
ALTER TABLE achievements ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users read own achievements" ON achievements;
DROP POLICY IF EXISTS "System inserts achievements" ON achievements;

CREATE POLICY "Users read own achievements" ON achievements
  FOR SELECT USING (auth.uid() = user_id OR is_admin());

CREATE POLICY "System inserts achievements" ON achievements
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- ── achievement_definitions ──
ALTER TABLE achievement_definitions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Anyone can read definitions" ON achievement_definitions;
DROP POLICY IF EXISTS "Admin manages definitions" ON achievement_definitions;

CREATE POLICY "Anyone can read definitions" ON achievement_definitions
  FOR SELECT USING (true);

CREATE POLICY "Admin manages definitions" ON achievement_definitions
  FOR ALL USING (is_admin());

-- ── custom_workouts ──
ALTER TABLE custom_workouts ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Admin manages custom workouts" ON custom_workouts;
DROP POLICY IF EXISTS "Users read assigned workouts" ON custom_workouts;

CREATE POLICY "Admin manages custom workouts" ON custom_workouts
  FOR ALL USING (is_admin());

CREATE POLICY "Users read assigned workouts" ON custom_workouts
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM workout_assignments wa
      WHERE wa.workout_id = custom_workouts.id
        AND wa.user_id = auth.uid()
        AND wa.is_active = true
    )
  );

-- ── workout_assignments ──
ALTER TABLE workout_assignments ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Admin manages assignments" ON workout_assignments;
DROP POLICY IF EXISTS "Users read own assignments" ON workout_assignments;

CREATE POLICY "Admin manages assignments" ON workout_assignments
  FOR ALL USING (is_admin());

CREATE POLICY "Users read own assignments" ON workout_assignments
  FOR SELECT USING (auth.uid() = user_id);

-- ── workout_feedback ──
ALTER TABLE workout_feedback ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users manage own feedback" ON workout_feedback;
DROP POLICY IF EXISTS "Admin reads all feedback" ON workout_feedback;

CREATE POLICY "Users manage own feedback" ON workout_feedback
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Admin reads all feedback" ON workout_feedback
  FOR SELECT USING (is_admin());

-- ── notifications ──
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users read own notifications" ON notifications;
DROP POLICY IF EXISTS "Users update own notifications" ON notifications;
DROP POLICY IF EXISTS "Admin manages notifications" ON notifications;

CREATE POLICY "Users read own notifications" ON notifications
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users update own notifications" ON notifications
  FOR UPDATE USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admin manages notifications" ON notifications
  FOR ALL USING (is_admin());

-- ── league_users ──
ALTER TABLE league_users ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public read league users" ON league_users;
DROP POLICY IF EXISTS "Users manage own league entry" ON league_users;

CREATE POLICY "Public read league users" ON league_users
  FOR SELECT USING (true);

CREATE POLICY "Users manage own league entry" ON league_users
  FOR ALL USING (auth.uid() = user_id);

-- ── rankings ──
ALTER TABLE rankings ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public read rankings" ON rankings;

CREATE POLICY "Public read rankings" ON rankings
  FOR SELECT USING (true);

-- ── leagues ──
ALTER TABLE leagues ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public read leagues" ON leagues;

CREATE POLICY "Public read leagues" ON leagues
  FOR SELECT USING (true);

-- ============================================================
-- CHAT ENTRENADOR PERSONAL
-- ============================================================

CREATE TABLE IF NOT EXISTS chat_messages (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id          uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  content          text NOT NULL,
  is_from_trainer  boolean DEFAULT false,
  read             boolean DEFAULT false,
  created_at       timestamptz DEFAULT now()
);

-- Index para consultas rápidas por usuario
CREATE INDEX IF NOT EXISTS idx_chat_messages_user_id ON chat_messages(user_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_created_at ON chat_messages(created_at);

-- RLS: usuarios solo ven sus propios mensajes
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users see own messages"
  ON chat_messages FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users insert own messages"
  ON chat_messages FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users update own messages (mark read)"
  ON chat_messages FOR UPDATE
  USING (auth.uid() = user_id);

-- Admin puede ver y escribir en todos los chats
CREATE POLICY "Admin full access"
  ON chat_messages FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.email = 'kevinchi_90@hotmail.com'
    )
  );

-- Realtime habilitado para esta tabla
ALTER PUBLICATION supabase_realtime ADD TABLE chat_messages;

-- ============================================================
-- ¡LISTO! Ejecuta este SQL completo en Supabase SQL Editor
-- Después registrate con kevinchi_90@hotmail.com en la app
-- y tu usuario será marcado como admin automáticamente
-- ============================================================
