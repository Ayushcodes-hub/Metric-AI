# Metric AI

### Autonomous Competitive Intelligence & Strategic Analytics Platform

> **Turn fragmented market signals into structured competitive intelligence.**

Metric AI is an AI-powered competitive intelligence platform designed to collect, organize, analyze, and present strategic signals about competitors in a unified intelligence dashboard.

Instead of manually monitoring pricing changes, product activity, hiring, reviews, content, and other market signals across multiple sources, Metric AI provides a centralized environment for transforming those signals into actionable strategic intelligence.

---

## ✦ What is Metric AI?

Competitive intelligence is often scattered across dozens of websites, feeds, repositories, job boards, review platforms, and internal datasets.

**Metric AI brings those signals together.**

The platform is designed around an intelligence pipeline:

```text
                 ┌──────────────────────┐
                 │   External Signals   │
                 │                      │
                 │ Pricing              │
                 │ Content / RSS         │
                 │ GitHub Activity      │
                 │ Hiring               │
                 │ Reviews & Sentiment  │
                 └──────────┬───────────┘
                            │
                            ▼
                 ┌──────────────────────┐
                 │ Signal Processing    │
                 │ & Normalization      │
                 └──────────┬───────────┘
                            │
                            ▼
                 ┌──────────────────────┐
                 │ PostgreSQL           │
                 │ Intelligence Store   │
                 └──────────┬───────────┘
                            │
                            ▼
                 ┌──────────────────────┐
                 │ AI Analysis          │
                 │                      │
                 │ Insight Extraction   │
                 │ Sentiment            │
                 │ Strategic Impact     │
                 │ Urgency              │
                 │ Synthesis            │
                 └──────────┬───────────┘
                            │
                            ▼
                 ┌──────────────────────┐
                 │     Metric AI        │
                 │ Intelligence         │
                 │ Dashboard            │
                 └──────────────────────┘
```

---

# 🚀 Core Capabilities

### Competitive Signal Monitoring

Track structured intelligence across multiple competitive dimensions:

* 💰 Pricing changes
* 📝 Blog and RSS activity
* 💻 GitHub activity
* 👥 Hiring and job-market signals
* ⭐ Reviews and customer sentiment
* 📈 Strategic market signals
* 🧠 AI-generated intelligence
* 📋 Strategic briefings

---

### 🧠 AI-Powered Intelligence

Metric AI is designed to move beyond simply collecting data.

Signals can be transformed into higher-level intelligence including:

* Key insights
* Strategic implications
* Sentiment
* Urgency
* Competitive context
* Synthesized briefings

The objective is simple:

> **Collect signals → understand what changed → determine why it matters.**

---

### 📊 Intelligence Dashboard

The dashboard provides a centralized interface for exploring competitive intelligence.

#### Intelligence Stream

View individual signals with:

* Competitor
* Signal category
* Date
* Insight
* Strategic implication
* Sentiment
* Urgency
* Inspection controls

#### Competitor Intelligence

Dedicated competitor views provide structured information about monitored organizations and their intelligence sources.

#### Strategic Briefings

Aggregated intelligence can be presented as strategic briefings, allowing individual signals to be transformed into a broader competitive picture.

---

# 🏗️ Architecture

Metric AI currently uses a lightweight web architecture:

```text
Frontend
   │
   ├── HTML
   ├── CSS
   └── JavaScript
        │
        ▼
Node.js / Express API
        │
        ▼
PostgreSQL
        │
        ▼
Competitive Intelligence Dataset
```

The broader intelligence workflow is designed around an automation-oriented pipeline capable of connecting data collection, persistence, analysis, and presentation.

---

# 🛠️ Technology Stack

| Layer                 | Technology                 |
| --------------------- | -------------------------- |
| Frontend              | HTML5, CSS3, JavaScript    |
| Backend               | Node.js                    |
| API                   | Express.js                 |
| Database              | PostgreSQL                 |
| Database Driver       | `pg`                       |
| Configuration         | dotenv                     |
| Package Management    | npm                        |
| Deployment            | Vercel                     |
| Intelligence Pipeline | Automation + AI processing |

---

# 📁 Project Structure

```text
Metric-AI/
│
├── dashboard/
│   │
│   ├── api/
│   │   └── index.js
│   │
│   ├── public/
│   │   ├── app.js
│   │   ├── briefing.html
│   │   ├── dashboard.html
│   │   ├── index.html
│   │   └── style.css
│   │
│   ├── package.json
│   ├── package-lock.json
│   ├── render.yaml
│   ├── server.js
│   └── vercel.json
│
├── schema.sql
├── seed.sql
├── seed_new_signals.sql
├── seed_rich_signals.sql
├── update_perplexity.sql
├── progress_report.md
├── setup.sh
├── .gitignore
└── LICENSE
```

---

# ⚡ Getting Started

## 1. Clone the repository

```bash
git clone https://github.com/Ayushcodes-hub/Metric-AI.git
cd Metric-AI
```

---

## 2. Install dependencies

```bash
cd dashboard
npm install
```

---

## 3. Configure PostgreSQL

Metric AI requires a PostgreSQL database.

Create the required database and apply the schema:

```bash
psql -U <username> -d <database> -f ../schema.sql
```

Load seed data if required:

```bash
psql -U <username> -d <database> -f ../seed.sql
```

Additional datasets are available in:

```text
seed_new_signals.sql
seed_rich_signals.sql
update_perplexity.sql
```

---

## 4. Configure environment variables

Create a `.env` file inside `dashboard/`.

Example:

```env
PORT=3000
DATABASE_URL=postgresql://username:password@host:5432/database
```

> **Never commit production database credentials, API keys, or other secrets to Git.**

---

## 5. Start the application

```bash
npm start
```

The local dashboard will be available at:

```text
http://localhost:3000
```

---

# 🔌 API

The Express backend exposes API endpoints for interacting with the intelligence layer.

The application supports operations around:

```text
Competitors
     │
     ├── Retrieve competitors
     └── Retrieve competitor intelligence

Signals
     │
     ├── Retrieve signals
     ├── Filter intelligence
     └── Inspect individual signals

Briefings
     │
     ├── Retrieve strategic briefings
     └── Generate intelligence briefings
```

---

# 🎯 Intelligence Model

Metric AI organizes competitive intelligence around the following conceptual pipeline:

### 01 — Collect

Acquire signals from relevant competitive sources.

### 02 — Normalize

Convert heterogeneous information into structured intelligence records.

### 03 — Store

Persist intelligence in PostgreSQL for querying and historical analysis.

### 04 — Analyze

Use AI-assisted processing to identify meaningful changes, sentiment, strategic implications, and urgency.

### 05 — Synthesize

Combine individual signals into higher-level competitive briefings.

### 06 — Visualize

Present the resulting intelligence through a focused analytical dashboard.

---

# 📌 Example Intelligence Record

A competitive signal can conceptually be represented as:

```json
{
  "competitor": "Example Company",
  "stream": "PRICING",
  "insight": "Competitor introduced a new pricing tier.",
  "implication": "May indicate an attempt to capture a broader customer segment.",
  "sentiment": "neutral",
  "urgency": "high"
}
```

The important distinction is between **what happened** and **why it matters**.

Metric AI is designed to preserve both.

---

# 🔭 Roadmap

Metric AI can be extended toward a more autonomous competitive-intelligence system.

### Data Intelligence

* [ ] Automated competitor discovery
* [ ] Dynamic source URL resolution
* [ ] Additional RSS/news integrations
* [ ] Broader web signal collection
* [ ] Historical signal tracking

### AI Intelligence

* [ ] Improved signal classification
* [ ] Multi-source evidence synthesis
* [ ] Competitor trend detection
* [ ] Strategic event detection
* [ ] Confidence scoring
* [ ] Automated executive summaries

### Analytics

* [ ] Competitor comparison views
* [ ] Historical trend visualizations
* [ ] Signal-volume analytics
* [ ] Competitive momentum indicators
* [ ] Interactive intelligence timelines

### Automation

* [ ] Scheduled intelligence collection
* [ ] Automated briefing generation
* [ ] Alerting for high-urgency signals
* [ ] Continuous competitor monitoring

### Platform

* [ ] Authentication
* [ ] Multi-user workspaces
* [ ] Role-based access
* [ ] Configurable competitors
* [ ] Exportable intelligence reports

---

# 🔐 Security Considerations

Metric AI should be deployed with production security practices in place.

At minimum:

* Store secrets in environment variables.
* Never commit `.env` files.
* Use managed PostgreSQL credentials.
* Restrict database access.
* Validate API inputs.
* Apply appropriate authentication before exposing sensitive intelligence.
* Use HTTPS in production.
* Avoid exposing database credentials through frontend code.
* Monitor application and database logs.

---

# 📈 Why Metric AI?

Traditional competitive monitoring often produces **information overload**.

Metric AI is built around a different principle:

```text
Raw Information
      ↓
Structured Signals
      ↓
AI Analysis
      ↓
Strategic Context
      ↓
Decision Intelligence
```

The goal isn't simply to collect more information.

**The goal is to make competitive information easier to understand.**

---

# 🧩 Design Philosophy

Metric AI follows an editorial intelligence interface rather than a conventional administration dashboard.

The interface emphasizes:

* Information hierarchy
* Minimal visual noise
* Clear typography
* Structured intelligence streams
* Strategic context
* Progressive disclosure
* Fast scanning
* High information density

The result is intended to feel closer to an **intelligence workstation** than a conventional CRUD dashboard.

---

# 🤝 Contributing

Contributions, improvements, bug fixes, and ideas are welcome.

A typical workflow:

```bash
git checkout -b feature/your-feature
git add .
git commit -m "Add your feature"
git push origin feature/your-feature
```

Then open a pull request.

---

# 📜 License

Metric AI is distributed under the **MIT License**.

The repository contains derivative work based on the original project and therefore retains the copyright and permission notice required by the applicable MIT license.

See [`LICENSE`](LICENSE) for the complete license text.

---

# ⭐ Metric AI

**Competitive intelligence, transformed into structured insight.**

```text
                 METRIC AI
        ─────────────────────────
        COMPETITIVE INTELLIGENCE
                 ENGINE
        ─────────────────────────
          SIGNAL → ANALYSIS
             → STRATEGY
```
