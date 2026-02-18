-- =============================================
-- TaskFlow - Initial Database Schema
-- Run this in Supabase SQL Editor
-- =============================================

-- Profiles (extends Supabase Auth users)
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Workspaces (coworking spaces)
CREATE TABLE workspaces (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  owner_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Workspace Members
CREATE TABLE workspace_members (
  workspace_id UUID REFERENCES workspaces(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('owner', 'admin', 'member')),
  joined_at TIMESTAMPTZ DEFAULT now(),
  PRIMARY KEY (workspace_id, user_id)
);

-- Workspace Invites (invite links)
CREATE TABLE workspace_invites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  code TEXT NOT NULL UNIQUE,
  created_by UUID NOT NULL REFERENCES profiles(id),
  expires_at TIMESTAMPTZ,
  max_uses INT,
  use_count INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Tasks (private and workspace)
CREATE TABLE tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'todo' CHECK (status IN ('todo', 'in_progress', 'done')),
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  due_date DATE,
  due_time TIME,
  workspace_id UUID REFERENCES workspaces(id) ON DELETE CASCADE,
  created_by UUID NOT NULL REFERENCES profiles(id),
  assigned_to UUID REFERENCES profiles(id),
  position INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Thoughts (shared thoughts / goals / achievements)
CREATE TABLE thoughts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'thought' CHECK (type IN ('thought', 'goal', 'achievement')),
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  created_by UUID NOT NULL REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- =============================================
-- Row Level Security
-- =============================================

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE workspaces ENABLE ROW LEVEL SECURITY;
ALTER TABLE workspace_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE workspace_invites ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE thoughts ENABLE ROW LEVEL SECURITY;

-- Profiles
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

-- Allow viewing profiles of workspace co-members
CREATE POLICY "Users can view co-member profiles"
  ON profiles FOR SELECT
  USING (
    id IN (
      SELECT wm2.user_id FROM workspace_members wm1
      JOIN workspace_members wm2 ON wm1.workspace_id = wm2.workspace_id
      WHERE wm1.user_id = auth.uid()
    )
  );

-- Workspaces
CREATE POLICY "Members can view workspaces"
  ON workspaces FOR SELECT
  USING (id IN (SELECT workspace_id FROM workspace_members WHERE user_id = auth.uid()));

CREATE POLICY "Authenticated users can create workspaces"
  ON workspaces FOR INSERT
  WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Owners can update workspaces"
  ON workspaces FOR UPDATE
  USING (owner_id = auth.uid());

CREATE POLICY "Owners can delete workspaces"
  ON workspaces FOR DELETE
  USING (owner_id = auth.uid());

-- Workspace Members
CREATE POLICY "Members can view workspace members"
  ON workspace_members FOR SELECT
  USING (workspace_id IN (SELECT workspace_id FROM workspace_members WHERE user_id = auth.uid()));

CREATE POLICY "Members can insert themselves"
  ON workspace_members FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Owners can manage members"
  ON workspace_members FOR DELETE
  USING (
    workspace_id IN (
      SELECT id FROM workspaces WHERE owner_id = auth.uid()
    )
    OR user_id = auth.uid()
  );

-- Workspace Invites
CREATE POLICY "Members can view invites"
  ON workspace_invites FOR SELECT
  USING (workspace_id IN (SELECT workspace_id FROM workspace_members WHERE user_id = auth.uid()));

CREATE POLICY "Anyone can view invite by code"
  ON workspace_invites FOR SELECT
  USING (true);

CREATE POLICY "Members can create invites"
  ON workspace_invites FOR INSERT
  WITH CHECK (
    workspace_id IN (SELECT workspace_id FROM workspace_members WHERE user_id = auth.uid())
  );

CREATE POLICY "Owners can delete invites"
  ON workspace_invites FOR DELETE
  USING (
    workspace_id IN (SELECT id FROM workspaces WHERE owner_id = auth.uid())
  );

CREATE POLICY "Anyone can update invite use_count"
  ON workspace_invites FOR UPDATE
  USING (true)
  WITH CHECK (true);

-- Tasks: Private
CREATE POLICY "Users can manage private tasks"
  ON tasks FOR ALL
  USING (workspace_id IS NULL AND created_by = auth.uid());

-- Tasks: Workspace
CREATE POLICY "Members can view workspace tasks"
  ON tasks FOR SELECT
  USING (workspace_id IN (SELECT workspace_id FROM workspace_members WHERE user_id = auth.uid()));

CREATE POLICY "Members can create workspace tasks"
  ON tasks FOR INSERT
  WITH CHECK (workspace_id IN (SELECT workspace_id FROM workspace_members WHERE user_id = auth.uid()));

CREATE POLICY "Members can update workspace tasks"
  ON tasks FOR UPDATE
  USING (workspace_id IN (SELECT workspace_id FROM workspace_members WHERE user_id = auth.uid()));

CREATE POLICY "Members can delete workspace tasks"
  ON tasks FOR DELETE
  USING (workspace_id IN (SELECT workspace_id FROM workspace_members WHERE user_id = auth.uid()));

-- Thoughts
CREATE POLICY "Members can view thoughts"
  ON thoughts FOR SELECT
  USING (workspace_id IN (SELECT workspace_id FROM workspace_members WHERE user_id = auth.uid()));

CREATE POLICY "Members can create thoughts"
  ON thoughts FOR INSERT
  WITH CHECK (workspace_id IN (SELECT workspace_id FROM workspace_members WHERE user_id = auth.uid()));

CREATE POLICY "Creator can delete thoughts"
  ON thoughts FOR DELETE
  USING (created_by = auth.uid());

-- =============================================
-- Triggers
-- =============================================

-- Auto-create profile on user signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, full_name, avatar_url)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();

-- Auto-update updated_at on tasks
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER tasks_updated_at
  BEFORE UPDATE ON tasks
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- =============================================
-- Enable Realtime
-- =============================================

ALTER PUBLICATION supabase_realtime ADD TABLE tasks;
ALTER PUBLICATION supabase_realtime ADD TABLE thoughts;
