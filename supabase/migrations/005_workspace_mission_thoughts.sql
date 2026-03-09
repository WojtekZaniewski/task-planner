-- =============================================
-- Workspace Mission Thoughts
-- Run this in Supabase SQL Editor
-- =============================================

CREATE TABLE workspace_mission_thoughts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_mission_id UUID NOT NULL REFERENCES workspace_missions(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id),
  text TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE workspace_mission_thoughts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Members can view workspace mission thoughts"
  ON workspace_mission_thoughts FOR SELECT
  USING (
    workspace_mission_id IN (
      SELECT wm.id FROM workspace_missions wm
      JOIN workspace_members wmem ON wmem.workspace_id = wm.workspace_id
      WHERE wmem.user_id = auth.uid()
    )
  );

CREATE POLICY "Members can add workspace mission thoughts"
  ON workspace_mission_thoughts FOR INSERT
  WITH CHECK (
    user_id = auth.uid() AND
    workspace_mission_id IN (
      SELECT wm.id FROM workspace_missions wm
      JOIN workspace_members wmem ON wmem.workspace_id = wm.workspace_id
      WHERE wmem.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete own workspace mission thoughts"
  ON workspace_mission_thoughts FOR DELETE
  USING (user_id = auth.uid());
