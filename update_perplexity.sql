UPDATE signals
SET metadata = '{"plan_name": "Pro Plan", "diff": [{"type": "del", "num": 1, "text": "Pro Plan: $20/month flat rate (unlimited search)"}, {"type": "add", "num": 1, "text": "Pro Plan: $20/month flat rate"}, {"type": "add", "num": 2, "text": "Bundled API Allocation: $5/month developer credits included"}]}'
WHERE content_hash = 'hash_perplexity_pricing_change';
