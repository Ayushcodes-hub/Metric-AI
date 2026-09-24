-- Seed competitors
INSERT INTO competitors (name, slug, website)
VALUES 
  ('Acme Corp', 'acme-corp', 'https://acme.example.com'),
  ('Supabase', 'supabase', 'https://supabase.com'),
  ('Vercel', 'vercel', 'https://vercel.com')
ON CONFLICT (slug) DO NOTHING;

-- Seed signals
-- We use subqueries to get the competitor UUIDs dynamically
INSERT INTO signals (competitor_id, source, signal_type, raw_content, extracted_insight, strategic_implication, magnitude, sentiment, metadata, content_hash, signal_date)
VALUES
  (
    (SELECT id FROM competitors WHERE slug = 'acme-corp'),
    'pricing',
    'pricing_change',
    'Developer Flat Plan: $29/month flat pricing deprecated in favor of metered pricing.',
    'Acme Corp overhauled their database pricing model, deprecating flat host tiers in favor of dynamic compute-unit utility metrics.',
    'Acme is shifting targeting upmarket to capture heavy enterprise workloads. We should highlight our predictable cost structure.',
    0.9,
    -0.1,
    '{"diff": [{"type": "del", "num": 1, "text": "Developer Flat Plan: $29/month flat pricing"}]}',
    'hash_acme_pricing_1',
    NOW() - INTERVAL '4 hours'
  ),
  (
    (SELECT id FROM competitors WHERE slug = 'supabase'),
    'jobs',
    'hiring_spike',
    'Hiring principal database infrastructure engineers.',
    'Supabase published listings for 3 Principal Database Infrastructure Engineers specialized in pgvector and Raft consensus clusters.',
    'Indicates aggressive engineering efforts to support real-time vector indexing natively at scale. Suggests indexing limits on high concurrency workloads.',
    0.8,
    0.2,
    '{"department": "AI Infrastructure", "listings_count": 3}',
    'hash_supabase_jobs_1',
    NOW() - INTERVAL '1 day'
  ),
  (
    (SELECT id FROM competitors WHERE slug = 'vercel'),
    'github',
    'feature_launch',
    'Next.js v15.2.0-beta.0 released.',
    'Vercel tagged Next.js v15.2.0-beta.0 with integrated edge rendering database sync adapters.',
    'Closing the gap on cloud edge providers. Edge databases feel local. Local static templates should adapt quickly.',
    0.7,
    0.3,
    '{"repo": "vercel/next.js", "tag": "v15.2.0-beta.0"}',
    'hash_vercel_github_1',
    NOW() - INTERVAL '36 hours'
  )
ON CONFLICT (content_hash) DO NOTHING;
