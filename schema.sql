-- Setup schema for Autonomous Competitive Intelligence Engine

-- Enable UUID extension if not enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Core competitors registry
CREATE TABLE IF NOT EXISTS competitors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,           -- e.g. 'acme-corp'
  website TEXT NOT NULL,
  github_org TEXT,
  twitter_handle TEXT,
  g2_profile_url TEXT,
  linkedin_company_id TEXT,
  job_board_url TEXT,
  rss_feed_url TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. All signals from all streams land here
CREATE TABLE IF NOT EXISTS signals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  competitor_id UUID REFERENCES competitors(id) ON DELETE CASCADE,
  source TEXT NOT NULL,               -- 'pricing' | 'blog' | 'github' | 'jobs' | 'reviews' | 'community' | 'social'
  signal_type TEXT NOT NULL,          -- 'pricing_change' | 'feature_launch' | 'hiring_spike' | 'review_trend' | etc.
  raw_content TEXT,                   -- full raw text/HTML captured
  extracted_insight TEXT NOT NULL,    -- AI-extracted plain-English summary of what this means
  strategic_implication TEXT,         -- AI-inferred strategic meaning (set during synthesis)
  magnitude FLOAT DEFAULT 0.5,        -- 0.0–1.0 importance score
  sentiment FLOAT,                    -- -1.0 to 1.0 (for review/social signals)
  metadata JSONB DEFAULT '{}'::jsonb,  -- source-specific fields (e.g. GitHub commit hash, job URL, etc.)
  content_hash TEXT UNIQUE NOT NULL,  -- SHA-256 of raw_content for deduplication
  captured_at TIMESTAMPTZ DEFAULT NOW(),
  signal_date TIMESTAMPTZ NOT NULL    -- when the event actually happened
);

-- 3. Weekly synthesis outputs
CREATE TABLE IF NOT EXISTS briefings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  period_start TIMESTAMPTZ NOT NULL,
  period_end TIMESTAMPTZ NOT NULL,
  signal_count INT DEFAULT 0,
  briefing_markdown TEXT NOT NULL,    -- full AI-generated briefing
  briefing_json JSONB NOT NULL,       -- structured version for programmatic use
  top_competitor TEXT,                -- most active competitor this week
  urgency_high_count INT DEFAULT 0,
  urgency_medium_count INT DEFAULT 0,
  urgency_low_count INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Signal change log for pricing diffs
CREATE TABLE IF NOT EXISTS pricing_snapshots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  competitor_id UUID REFERENCES competitors(id) ON DELETE CASCADE,
  page_url TEXT NOT NULL,
  content_hash TEXT NOT NULL,
  raw_html TEXT NOT NULL,
  diff_from_previous TEXT,            -- unified diff string
  captured_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_signals_competitor ON signals(competitor_id);
CREATE INDEX IF NOT EXISTS idx_signals_source ON signals(source);
CREATE INDEX IF NOT EXISTS idx_signals_captured_at ON signals(captured_at DESC);
CREATE INDEX IF NOT EXISTS idx_signals_signal_date ON signals(signal_date DESC);
CREATE INDEX IF NOT EXISTS idx_signals_magnitude ON signals(magnitude DESC);
CREATE INDEX IF NOT EXISTS idx_pricing_snapshots_competitor_captured ON pricing_snapshots(competitor_id, captured_at DESC);
