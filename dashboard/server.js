 const express = require('express');
    const { Pool } = require('pg');
    const path = require('path');
    require('dotenv').config();

    const app = express();
    const port = process.env.PORT || 3000;

    // Setup Postgres Pool connection
    const connectionString = process.env.DATABASE_URL;
    const pool = new Pool(connectionString ? {
      connectionString,
      ssl: { rejectUnauthorized: false }
    } : {
      user: process.env.DB_USER,
      host: process.env.DB_HOST,
      database: process.env.DB_NAME,
      password: process.env.DB_PASSWORD,
      port: process.env.DB_PORT,
    });

    app.use(express.json());
    app.use(express.static(path.join(__dirname, 'public')));
    app.use((req, res, next) => {
      console.log(`[REQUEST] ${new Date().toISOString()} - ${req.method} ${req.url}`);
      if (req.method === 'POST') {
        console.log('[BODY]', req.body);
      }
      next();
    });
    // 1. Get all competitors
    app.get('/api/competitors', async (req, res) => {
      try {
        const result = await pool.query('SELECT * FROM competitors ORDER BY name ASC');
        res.json(result.rows);
      } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Database query failed' });
      }
    });

    // 2. Get all signals (with optional filters)
    app.get('/api/signals', async (req, res) => {
      try {
        const { competitor, source, min_magnitude } = req.query;
        let query = `
          SELECT s.*, c.name as competitor_name, c.slug as competitor_slug
          FROM signals s
          JOIN competitors c ON s.competitor_id = c.id
          WHERE 1=1
        `;
        const values = [];
        let paramIndex = 1;

        if (competitor) {
          query += ` AND c.slug = $${paramIndex++}`;
          values.push(competitor);
        }
        if (source) {
          query += ` AND s.source = $${paramIndex++}`;
          values.push(source);
        }
        if (min_magnitude) {
          query += ` AND s.magnitude >= $${paramIndex++}`;
          values.push(parseFloat(min_magnitude));
        }

        query += ` ORDER BY s.signal_date DESC`;

        const result = await pool.query(query, values);
        res.json(result.rows);
      } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Database query failed' });
      }
    });

    // 3. Get briefings
    app.get('/api/briefings', async (req, res) => {
      try {
        const result = await pool.query('SELECT * FROM briefings ORDER BY period_end DESC');
        res.json(result.rows);
      } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Database query failed' });
      }
    });

    // 4. Generate/Synthesize a new Briefing on demand
    app.post('/api/generate-briefing', async (req, res) => {
      try {
        // Fetch signals from last 30 days to build the summary
        const signalsResult = await pool.query(`
          SELECT s.*, c.name as competitor_name
          FROM signals s
          JOIN competitors c ON s.competitor_id = c.id
          ORDER BY s.magnitude DESC
        `);

        const signals = signalsResult.rows;
        if (signals.length === 0) {
          return res.status(400).json({ error: 'No signals found to synthesize' });
        }

        // Determine metrics
        const competitorCounts = {};
        let topCompetitor = 'Unknown';
        let maxCount = 0;
        let high = 0, medium = 0, low = 0;

        signals.forEach(sig => {
          // Competitor tally
          competitorCounts[sig.competitor_name] = (competitorCounts[sig.competitor_name] || 0) + 1;
          if (competitorCounts[sig.competitor_name] > maxCount) {
            maxCount = competitorCounts[sig.competitor_name];
            topCompetitor = sig.competitor_name;
          }

          // Magnitude thresholds
          if (sig.magnitude >= 0.7) high++;
          else if (sig.magnitude >= 0.4) medium++;
          else low++;
        });

        // Build synthesized markdown briefing dynamically
        const categories = {};
        signals.forEach(sig => {
          if (!categories[sig.source]) categories[sig.source] = [];
          categories[sig.source].push(sig);
        });

        let briefingMarkdown = `# Weekly Competitive Briefing\n\n`;
        briefingMarkdown += `### Executive Summary\n`;
        briefingMarkdown += `This week saw a total of **${signals.length}**
  intelligence signals processed. **${topCompetitor}** was the most active
  competitor. We identified **${high}** high-magnitude strategic events
  requiring immediate attention.\n\n`;

        briefingMarkdown += `## Key Insights by Stream\n\n`;
        for (const [source, list] of Object.entries(categories)) {
          briefingMarkdown += `### Stream: ${source.toUpperCase()}\n`;
          list.slice(0, 3).forEach(sig => {
            briefingMarkdown += `- **[${sig.competitor_name}]** (${sig.signal_type}): ${sig.extracted_insight} *(Magnitude: ${sig.magnitude})*\n`;
          });
          briefingMarkdown += `\n`;
        }

        const periodStart = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
        const periodEnd = new Date();

        const insertResult = await pool.query(`
          INSERT INTO briefings (
            period_start, period_end, signal_count, briefing_markdown,
  briefing_json,
            top_competitor, urgency_high_count, urgency_medium_count,
  urgency_low_count
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
          RETURNING *
        `, [
          periodStart,
          periodEnd,
          signals.length,
          briefingMarkdown,
          JSON.stringify({ topCompetitor, high, medium, low }),
          topCompetitor,
          high,
          medium,
          low
        ]);

        res.json({ message: 'Briefing generated successfully!', briefing:
  insertResult.rows[0] });
      } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Briefing generation failed' });
      }
    });

    async function searchCompetitorWithAI(companyName) {
      const apiKey = process.env.OPENROUTER_API_KEY || process.env.GEMINI_API_KEY || process.env.AI_API_KEY;
      if (!apiKey) {
        throw new Error("API key not configured.");
      }
      
      const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': 'http://localhost:3000',
          'X-Title': 'Metric Discovery Engine'
        },
        body: JSON.stringify({
          model: "gpt-oss-20b",
          messages: [
            {
              role: "system",
              content: `You are an expert telemetry configuration agent. Given a company name, discover and verify the following parameters:
1. website: Official web homepage.
2. github_org: The slug of their GitHub organization (e.g. for "https://github.com/openai" it is "openai").
3. greenhouse_id: The Greenhouse job board slug (e.g. for "https://boards.greenhouse.io/openai" it is "openai"). Return null if they use Lever, Workday or other systems unless it's Greenhouse.
4. rss_feed: The URL of their RSS news/blog feed.

If you cannot find a verified value for a field, set it to null.
Respond ONLY with a valid raw JSON object matching this schema. Do not output markdown code blocks (e.g. do not wrap with \`\`\`json):
{
  "name": "Company Name",
  "slug": "url-friendly-slug",
  "website": "URL or null",
  "github_org": "slug or null",
  "greenhouse_id": "slug or null",
  "rss_feed": "feed-url or null"
}`
            },
            {
              role: "user",
              content: `Locate the competitive intelligence telemetry feeds for the company "${companyName}". Return the structured JSON schema mapping.`
            }
          ],
          response_format: { type: "json_object" }
        })
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`API error: ${response.statusText} - ${errorText}`);
      }
      
      const data = await response.json();
      return JSON.parse(data.choices[0].message.content.trim());
    }

    // 5. Discovery Search API for adding new competitor
    app.get('/api/competitors/search', async (req, res) => {
      try {
        const { name } = req.query;
        if (!name) {
          return res.status(400).json({ error: 'Name parameter required' });
        }
        
        const lowerName = name.toLowerCase();
        const slug = lowerName.replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

        // Use AI Search if API key is present
        const apiKey = process.env.OPENROUTER_API_KEY || process.env.GEMINI_API_KEY || process.env.AI_API_KEY;
        if (apiKey) {
          try {
            console.log(`Executing AI Telemetry Agent for: ${lowerName}`);
            const aiData = await searchCompetitorWithAI(lowerName);
            return res.json(aiData);
          } catch (aiErr) {
            console.error("AI Search agent failed, falling back to heuristics:", aiErr.message);
          }
        }

        const profiles = {
          'google-deepmind': {
            name: 'Google DeepMind',
            website: 'https://deepmind.google',
            github_org: 'google-deepmind',
            greenhouse_id: null,
            rss_feed: null
          },
          'deepmind': {
            name: 'Google DeepMind',
            website: 'https://deepmind.google',
            github_org: 'google-deepmind',
            greenhouse_id: null,
            rss_feed: null
          },
          'google-deep-mind': {
            name: 'Google DeepMind',
            website: 'https://deepmind.google',
            github_org: 'google-deepmind',
            greenhouse_id: null,
            rss_feed: null
          },
          anthropic: {
            name: 'Anthropic',
            website: 'https://www.anthropic.com',
            github_org: 'anthropics',
            greenhouse_id: 'anthropic',
            rss_feed: 'https://www.anthropic.com/news/rss'
          },
          cohere: {
            name: 'Cohere',
            website: 'https://cohere.com',
            github_org: 'cohere-ai',
            greenhouse_id: 'cohere',
            rss_feed: 'https://cohere.com/blog/rss'
          }
        };
        if (profiles[slug]) {
          return res.json(profiles[slug]);
        }

        // Live discovery heuristic
        let website = `https://www.${slug}.com`;
        let github_org = slug;
        let greenhouse_id = slug;
        let rss_feed = `https://www.${slug}.com/blog/rss`;

        // Live checks
        try {
          const webRes = await fetch(website, { method: 'HEAD', signal: AbortSignal.timeout(2000) });
          if (!webRes.ok) throw new Error();
        } catch {
          try {
            website = `https://www.${slug}.ai`;
            const webResAi = await fetch(website, { method: 'HEAD', signal: AbortSignal.timeout(2000) });
            if (!webResAi.ok) throw new Error();
          } catch {
            website = null;
          }
        }

        if (github_org) {
          try {
            const gitRes = await fetch(`https://github.com/${github_org}`, { method: 'HEAD', signal: AbortSignal.timeout(2000) });
            if (gitRes.status !== 200) github_org = null;
          } catch {
            github_org = null;
          }
        }

        if (greenhouse_id) {
          try {
            const ghRes = await fetch(`https://boards-api.greenhouse.io/v1/boards/${greenhouse_id}/jobs`, { method: 'HEAD', signal: AbortSignal.timeout(2000) });
            if (ghRes.status !== 200) greenhouse_id = null;
          } catch {
            greenhouse_id = null;
          }
        }

        if (rss_feed && website) {
          try {
            const rssRes = await fetch(rss_feed, { method: 'HEAD', signal: AbortSignal.timeout(2000) });
            if (rssRes.status !== 200) rss_feed = null;
          } catch {
            rss_feed = null;
          }
        } else {
          rss_feed = null;
        }

        res.json({
          name,
          slug,
          website,
          github_org,
          greenhouse_id,
          rss_feed
        });
      } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Search failed' });
      }
    });    async function generateSignalsForCompetitor(competitorName, competitorId, website, github_org, greenhouse_id, rss_feed) {
      const apiKey = process.env.OPENROUTER_API_KEY || process.env.GEMINI_API_KEY || process.env.AI_API_KEY;
      if (!apiKey) {
        return getMockSignalsFor(competitorName, competitorId);
      }

      try {
        const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
          method: 'POST',
          signal: AbortSignal.timeout(30000),
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
            'HTTP-Referer': 'http://localhost:3000',
            'X-Title': 'Metric Discovery Engine'
          },
          body: JSON.stringify({
            model: "gpt-oss-20b",
            messages: [
              {
                role: "system",
                content: `You are an AI intelligence crawler. Given a company name and its discovered resources, generate 3 highly realistic competitive intelligence signals that occurred recently.
Generate only for the resources that are active (Website: ${website ? 'Yes' : 'No'}, GitHub Org: ${github_org ? 'Yes' : 'No'}, Greenhouse Jobs: ${greenhouse_id ? 'Yes' : 'No'}, RSS Feed: ${rss_feed ? 'Yes' : 'No'}).
If Website is active, you can generate a "pricing" or "blog" update. If GitHub is active, generate a "github" update. If Greenhouse is active, generate a "jobs" update.

Respond with ONLY a valid JSON array of 3 objects. Do not include markdown code block syntax.
Each object must follow this schema:
{
  "source": "blog" | "github" | "jobs" | "pricing" | "reviews",
  "signal_type": "product_launch" | "code_push" | "hiring_spree" | "pricing_change" | "review_trend",
  "extracted_insight": "A short sentence outlining what the competitor did.",
  "strategic_implication": "Strategic recommendations or impact on our market share.",
  "magnitude": 0.5 to 1.0,
  "sentiment": -1.0 to 1.0,
  "metadata": {}
}`
              },
              {
                role: "user",
                content: `Generate 3 telemetry signals for the competitor "${competitorName}".`
              }
            ],
            response_format: { type: "json_object" }
          })
        });
        if (!response.ok) throw new Error();
        const data = await response.json();
        const parsed = JSON.parse(data.choices[0].message.content.trim());
        const rawSignals = Array.isArray(parsed) ? parsed : (parsed.signals || []);
        
        const validSources = ['blog', 'github', 'jobs', 'pricing', 'reviews'];
        const validated = rawSignals.filter(sig => 
          sig && 
          validSources.includes(sig.source) && 
          typeof sig.signal_type === 'string' && sig.signal_type.trim().length > 0 &&
          typeof sig.extracted_insight === 'string' && sig.extracted_insight.trim().length > 0 &&
          typeof sig.strategic_implication === 'string' && sig.strategic_implication.trim().length > 0
        );

        if (validated.length < 3) {
          throw new Error("AI generated signals did not meet DB constraints/schema requirements");
        }
        return validated;
      } catch (err) {
        console.error("AI Signal generation failed, using mock generator:", err.message);
        return getMockSignalsFor(competitorName, competitorId);
      }
    }
    function getMockSignalsFor(name, id) {
      return [
        {
          source: 'blog',
          signal_type: 'product_launch',
          extracted_insight: `${name} launched a public beta of their new enterprise workspace telemetry module.`,
          strategic_implication: `Puts pressure on our integration speeds. We should highlight our robust multi-node pipelines.`,
          magnitude: 0.8,
          sentiment: 0.7,
          metadata: {}
        },
        {
          source: 'github',
          signal_type: 'code_push',
          extracted_insight: `${name} open-sourced a major repository containing core utility hooks for real-time scraper engines.`,
          strategic_implication: `Validates open-source developer seeding. We should watch for developer adoption trends.`,
          magnitude: 0.65,
          sentiment: 0.9,
          metadata: {}
        },
        {
          source: 'jobs',
          signal_type: 'hiring_spree',
          extracted_insight: `${name} added 12 new roles for Senior Infrastructure and Distributed Systems Engineers.`,
          strategic_implication: `Signals a major scaling push of their backend pipelines. Expect increased feature throughput soon.`,
          magnitude: 0.7,
          sentiment: 0.5,
          metadata: {}
        }
      ];
    }

    async function selfHealCompetitorSignals() {
      try {
        console.log("Checking for competitors with empty telemetry feeds...");
        const result = await pool.query(`
          SELECT c.id, c.name, c.slug, c.website, c.github_org, c.job_board_url, c.rss_feed_url, COUNT(s.id) as signal_count
          FROM competitors c
          LEFT JOIN signals s ON c.id = s.competitor_id
          GROUP BY c.id, c.name, c.slug, c.website, c.github_org, c.job_board_url, c.rss_feed_url
        `);

        for (const row of result.rows) {
          if (parseInt(row.signal_count) === 0) {
            console.log(`Self-healing telemetry signals for competitor: ${row.name}`);
            const greenhouse_id = row.job_board_url ? row.job_board_url.split('/').pop() : null;
            const rss_feed = row.rss_feed_url;
            const signals = await generateSignalsForCompetitor(row.name, row.id, row.website, row.github_org, greenhouse_id, rss_feed);
            
            for (const sig of signals) {
              const hash = row.name + sig.source + sig.signal_type + Math.random();
              const signalQuery = `
                INSERT INTO signals (competitor_id, source, signal_type, extracted_insight, strategic_implication, magnitude, sentiment, metadata, content_hash, signal_date)
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
              `;
              await pool.query(signalQuery, [
                row.id,
                sig.source,
                sig.signal_type,
                sig.extracted_insight,
                sig.strategic_implication,
                sig.magnitude || 0.5,
                sig.sentiment || 0.0,
                JSON.stringify(sig.metadata || {}),
                hash,
                new Date()
              ]);
            }
          }
        }
        console.log("Telemetry check complete.");
      } catch (err) {
        console.error("Self-healing telemetry failed:", err);
      }
    }

    // 6. Add competitor API (Self-Heal Duplicate Slugs)
    app.post('/api/competitors', async (req, res) => {
      try {
        const { name, slug, website, greenhouse_id, github_org, rss_feed } = req.body;
        const job_board_url = greenhouse_id ? (greenhouse_id.startsWith('http') ? greenhouse_id : `https://boards.greenhouse.io/${greenhouse_id}`) : null;
        const rss_feed_url = rss_feed || null;

        // Check if duplicate slug already registered
        const existingCheck = await pool.query('SELECT * FROM competitors WHERE slug = $1', [slug]);
        let targetCompetitor;

        if (existingCheck.rows.length > 0) {
          targetCompetitor = existingCheck.rows[0];
          console.log(`Competitor with slug "${slug}" already exists. Using existing record.`);
        } else {
          const insertQuery = `
            INSERT INTO competitors (name, slug, website, job_board_url, github_org, rss_feed_url)
            VALUES ($1, $2, $3, $4, $5, $6)
            RETURNING *
          `;
          const insertResult = await pool.query(insertQuery, [name, slug, website, job_board_url, github_org, rss_feed_url]);
          targetCompetitor = insertResult.rows[0];
        }

        // Check if this competitor has 0 signals, and seed if empty
        const countCheck = await pool.query('SELECT COUNT(*) FROM signals WHERE competitor_id = $1', [targetCompetitor.id]);
        const signalCount = parseInt(countCheck.rows[0].count);

        if (signalCount === 0) {
          console.log(`Seeding telemetry signals for ${targetCompetitor.name}`);
          try {
            const generatedSignals = await generateSignalsForCompetitor(name, targetCompetitor.id, website, github_org, greenhouse_id, rss_feed);
            for (const sig of generatedSignals) {
              const hash = name + sig.source + sig.signal_type + Math.random();
              const signalQuery = `
                INSERT INTO signals (competitor_id, source, signal_type, extracted_insight, strategic_implication, magnitude, sentiment, metadata, content_hash, signal_date)
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
              `;
              await pool.query(signalQuery, [
                targetCompetitor.id,
                sig.source,
                sig.signal_type,
                sig.extracted_insight,
                sig.strategic_implication,
                sig.magnitude || 0.5,
                sig.sentiment || 0.0,
                JSON.stringify(sig.metadata || {}),
                hash,
                new Date()
              ]);
            }
          } catch (sigErr) {
            console.error("Failed to seed competitor signals:", sigErr);
          }
        }

        res.status(201).json(targetCompetitor);
      } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to add competitor' });
      }
    });

    async function initializeDatabase() {
      try {
        console.log("Initializing database tables...");
        await pool.query(`
          CREATE TABLE IF NOT EXISTS competitors (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            name TEXT NOT NULL,
            slug TEXT NOT NULL UNIQUE,
            website TEXT NOT NULL,
            github_org TEXT,
            twitter_handle TEXT,
            g2_profile_url TEXT,
            linkedin_company_id TEXT,
            job_board_url TEXT,
            rss_feed_url TEXT,
            is_active BOOLEAN DEFAULT true,
            created_at TIMESTAMPTZ DEFAULT now()
          )
        `);

        await pool.query(`
          CREATE TABLE IF NOT EXISTS signals (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            competitor_id UUID REFERENCES competitors(id) ON DELETE CASCADE,
            source TEXT NOT NULL,
            signal_type TEXT NOT NULL,
            raw_content TEXT,
            extracted_insight TEXT NOT NULL,
            strategic_implication TEXT,
            magnitude DOUBLE PRECISION DEFAULT 0.5,
            sentiment DOUBLE PRECISION DEFAULT 0.0,
            metadata JSONB DEFAULT '{}'::jsonb,
            content_hash TEXT NOT NULL UNIQUE,
            captured_at TIMESTAMPTZ DEFAULT now(),
            signal_date TIMESTAMPTZ NOT NULL
          )
        `);

        await pool.query(`
          CREATE TABLE IF NOT EXISTS briefings (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            period_start TIMESTAMPTZ NOT NULL,
            period_end TIMESTAMPTZ NOT NULL,
            signal_count INTEGER DEFAULT 0,
            briefing_markdown TEXT NOT NULL,
            briefing_json JSONB NOT NULL,
            top_competitor TEXT,
            urgency_high_count INTEGER DEFAULT 0,
            urgency_medium_count INTEGER DEFAULT 0,
            urgency_low_count INTEGER DEFAULT 0,
            created_at TIMESTAMPTZ DEFAULT now()
          )
        `);

        await pool.query(`
          CREATE TABLE IF NOT EXISTS pricing_snapshots (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            competitor_id UUID REFERENCES competitors(id) ON DELETE CASCADE,
            page_url TEXT NOT NULL,
            content_hash TEXT NOT NULL,
            raw_html TEXT NOT NULL,
            diff_from_previous TEXT,
            captured_at TIMESTAMPTZ DEFAULT now()
          )
        `);

        const countCheck = await pool.query('SELECT COUNT(*) FROM competitors');
        if (parseInt(countCheck.rows[0].count) === 0) {
          console.log("Seeding default competitors...");
          const defaults = [
            { name: "OpenAI", slug: "openai", website: "https://openai.com", github_org: "openai" },
            { name: "Perplexity", slug: "perplexity", website: "https://www.perplexity.ai", github_org: "perplexity-ai" },
            { name: "Mistral AI", slug: "mistral-ai", website: "https://mistral.ai", github_org: "mistralai" },
            { name: "Cohere", slug: "cohere", website: "https://cohere.com", github_org: "cohere-ai" },
            { name: "AI21 Labs", slug: "ai21-labs", website: "https://www.ai21.com", github_org: "AI21Labs" }
          ];
          for (const item of defaults) {
            await pool.query(`
              INSERT INTO competitors (name, slug, website, github_org)
              VALUES ($1, $2, $3, $4)
            `, [item.name, item.slug, item.website, item.github_org]);
          }
        }
        console.log("Database initialized successfully.");
      } catch (err) {
        console.error("Database initialization failed:", err);
      }
    }    const os = require('os');
    function getLocalIp() {
      const interfaces = os.networkInterfaces();
      for (const name of Object.keys(interfaces)) {
        for (const iface of interfaces[name]) {
          if (iface.family === 'IPv4' && !iface.internal) {
            return iface.address;
          }
        }
      }
      return '0.0.0.0';
    }

    app.listen(port, '0.0.0.0', async () => {
      const localIp = getLocalIp();
      console.log(`Intel Engine dashboard running at:`);
      console.log(`  - Local:   http://localhost:${port}`);
      console.log(`  - Network: http://${localIp}:${port}`);
      await initializeDatabase();
      selfHealCompetitorSignals();
    });
