CREATE TABLE voice_notes (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id          UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  mission_id       UUID NOT NULL REFERENCES missions(id) ON DELETE CASCADE,
  storage_path     TEXT NOT NULL,
  duration_seconds INT,
  created_at       TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE voice_notes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own voice notes"
  ON voice_notes FOR ALL
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());
