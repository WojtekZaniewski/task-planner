-- =============================================
-- Workspace Missions
-- Run this in Supabase SQL Editor
-- =============================================

CREATE TABLE workspace_missions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  target INT NOT NULL DEFAULT 10,
  started_at TIMESTAMPTZ DEFAULT now(),
  completed_at TIMESTAMPTZ,
  deadline DATE,
  money_goal INT,
  money_balance INT,
  tasks_completed INT DEFAULT 0,
  created_by UUID NOT NULL REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE workspace_missions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Members can view workspace missions"
  ON workspace_missions FOR SELECT
  USING (workspace_id IN (SELECT workspace_id FROM workspace_members WHERE user_id = auth.uid()));

CREATE POLICY "Members can manage workspace missions"
  ON workspace_missions FOR ALL
  USING (workspace_id IN (SELECT workspace_id FROM workspace_members WHERE user_id = auth.uid()));
