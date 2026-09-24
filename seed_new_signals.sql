INSERT INTO signals (competitor_id, source, signal_type, raw_content, extracted_insight, strategic_implication, magnitude, sentiment, metadata, content_hash, signal_date)
VALUES
  (
    (SELECT id FROM competitors WHERE slug = 'openai'),
    'blog',
    'product_launch',
    'OpenAI launches GPT-5 with multimodal capabilities.',
    'OpenAI launched their next-generation foundation model GPT-5 with native video and audio integration.',
    'Puts pressure on our model latency requirements. We need to optimize our inference pipelines.',
    0.95,
    0.8,
    '{"model_name": "GPT-5"}',
    'hash_openai_gpt5_launch',
    NOW() - INTERVAL '1 day'
  ),
  (
    (SELECT id FROM competitors WHERE slug = 'perplexity'),
    'pricing',
    'pricing_change',
    'Perplexity Pro yearly plan updated.',
    'Perplexity updated their Pro plan pricing to include a bundled API credit allocation for developers.',
    'Direct competition with developer-focused API wrappers. We should highlight raw model cost savings.',
    0.75,
    0.1,
    '{"plan_name": "Pro Plan"}',
    'hash_perplexity_pricing_change',
    NOW() - INTERVAL '2 days'
  ),
  (
    (SELECT id FROM competitors WHERE slug = 'mistral-ai'),
    'github',
    'feature_launch',
    'Mistral AI releases new open-weights model Codestral 22B.',
    'Mistral AI open-sourced Codestral 22B, a model specialized in code generation tasks.',
    'Increases access to high-quality code completion locally. We should benchmark our copilot latency against this model.',
    0.85,
    0.6,
    '{"repo": "mistralai/codestral-22b"}',
    'hash_mistral_codestral_release',
    NOW() - INTERVAL '3 days'
  );
