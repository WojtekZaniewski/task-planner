-- Missions table (active + completed per user)
CREATE TABLE missions (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  name            TEXT NOT NULL,
  target          INT NOT NULL,
  started_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  completed_at    TIMESTAMPTZ,          -- NULL = active mission
  deadline        DATE,
  money_goal      INT,
  money_balance   INT,
  tasks_completed INT,
  created_at      TIMESTAMPTZ DEFAULT now()
);

-- Enforce max one active mission per user at DB level
CREATE UNIQUE INDEX missions_one_active_per_user
  ON missions (user_id)
  WHERE completed_at IS NULL;

-- Thoughts tied to missions
CREATE TABLE mission_thoughts (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  mission_id  UUID NOT NULL REFERENCES missions(id) ON DELETE CASCADE,
  text        TEXT NOT NULL,
  created_at  TIMESTAMPTZ DEFAULT now()
);

-- RLS
ALTER TABLE missions ENABLE ROW LEVEL SECURITY;
ALTER TABLE mission_thoughts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own missions"
  ON missions FOR ALL
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users manage own mission thoughts"
  ON mission_thoughts FOR ALL
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());
