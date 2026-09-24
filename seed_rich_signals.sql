-- Clear existing signals
DELETE FROM signals;

-- Seed comprehensive signals for the new competitors
INSERT INTO signals (competitor_id, source, signal_type, raw_content, extracted_insight, strategic_implication, magnitude, sentiment, metadata, content_hash, signal_date)
VALUES
  (
    (SELECT id FROM competitors WHERE slug = 'openai'),
    'blog',
    'product_launch',
    'OpenAI launches GPT-5 with native multimodal capabilities.',
    'OpenAI launched their next-generation foundation model GPT-5 with native video and audio integration.',
    'Puts pressure on our model latency requirements. We need to optimize our inference pipelines.',
    0.95,
    0.8,
    '{"model_name": "GPT-5"}',
    'hash_openai_gpt5_launch',
    NOW() - INTERVAL '4 hours'
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
    NOW() - INTERVAL '1 day'
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
    NOW() - INTERVAL '36 hours'
  ),
  (
    (SELECT id FROM competitors WHERE slug = 'cohere'),
    'blog',
    'product_launch',
    'Cohere launches Command R+ for enterprise RAG workflows.',
    'Cohere launched Command R+, a new model optimized for high-context enterprise RAG and tool-use.',
    'Strengthens Cohere''s position in enterprise search. We should refine our vector-database integrations.',
    0.90,
    0.7,
    '{"model_name": "Command R+"}',
    'hash_cohere_command_r_plus',
    NOW() - INTERVAL '2 days'
  ),
  (
    (SELECT id FROM competitors WHERE slug = 'ai21-labs'),
    'blog',
    'product_launch',
    'AI21 Labs releases Jamba 1.5 hybrid SSM-Transformer architecture.',
    'AI21 Labs released Jamba 1.5, utilizing a hybrid SSM-Transformer architecture for high efficiency and long context.',
    'Highlights efficiency of hybrid architectures. We should monitor long-context retrieval performance.',
    0.80,
    0.5,
    '{"model_name": "Jamba 1.5"}',
    'hash_ai21_jamba_release',
    NOW() - INTERVAL '3 days'
  ),
  (
    (SELECT id FROM competitors WHERE slug = 'openai'),
    'jobs',
    'hiring_spike',
    'OpenAI hiring Principal Research Scientists for alignment clusters.',
    'OpenAI posted new listings for Principal Research Scientists specialized in reinforcement learning and alignment.',
    'Indicates continued focus on superalignment and safety systems ahead of larger model scaling.',
    0.70,
    0.2,
    '{"department": "Research & Alignment", "listings_count": 2}',
    'hash_openai_hiring_scientists',
    NOW() - INTERVAL '4 days'
  ),
  (
    (SELECT id FROM competitors WHERE slug = 'perplexity'),
    'blog',
    'product_launch',
    'Perplexity Pages introduced for custom AI wiki-style publishing.',
    'Perplexity launched Perplexity Pages, allowing users to format research results into structured articles.',
    'Represents an expansion from conversational search into collaborative content curation.',
    0.65,
    0.4,
    '{"feature_name": "Perplexity Pages"}',
    'hash_perplexity_pages_launch',
    NOW() - INTERVAL '5 days'
  ),
  (
    (SELECT id FROM competitors WHERE slug = 'cohere'),
    'reviews',
    'review_trend',
    'Multilingual accuracy and lower latency praised on G2.',
    'G2 reviews for Cohere highlight excellent multilingual support and enterprise-grade SLA stability.',
    'Positive validation of Cohere''s focus on global language enterprise markets.',
    0.75,
    0.9,
    '{"platform": "G2", "rating": "4.7/5"}',
    'hash_cohere_g2_sentiment',
    NOW() - INTERVAL '6 days'
  );
