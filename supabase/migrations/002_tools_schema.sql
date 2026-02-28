-- =============================================
-- TaskFlow - Tools Schema (Saved Analyses)
-- Run this in Supabase SQL Editor
-- =============================================

-- Saved analyses / tool results
CREATE TABLE saved_analyses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type TEXT NOT NULL CHECK (type IN ('financial_ratios', 'brand_validation', 'dcf_model')),
  name TEXT NOT NULL,
  data JSONB NOT NULL,
  created_by UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE saved_analyses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own analyses"
  ON saved_analyses FOR ALL
  USING (created_by = auth.uid());

CREATE TRIGGER saved_analyses_updated_at
  BEFORE UPDATE ON saved_analyses
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();
