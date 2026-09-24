// Global State
let state = {
  competitors: [],
  signals: [],
  briefings: [],
  activeTab: 'stream',
  requiresSyncAndSynthesis: false,
  filters: {
    competitors: [],
    sources: [],
    min_magnitude: 0,
    search: ''
  }
};

// High-Fidelity Mock Datasets
const mockSignals = [
  {
    id: "mock-1",
    competitor_name: "OpenAI",
    competitor_slug: "openai",
    source: "blog",
    signal_type: "product_launch",
    extracted_insight: "OpenAI launched their next-generation foundation model GPT-5 with native video and audio integration.",
    strategic_implication: "Puts pressure on our model latency requirements. We need to optimize our inference pipelines.",
    magnitude: 0.95,
    sentiment: 0.8,
    signal_date: new Date(Date.now() - 1000 * 60 * 60 * 4).toISOString(), // 4 hours ago
    captured_at: new Date().toISOString(),
    metadata: { model_name: "GPT-5" }
  },
  {
    id: "mock-2",
    competitor_name: "Perplexity",
    competitor_slug: "perplexity",
    source: "pricing",
    signal_type: "pricing_change",
    extracted_insight: "Perplexity updated their Pro plan pricing to include a bundled API credit allocation for developers.",
    strategic_implication: "Direct competition with developer-focused API wrappers. We should highlight raw model cost savings.",
    magnitude: 0.75,
    sentiment: 0.1,
    signal_date: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
    captured_at: new Date().toISOString(),
    metadata: {
      plan_name: "Pro Plan",
      diff: [
        { type: "del", num: 1, text: "Pro Plan: $20/month flat rate (unlimited search)" },
        { type: "add", num: 1, text: "Pro Plan: $20/month flat rate" },
        { type: "add", num: 2, text: "Bundled API Allocation: $5/month developer credits included" }
      ]
    }
  },  {
    id: "mock-3",
    competitor_name: "Mistral AI",
    competitor_slug: "mistral-ai",
    source: "github",
    signal_type: "feature_launch",
    extracted_insight: "Mistral AI open-sourced Codestral 22B, a model specialized in code generation tasks.",
    strategic_implication: "Increases access to high-quality code completion locally. We should benchmark our copilot latency against this model.",
    magnitude: 0.85,
    sentiment: 0.6,
    signal_date: new Date(Date.now() - 1000 * 60 * 60 * 36).toISOString(),
    captured_at: new Date().toISOString(),
    metadata: { repo: "mistralai/codestral-22b" }
  },
  {
    id: "mock-4",
    competitor_name: "Cohere",
    competitor_slug: "cohere",
    source: "blog",
    signal_type: "product_launch",
    extracted_insight: "Cohere launched Command R+, a new model optimized for high-context enterprise RAG and tool-use.",
    strategic_implication: "Strengthens Cohere's position in enterprise search. We should refine our vector-database integrations.",
    magnitude: 0.90,
    sentiment: 0.7,
    signal_date: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
    captured_at: new Date().toISOString(),
    metadata: { model_name: "Command R+" }
  },
  {
    id: "mock-5",
    competitor_name: "AI21 Labs",
    competitor_slug: "ai21-labs",
    source: "blog",
    signal_type: "product_launch",
    extracted_insight: "AI21 Labs released Jamba 1.5, utilizing a hybrid SSM-Transformer architecture for high efficiency and long context.",
    strategic_implication: "Highlights efficiency of hybrid architectures. We should monitor long-context retrieval performance.",
    magnitude: 0.80,
    sentiment: 0.5,
    signal_date: new Date(Date.now() - 1000 * 60 * 60 * 72).toISOString(),
    captured_at: new Date().toISOString(),
    metadata: { model_name: "Jamba 1.5" }
  },
  {
    id: "mock-6",
    competitor_name: "OpenAI",
    competitor_slug: "openai",
    source: "jobs",
    signal_type: "hiring_spike",
    extracted_insight: "OpenAI posted new listings for Principal Research Scientists specialized in reinforcement learning and alignment.",
    strategic_implication: "Indicates continued focus on superalignment and safety systems ahead of larger model scaling.",
    magnitude: 0.70,
    sentiment: 0.2,
    signal_date: new Date(Date.now() - 1000 * 60 * 60 * 96).toISOString(),
    captured_at: new Date().toISOString(),
    metadata: { department: "Research & Alignment", listings_count: 2 }
  },
  {
    id: "mock-7",
    competitor_name: "Perplexity",
    competitor_slug: "perplexity",
    source: "blog",
    signal_type: "product_launch",
    extracted_insight: "Perplexity launched Perplexity Pages, allowing users to format research results into structured articles.",
    strategic_implication: "Represents an expansion from conversational search into collaborative content curation.",
    magnitude: 0.65,
    sentiment: 0.4,
    signal_date: new Date(Date.now() - 1000 * 60 * 60 * 120).toISOString(),
    captured_at: new Date().toISOString(),
    metadata: { feature_name: "Perplexity Pages" }
  },
  {
    id: "mock-8",
    competitor_name: "Cohere",
    competitor_slug: "cohere",
    source: "reviews",
    signal_type: "review_trend",
    extracted_insight: "G2 reviews for Cohere highlight excellent multilingual support and enterprise-grade SLA stability.",
    strategic_implication: "Positive validation of Cohere's focus on global language enterprise markets.",
    magnitude: 0.75,
    sentiment: 0.9,
    signal_date: new Date(Date.now() - 1000 * 60 * 60 * 144).toISOString(),
    captured_at: new Date().toISOString(),
    metadata: { platform: "G2", rating: "4.7/5" }
  }
];
const mockCompetitors = [
  { name: "OpenAI", slug: "openai", website: "https://openai.com", github_org: "openai", greenhouse_id: "openai", rss_feed: "https://openai.com/news/rss.xml", is_active: true },
  { name: "Perplexity", slug: "perplexity", website: "https://www.perplexity.ai", github_org: "perplexity-ai", greenhouse_id: "perplexityai", rss_feed: "https://www.perplexity.ai/hub/blog/rss.xml", is_active: true },
  { name: "Mistral AI", slug: "mistral-ai", website: "https://mistral.ai", github_org: "mistralai", greenhouse_id: "mistral", rss_feed: "https://mistral.ai/news/index.xml", is_active: true },
  { name: "Cohere", slug: "cohere", website: "https://cohere.com", github_org: "cohere-ai", greenhouse_id: "cohere", rss_feed: "https://cohere.com/blog/rss.xml", is_active: true },
  { name: "AI21 Labs", slug: "ai21-labs", website: "https://www.ai21.com", github_org: "AI21Labs", greenhouse_id: "ai21labs", rss_feed: "https://www.ai21.com/blog/rss.xml", is_active: true }
];
// DOM Elements Map
const dom = {
  sidebarLinks: document.querySelectorAll('#sidebar-nav a'),
  tabPanels: document.querySelectorAll('.tab-panel'),
  dashboardTitle: document.getElementById('dashboard-title'),
  btnSync: document.getElementById('btn-sync'),
  btnRunSynthesis: document.getElementById('btn-run-synthesis'),
  workspaceSearch: document.getElementById('workspace-search'),
  toastContainer: document.getElementById('toast-container'),
  
  // Tab panels containers
  streamTimelineContainer: document.getElementById('stream-timeline-container'),
  streamStanceText: document.getElementById('stream-stance-text'),
  
  statusGridContainer: document.getElementById('status-grid-container'),
  
  historyCompetitorCheckboxes: document.getElementById('history-competitor-checkboxes'),
  historySignalsTimeline: document.getElementById('history-signals-timeline'),
  
  briefingsBentoContainer: document.getElementById('briefings-bento-container'),  // Modal Details
  diffModal: document.getElementById('diff-modal'),
  diffModalTitle: document.getElementById('diff-modal-title'),
  diffModalBody: document.getElementById('diff-modal-body'),
  
  // Competitor Add Details
  addCompetitorModal: document.getElementById('add-competitor-modal'),
  addCompName: document.getElementById('add-comp-name'),
  btnCompSearchDiscovery: document.getElementById('btn-comp-search-discovery'),
  compModalInputSection: document.getElementById('comp-modal-input-section'),
  compModalResultsSection: document.getElementById('comp-modal-results-section'),
  compDiscoveryMatrix: document.getElementById('comp-discovery-matrix'),
  btnCompConfirmRegister: document.getElementById('btn-comp-confirm-register'),
  healthCompetitorsList: document.getElementById('health-competitors-list')
};
document.addEventListener('DOMContentLoaded', () => {
  setupNav();
  setupSync();
  setupAddCompetitorEvents();
  loadData();
});
// Dummy function to prevent errors from leftover calls after custom cursor removal
window.applyMagneticHover = function() {};
// Navigation switching
function setupNav() {
  const btnMobileMenu = document.getElementById('btn-mobile-menu');
  const sidebar = document.getElementById('sidebar');
  const overlay = document.getElementById('sidebar-overlay');
  
  if (btnMobileMenu && sidebar && overlay) {
    btnMobileMenu.addEventListener('click', () => {
      sidebar.classList.remove('-translate-x-full');
      overlay.classList.remove('hidden');
    });
    overlay.addEventListener('click', () => {
      sidebar.classList.add('-translate-x-full');
      overlay.classList.add('hidden');
    });
  }

  window.switchTab = function(tabId) {
    state.activeTab = tabId;

    if (sidebar && overlay) {
      sidebar.classList.add('-translate-x-full');
      overlay.classList.add('hidden');
    }

    // Sidebar active item toggles
    dom.sidebarLinks.forEach(link => {
      if (link.getAttribute('data-tab') === tabId) {
        link.className = "flex items-center gap-4 text-primary font-bold rail-item-active transition-all duration-300 group";
      } else {
        link.className = "flex items-center gap-4 text-secondary hover:text-on-surface transition-all duration-300 group";
      }
    });

    // Content area tabs toggles
    dom.tabPanels.forEach(panel => {
      if (panel.id === `panel-${tabId}`) {
        panel.classList.remove('hidden');
      } else {
        panel.classList.add('hidden');
      }
    });
    // Heading titles
    const titles = {
      stream: "Intelligence Stream",
      reports: "Strategic Reports Viewer",
      competitors: "Competitor Registry Portal",
      status: "Signal Status Feed",
      health: "System Health Portal",
      filters: "Historical Archive Ledger"
    };
    dom.dashboardTitle.textContent = titles[tabId] || "CI Engine Dashboard";

    // Refresh triggers
    triggerCascadeFade();
    window.applyMagneticHover();
  };
  dom.sidebarLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const tabId = link.getAttribute('data-tab');
      window.location.hash = tabId;
      window.switchTab(tabId);
    });
  });

  // Load active tab from URL hash if present, otherwise default to stream
  const hash = window.location.hash.replace('#', '');
  const validTabs = ['stream', 'reports', 'competitors', 'status', 'health', 'filters'];
  if (validTabs.includes(hash)) {
    window.switchTab(hash);
  } else {
    window.switchTab('stream');
  }
}

// Search and manual Sync controls
function setupSync() {
  dom.btnSync.addEventListener('click', async () => {
    showToast("Retrieving latest telemetry data...", "success");
    try {
      await loadData();
      showToast("Data Synced", "success");
    } catch (err) {
      showToast("Sync failed", "error");
    }
  });

  dom.btnRunSynthesis.addEventListener('click', async () => {
    showToast("Initializing synthesis execution on engine nodes...", "success");
    dom.btnRunSynthesis.disabled = true;
    try {
      const res = await fetch('/api/generate-briefing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      if (res.ok) {
        showToast("Synthesis Successful", "success");
        await loadData();
        window.switchTab('reports');
      } else {
        showToast("Synthesis script encountered database lock.", "error");
      }
    } catch (err) {
      showToast("Synthesis agent pipeline connection timed out.", "error");
    } finally {
      dom.btnRunSynthesis.disabled = false;
    }
  });
  let searchTimeout;
  dom.workspaceSearch.addEventListener('input', (e) => {
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(() => {
      state.filters.search = e.target.value.toLowerCase();
      renderTimeline();
      renderHistoricalTimeline();
    }, 150);
  });

  const btnExport = document.getElementById('btn-export-logs');
  if (btnExport) {
    btnExport.addEventListener('click', () => {
      let content = "CI ENGINE INFRASTRUCTURE DIAGNOSTIC LOGS\n";
      content += `Export Date: ${new Date().toISOString()}\n`;
      content += "========================================\n\n";
      content += "COMPETITORS REGISTERED:\n";
      state.competitors.forEach(c => {
        content += `- ${c.name} (Slug: ${c.slug}, URL: ${c.website})\n`;
      });
      content += "\nSIGNALS COMPILED:\n";
      state.signals.forEach(s => {
        content += `[${s.competitor_name}] [${s.source.toUpperCase()}] ${s.signal_type} (${s.signal_date})\n`;
        content += `Insight: ${s.extracted_insight}\n`;
        content += `Strategic Implication: ${s.strategic_implication || 'None'}\n`;
        content += `Magnitude: ${s.magnitude}\n`;
        content += "----------------------------------------\n";
      });
      
      const blob = new Blob([content], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `ci_engine_diagnostics_${Date.now()}.txt`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      showToast("System Logs Exported Successfully", "success");
    });
  }
}
// Fetch all database records falling back to mocks
async function loadData() {
  try {
    const compRes = await fetch('/api/competitors');
    const compData = await compRes.json();
    state.competitors = Array.isArray(compData) && compData.length > 0 ? compData : mockCompetitors;

    const sigRes = await fetch('/api/signals');
    const sigData = await sigRes.json();
    const dbSignals = Array.isArray(sigData) ? sigData : [];
    state.signals = [...dbSignals, ...mockSignals];

    // Deduplicate
    const seenIds = new Set();
    state.signals = state.signals.filter(s => {
      const key = s.id || s.content_hash;
      if (seenIds.has(key)) return false;
      seenIds.add(key);
      return true;
    });

    state.signals.sort((a, b) => new Date(b.signal_date) - new Date(a.signal_date));

    const briefRes = await fetch('/api/briefings');
    const briefData = await briefRes.json();
    state.briefings = Array.isArray(briefData) ? briefData : [];

    // Populate checklist filters
    populateHistoryFilters();

    // Renders
    renderTimeline();
    renderSignalStatus();
    renderHistoricalTimeline();
    renderReports();
    renderHealthCompetitorsList();

  } catch (err) {
    console.error(err);
    state.competitors = mockCompetitors;
    state.signals = mockSignals;
    populateHistoryFilters();
    renderTimeline();
    renderSignalStatus();
    renderHistoricalTimeline();
    renderReports();
    renderHealthCompetitorsList();
    showToast("Live connection failed. Loading static memory dataset.", "error");
  }
}

// Render Tab 1: Intelligence Stream
function renderTimeline() {
  const container = dom.streamTimelineContainer;
  container.innerHTML = '';  // Setup Weekly Stance dynamic updates
  const countHigh = state.signals.filter(s => s.magnitude >= 0.7).length;
  const today = new Date();
  const formatOptions = { month: 'long', day: 'numeric' };
  const weekString = today.toLocaleDateString('en-US', formatOptions);
  dom.streamStanceText.innerHTML = `
    Week of ${weekString}: <span class="text-primary font-bold">${countHigh} critical shifts</span> executed across enterprise verticals. Immediate focus is recommended to mitigate structural changes.
  `;

  if (state.requiresSyncAndSynthesis) {
    const banner = document.createElement('div');
    banner.className = 'bg-yellow-50 border border-yellow-200/50 p-8 mb-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 animate-fade-in-up';
    banner.innerHTML = `
      <div>
        <h4 class="font-serif font-bold text-lg text-primary mb-1">New Competitor Registered</h4>
        <p class="text-xs text-secondary leading-relaxed">Run the synthesis engine and sync the telemetry pipelines to compile the new intelligence branches.</p>
      </div>
      <button class="bg-primary text-on-primary px-6 py-3 font-label-ui text-xs uppercase tracking-widest hover:opacity-90 transition-opacity" onclick="window.runQuickSynthesisAndSync()">
        Run Analysis & Sync
      </button>
    `;
    container.appendChild(banner);
  }

  const list = state.signals.slice(0, 8);
  list.forEach(sig => {
    const isPricing = sig.source === 'pricing';
    const isCritical = sig.magnitude >= 0.7;
    const borderClass = isCritical ? 'border-error/50' : 'border-black/10';

    const card = document.createElement('article');
    card.className = `signal-card p-6 md:p-10 group relative border-l-2 ${borderClass} animate-fade-in-up`;
    
    let metaContent = `
      <span class="px-3 py-1 bg-white/50 text-[10px] font-label-ui uppercase tracking-widest border border-black/5 italic">${sig.source}</span>
      <span class="px-3 py-1 bg-white/50 text-[10px] font-label-ui uppercase tracking-widest border border-black/5 italic">${cleanType(sig.signal_type)}</span>
    `;

    let bodyVisuals = '';
    if (isPricing && (sig.metadata?.diff || sig.metadata?.diff_from_previous)) {
      bodyVisuals = `<div class="font-meta-data bg-white/50 p-6 space-y-2 border border-outline-variant/20 mb-8 max-h-48 overflow-y-auto">`;
      const diffLines = sig.metadata.diff || [];
      if (diffLines.length > 0) {
        diffLines.slice(0, 4).forEach(line => {
          const cls = line.type === 'add' ? 'diff-added' : 'diff-removed';
          const sym = line.type === 'add' ? '+' : '-';
          bodyVisuals += `<div class="flex items-center space-x-4 py-1 ${cls}"><span class="w-8 opacity-50">${sym}</span><span>${line.text}</span></div>`;
        });
      } else if (sig.metadata.diff_from_previous) {
        sig.metadata.diff_from_previous.split('\n').slice(0, 4).forEach(line => {
          const cls = line.startsWith('+') ? 'diff-added' : (line.startsWith('-') ? 'diff-removed' : '');
          bodyVisuals += `<div class="flex items-center space-x-4 py-1 ${cls}"><span class="w-8 opacity-50">${line.substring(0, 1)}</span><span>${line.substring(1)}</span></div>`;
        });
      }
      bodyVisuals += `</div>`;
    }

    card.innerHTML = `
      <div class="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4 mb-6">
        <div class="flex flex-col">
          <div class="flex items-center gap-3 font-meta-data text-meta-data text-secondary uppercase italic">
            <span>${sig.competitor_name}</span>
            <span class="w-1 h-1 bg-black/20 rounded-full"></span>
            <span>${formatTime(sig.signal_date)}</span>
            <span class="w-1 h-1 bg-black/20 rounded-full"></span>
            <span>Source Stream</span>
          </div>
          <h3 class="font-headline-md text-headline-md mt-4 group-hover:text-primary transition-colors cursor-pointer leading-tight">${sig.extracted_insight}</h3>
        </div>
        <div class="flex items-center gap-4">
          <span class="border ${isCritical ? 'border-error/30 text-error' : 'border-black/20 text-secondary'} px-3 py-1 text-[9px] font-bold uppercase tracking-[0.2em]">${isCritical ? 'Critical Shift' : 'Telemetry'}</span>
        </div>
      </div>
      
      <p class="font-body-md text-on-surface/70 max-w-3xl mb-8 text-[17px]">
        ${sig.strategic_implication || 'Diagnostic metrics captured successfully. Awaiting compliance check directives.'}
      </p>
      
      ${bodyVisuals}

      <div class="flex items-center justify-between pt-8 border-t border-black/5">
        <div class="flex gap-4">
          ${metaContent}
        </div>
        ${isPricing ? `
          <button class="flex items-center gap-3 font-label-ui text-[11px] uppercase tracking-widest text-primary hover:translate-x-2 transition-transform" onclick="window.inspectDiff('${sig.id}')">
            Compare Pricing <span class="material-symbols-outlined text-[18px]">arrow_forward</span>
          </button>
        ` : `
          <span class="text-meta-data text-secondary">Magnitude Importance Score: ${sig.magnitude.toFixed(1)}</span>
        `}
      </div>
    `;
    container.appendChild(card);
  });

  window.applyMagneticHover();
}

// Render Tab 2: Signal Status Feed
function renderSignalStatus() {
  const container = dom.statusGridContainer;
  container.innerHTML = '';

  const sources = [
    { name: "SEC Edgar Filings", count: "1,240 fil/hr", label: "Live", bg: "bg-green-100 text-green-800", text: "Monitoring competitor SEC filings for corporate updates." },
    { name: "G2 Review Sentiment", count: "Sentiment NLP", label: "Delayed (4m)", bg: "bg-yellow-50 text-yellow-800", text: "Ingesting user experience testimonials and customer complaints." },
    { name: "Greenhouse Careers", count: "IP Movement", label: "Live", bg: "bg-green-100 text-green-800", text: "Mapping candidate velocity in AI product infrastructure listings." },
    { name: "GitHub Activity Watch", count: "Public Repos", label: "Calibrating", bg: "bg-blue-50 text-blue-800", text: "Tracking developer activity logs on competitor open source repositories." },
    { name: "Web Scraper snapshots", count: "HTTP Page Hash", label: "Live", bg: "bg-green-100 text-green-800", text: "Comparing raw HTML content structures for real-time pricing changes." }
  ];

  sources.forEach(src => {
    const block = document.createElement('div');
    block.className = "md:col-span-6 bg-[#F3F2EE] p-8 hover-card border-l-2 border-primary";
    block.innerHTML = `
      <div class="flex justify-between items-start mb-6">
        <div>
          <span class="font-meta-data text-meta-data text-secondary uppercase">PIPELINE MONITORING</span>
          <h3 class="font-headline-md text-headline-md mt-1">${src.name}</h3>
        </div>
        <div class="flex flex-col items-end">
          <span class="px-2 py-0.5 ${src.bg} font-meta-data text-[10px] uppercase font-bold tracking-widest rounded-sm mb-2">${src.label}</span>
          <span class="font-meta-data text-meta-data text-secondary">${src.count}</span>
        </div>
      </div>
      <p class="font-body-lg text-body-lg text-secondary mb-8 leading-relaxed">
        ${src.text}
      </p>
      <div class="flex justify-between items-center text-secondary border-t border-outline-variant pt-6">
        <span class="font-meta-data text-meta-data">Active Telemetry Active</span>
        <span class="material-symbols-outlined text-[18px]">sync</span>
      </div>
    `;
    container.appendChild(block);
  });
}
// Render Tab 3: History Archive
function populateHistoryFilters() {
  const container = dom.historyCompetitorCheckboxes;
  container.innerHTML = '';

  state.competitors.forEach(comp => {
    const label = document.createElement('label');
    label.className = "flex items-center gap-4 cursor-pointer group";
    label.innerHTML = `
      <input checked class="custom-checkbox history-comp-check" type="checkbox" value="${comp.slug}">
      <span class="font-body-md text-on-surface/80 group-hover:text-primary transition-colors text-[15px]">${comp.name}</span>
    `;
    label.querySelector('input').addEventListener('change', () => {
      updateActiveHistoryFilters();
    });
    container.appendChild(label);
  });
  // Attach listener to hardcoded source checkboxes
  document.querySelectorAll('.history-source-check').forEach(chk => {
    chk.addEventListener('change', () => {
      updateActiveHistoryFilters();
    });
  });

  // Initialize filter state arrays on load
  updateActiveHistoryFilters();
}
function updateActiveHistoryFilters() {
  const compChecks = document.querySelectorAll('.history-comp-check');
  const activeComps = [];
  compChecks.forEach(c => {
    if (c.checked) activeComps.push(c.value);
  });
  state.filters.competitors = activeComps;

  const srcChecks = document.querySelectorAll('.history-source-check');
  const activeSrcs = [];
  srcChecks.forEach(c => {
    if (c.checked) activeSrcs.push(c.value);
  });
  state.filters.sources = activeSrcs;

  renderHistoricalTimeline();
}

function renderHistoricalTimeline() {
  const container = dom.historySignalsTimeline;
  container.innerHTML = '';

  let filtered = state.signals;

  // Filter based on competitor checkboxes
  if (state.filters.competitors.length > 0) {
    filtered = filtered.filter(s => state.filters.competitors.includes(s.competitor_slug) || state.filters.competitors.includes(s.competitor_name.toLowerCase().replace(/\s+/g, '-')));
  }

  // Filter based on source checkboxes
  if (state.filters.sources && state.filters.sources.length > 0) {
    filtered = filtered.filter(s => state.filters.sources.includes(s.source));
  } else {
    filtered = []; // If no sources checked, hide everything
  }

  // Filter based on Search
  if (state.filters.search) {
    filtered = filtered.filter(s => s.extracted_insight.toLowerCase().includes(state.filters.search) || s.competitor_name.toLowerCase().includes(state.filters.search));
  }  // Filter for only the last 2 weeks of data
  const twoWeeksAgo = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000);
  filtered = filtered.filter(s => new Date(s.signal_date) >= twoWeeksAgo);

  if (filtered.length === 0) {
    container.innerHTML = `<div class="p-8 text-center text-secondary text-body-md">No archive logs fit filters query.</div>`;
    return;
  }
  // Group by day markers
  let currentGroupDate = '';
  filtered.forEach(sig => {
    const formattedGroup = formatDateHeader(sig.signal_date);
    if (formattedGroup !== currentGroupDate) {
      currentGroupDate = formattedGroup;
      
      const dayMarker = document.createElement('div');
      dayMarker.className = "flex items-center gap-6 py-12";
      dayMarker.innerHTML = `
        <span class="font-meta-data text-[12px] text-primary font-bold tracking-[0.3em]">${formattedGroup}</span>
        <div class="h-[1px] bg-black/10 flex-1"></div>
      `;
      container.appendChild(dayMarker);
    }

    const card = document.createElement('article');
    card.className = "signal-card p-6 md:p-10 group relative border-l-2 border-primary mb-6";
    
    card.innerHTML = `
      <div class="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4 mb-8">
        <div class="flex flex-col">
          <div class="flex items-center gap-3 font-meta-data text-meta-data text-secondary uppercase italic">
            <span>${sig.source}</span>
            <span class="w-1 h-1 bg-black/20 rounded-full"></span>
            <span>${formatTime(sig.signal_date)}</span>
            <span class="w-1 h-1 bg-black/20 rounded-full"></span>
            <span>Captured Database Ledger</span>
          </div>
          <h3 class="font-headline-md text-headline-md mt-4 group-hover:text-primary transition-colors cursor-pointer leading-tight">${sig.extracted_insight}</h3>
        </div>
        <div class="flex items-center gap-4">
          <span class="border border-black/30 text-primary px-3 py-1 text-[9px] font-bold uppercase tracking-[0.2em]">${cleanType(sig.signal_type)}</span>
        </div>
      </div>
      <p class="font-body-md text-on-surface/70 max-w-3xl mb-10 text-[17px]">
        ${sig.strategic_implication || 'Archived compliance directive logs loaded successfully.'}
      </p>
      <div class="flex items-center justify-between pt-8 border-t border-black/5">
        <div class="flex gap-4">
          <span class="px-3 py-1 bg-white/50 text-[10px] font-label-ui uppercase tracking-widest border border-black/5 italic">Source: ${sig.competitor_name}</span>
        </div>
        <button class="flex items-center gap-3 font-label-ui text-[11px] uppercase tracking-widest text-primary hover:translate-x-2 transition-transform" onclick="window.restoreActive('${sig.id}')">
          Restore to Active <span class="material-symbols-outlined text-[18px]">arrow_forward</span>
        </button>
      </div>
    `;
    container.appendChild(card);
  });

  window.applyMagneticHover();
}

window.restoreActive = function(signalId) {
  showToast(`Restoring signal state record: ${signalId}`, "success");
};

// Render Tab 4: Executive Briefings Reports
function renderReports() {
  const container = dom.briefingsBentoContainer;
  container.innerHTML = '';

  if (state.briefings.length === 0) {
    container.innerHTML = `
      <article class="md:col-span-12 group cursor-pointer report-card bg-surface-container-low p-10 flex flex-col justify-between min-h-[300px]">
        <div>
          <h3 class="font-display-hero text-4xl text-primary mb-6">No Summarized Briefings Available</h3>
          <p class="font-body-md text-body-md text-secondary max-w-xl leading-relaxed mb-8">
            Click "RUN SYNTHESIS" in the left sidebar rail to dynamically trigger our AI Engine nodes and compile database records.
          </p>
        </div>
      </article>
    `;
    return;
  }

  // Bento grids: featured briefing occupies 8 columns, other sub items occupy 4 columns
  const uniqueBriefings = [];
  const seenCompetitors = new Set();
  state.briefings.forEach(brief => {
    const key = brief.top_competitor || 'Unknown';
    if (!seenCompetitors.has(key)) {
      seenCompetitors.add(key);
      uniqueBriefings.push(brief);
    }
  });

  uniqueBriefings.forEach((brief, idx) => {
    const card = document.createElement('article');
    const isFeatured = idx === 0;
    const originalIdx = state.briefings.indexOf(brief);
    
    if (isFeatured) {
      card.className = "col-span-12 md:col-span-8 group cursor-pointer report-card bg-surface-container-low p-6 md:p-10 flex flex-col justify-between min-h-[360px] md:min-h-[480px]";
      card.innerHTML = `
        <div>
          <div class="flex justify-between items-start mb-12">
            <span class="bg-primary text-white font-meta-data text-[10px] px-3 py-1 tracking-widest uppercase">Featured Briefing</span>
            <span class="font-meta-data text-meta-data text-secondary">${formatDateHeader(brief.period_end)}</span>
          </div>
          <h3 class="font-display-hero text-4xl text-primary mb-6 group-hover:underline decoration-1 underline-offset-8">Weekly Synthesis Briefing</h3>
          <div class="font-body-md text-body-md text-secondary max-w-xl leading-relaxed mb-8 markdown-body">
            ${marked.parse(brief.briefing_markdown.split('##')[0] || '')}
          </div>
        </div>
        <div class="flex items-center justify-between border-t border-outline-variant pt-8">
          <div class="flex gap-4">
            <span class="text-meta-data text-secondary">${brief.signal_count} Captured Signals</span>
          </div>
          <button class="font-label-ui text-label-ui flex items-center group-hover:translate-x-2 transition-transform" onclick="window.viewBriefingText(${originalIdx})">
            Read Full Intelligence <span class="material-symbols-outlined ml-2">arrow_forward</span>
          </button>
        </div>
      `;
    } else {
      card.className = "col-span-12 md:col-span-4 group cursor-pointer report-card bg-surface-container-low p-6 md:p-8 flex flex-col";
      card.innerHTML = `
        <div class="mb-8">
          <span class="font-meta-data text-meta-data text-secondary block mb-2">${formatDateHeader(brief.period_end)} // TELEMETRY</span>
          <h3 class="font-headline-md text-headline-md text-primary leading-tight group-hover:text-secondary transition-colors">Enterprise Intel Summary</h3>
        </div>
        <p class="font-body-md text-body-md text-secondary leading-snug mb-auto">
          AI synthesized briefing compiling insights on top competitor: <strong class="text-black">${brief.top_competitor || 'OpenAI'}</strong>.
        </p>
        <div class="mt-8 pt-6 border-t border-outline-variant flex justify-between items-center">
          <span class="font-meta-data text-meta-data text-primary">READ BRIEFING</span>
          <button class="material-symbols-outlined text-secondary" onclick="window.viewBriefingText(${originalIdx})">arrow_forward</button>
        </div>
      `;
    }
    container.appendChild(card);
  });

  window.applyMagneticHover();
}

window.viewBriefingText = function(index) {
  window.location.href = `briefing.html?index=${index}`;
};
// Unified Pricing comparison Modal
window.inspectDiff = function(signalId) {
  const sig = state.signals.find(s => s.id === signalId);
  if (!sig) return;

  dom.diffModalTitle.textContent = `${sig.competitor_name} Pricing Comparison`;
  dom.diffModalBody.innerHTML = '';
  
  const diffViewer = document.createElement('div');
  diffViewer.className = 'space-y-2 font-mono text-[13px]';

  const diffLines = sig.metadata?.diff || [];
  if (diffLines.length > 0) {
    diffLines.forEach(line => {
      const cls = line.type === 'add' ? 'diff-added' : 'diff-removed';
      const sym = line.type === 'add' ? '+' : '-';
      
      const row = document.createElement('div');
      row.className = `flex items-center space-x-4 py-1.5 px-3 ${cls}`;
      row.innerHTML = `<span class="w-8 opacity-50">${sym}</span><span>${line.text}</span>`;
      diffViewer.appendChild(row);
    });
  } else if (sig.metadata?.diff_from_previous) {
    sig.metadata.diff_from_previous.split('\n').forEach(line => {
      const cls = line.startsWith('+') ? 'diff-added' : (line.startsWith('-') ? 'diff-removed' : '');
      const sym = line.startsWith('+') ? '+' : (line.startsWith('-') ? '-' : ' ');
      
      const row = document.createElement('div');
      row.className = `flex items-center space-x-4 py-1.5 px-3 ${cls}`;
      row.innerHTML = `<span class="w-8 opacity-50">${sym}</span><span>${line.substring(1)}</span>`;
      diffViewer.appendChild(row);
    });
  } else {
    diffViewer.innerHTML = `<div class="p-8 text-center text-secondary">No raw structural changes logged.</div>`;
  }
  
  dom.diffModalBody.appendChild(diffViewer);
  dom.diffModal.classList.remove('hidden');
};

window.closeDiffModal = function() {
  dom.diffModal.classList.add('hidden');
};

// Helpers & Formatters
function triggerCascadeFade() {
  const cards = document.querySelectorAll('.editorial-card, .signal-card');
  cards.forEach((card, index) => {
    card.style.opacity = '0';
    card.style.transform = 'translateY(20px)';
    setTimeout(() => {
      card.style.transition = 'opacity 500ms ease-out, transform 500ms ease-out';
      card.style.opacity = '1';
      card.style.transform = 'translateY(0)';
    }, 50 + (index * 40));
  });
}

function formatDateHeader(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return dateStr;
  return d.toLocaleDateString('en-US', {
    day: '2-digit',
    month: 'short'
  }).toUpperCase() + ' // ' + d.getFullYear();
}

function formatTime(dateStr) {
  if (!dateStr) return '00:00 GMT';
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return '00:00 GMT';
  return d.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' }) + ' GMT';
}

function cleanType(type) {
  return type.replace(/_/g, ' ').toUpperCase();
}

// Toast alerts system
function showToast(message, type = 'success') {
  const toast = document.createElement('div');
  const bgClass = type === 'error' ? 'bg-red-700' : 'bg-black';
  toast.className = `${bgClass} text-white px-6 py-4 font-label-ui text-label-ui uppercase tracking-wider shadow-2xl`;
  toast.textContent = message;
  dom.toastContainer.appendChild(toast);
  
  setTimeout(() => {
    toast.style.transition = 'all 0.3s ease';
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(10px)';
    setTimeout(() => {
      toast.remove();
    }, 300);
  }, 4000);
}

// Add Competitor modal handlers
window.openAddCompetitorModal = function() {
  dom.addCompetitorModal.classList.remove('hidden');
  window.resetAddCompetitorModal();
};

window.closeAddCompetitorModal = function() {
  dom.addCompetitorModal.classList.add('hidden');
};

window.resetAddCompetitorModal = function() {
  dom.addCompName.value = '';
  dom.compModalInputSection.classList.remove('hidden');
  dom.compModalResultsSection.classList.add('hidden');
  dom.compDiscoveryMatrix.innerHTML = '';
  state.discoveredCompetitor = null;
  if (dom.btnCompConfirmRegister) {
    dom.btnCompConfirmRegister.disabled = false;
    dom.btnCompConfirmRegister.style.opacity = '1';
    dom.btnCompConfirmRegister.style.cursor = 'pointer';
  }
};

// Wire search and confirm buttons
function setupAddCompetitorEvents() {
  if (dom.btnCompSearchDiscovery) {
    dom.btnCompSearchDiscovery.addEventListener('click', async () => {
      const name = dom.addCompName.value.trim();
      if (!name) {
        showToast("Please enter a competitor name", "error");
        return;
      }
      
      showToast("Searching active namespaces and scraping resources...", "success");
      dom.btnCompSearchDiscovery.disabled = true;
      dom.btnCompSearchDiscovery.textContent = "Analyzing channels...";
      
      try {
        const res = await fetch(`/api/competitors/search?name=${encodeURIComponent(name)}`);
        if (!res.ok) throw new Error("Search failed");
        
        const data = await res.json();
        state.discoveredCompetitor = data;
        
        // Populate results matrix
        dom.compDiscoveryMatrix.innerHTML = `
          <div class="flex justify-between py-2 border-b border-outline-variant/10">
            <span class="text-secondary">Website URL:</span>
            <span class="font-mono text-xs">${data.website || '<span class="text-red-700 font-bold">NOT FOUND</span>'}</span>
          </div>
          <div class="flex justify-between py-2 border-b border-outline-variant/10">
            <span class="text-secondary">GitHub Org:</span>
            <span class="font-mono text-xs">${data.github_org ? `github.com/${data.github_org}` : '<span class="text-red-700 font-bold">NOT FOUND</span>'}</span>
          </div>
          <div class="flex justify-between py-2 border-b border-outline-variant/10">
            <span class="text-secondary">Greenhouse Jobs ID:</span>
            <span class="font-mono text-xs">${data.greenhouse_id || '<span class="text-red-700 font-bold">NOT FOUND</span>'}</span>
          </div>
          <div class="flex justify-between py-2 border-b border-outline-variant/10">
            <span class="text-secondary">RSS News Feed:</span>
            <span class="font-mono text-xs">${data.rss_feed || '<span class="text-red-700 font-bold">NOT FOUND</span>'}</span>
          </div>
        `;
        
        const notFoundCount = [data.website, data.github_org, data.greenhouse_id, data.rss_feed].filter(x => !x).length;
        
        const noteBox = dom.compModalResultsSection.querySelector('.bg-yellow-50') || dom.compModalResultsSection.querySelector('.bg-red-50');
        if (notFoundCount > 2) {
          noteBox.className = "bg-red-50 border border-red-200/50 p-4 text-xs text-red-800 leading-relaxed uppercase tracking-wider font-mono";
          noteBox.innerHTML = `Warning: ${notFoundCount} channels not found. Competitor registration requires at least 2 telemetry profiles to be found. Registration blocked.`;
          dom.btnCompConfirmRegister.disabled = true;
          dom.btnCompConfirmRegister.style.opacity = '0.5';
          dom.btnCompConfirmRegister.style.cursor = 'not-allowed';
        } else {
          noteBox.className = "bg-yellow-50 border border-yellow-200/50 p-4 text-xs text-yellow-800 leading-relaxed uppercase tracking-wider font-mono";
          noteBox.innerHTML = `Note: Channels marked NOT FOUND will be bypassed in the background processing pipeline automatically.`;
          dom.btnCompConfirmRegister.disabled = false;
          dom.btnCompConfirmRegister.style.opacity = '1';
          dom.btnCompConfirmRegister.style.cursor = 'pointer';
        }

        dom.compModalInputSection.classList.add('hidden');
        dom.compModalResultsSection.classList.remove('hidden');
      } catch (err) {
        showToast("AI discovery agent failed to resolve channels.", "error");
      } finally {
        dom.btnCompSearchDiscovery.disabled = false;
        dom.btnCompSearchDiscovery.textContent = "Search & Discover Telemetry";
      }
    });
  }

  if (dom.btnCompConfirmRegister) {
    dom.btnCompConfirmRegister.addEventListener('click', async () => {
      if (!state.discoveredCompetitor) return;
      
      try {
        const res = await fetch('/api/competitors', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(state.discoveredCompetitor)
        });
        
        if (!res.ok) throw new Error("Failed to register competitor");
        
        showToast("Competitor registered! Please RUN SYNTHESIS & Sync to initialize feeds.", "success");
        window.closeAddCompetitorModal();
        state.requiresSyncAndSynthesis = true;
        await loadData();
      } catch (err) {
        showToast("Could not register competitor inside registry database", "error");
      }
    });
  }
}

function renderHealthCompetitorsList() {
  const container = dom.healthCompetitorsList;
  if (!container) return;
  
  container.innerHTML = '';
  
  state.competitors.forEach(comp => {
    const card = document.createElement('div');
    card.className = 'editorial-card p-8 flex flex-col justify-between group';
    // Status badges
    const websiteStatus = comp.website ? 'text-green-700 font-bold' : 'text-red-700 font-bold';
    const githubStatus = comp.github_org ? 'text-green-700 font-bold' : 'text-red-700 font-bold';
    
    const hasJobs = comp.greenhouse_id || comp.job_board_url;
    const jobsStatus = hasJobs ? 'text-green-700 font-bold' : 'text-red-700 font-bold';
    
    const hasRss = comp.rss_feed || comp.rss_feed_url;
    const rssStatus = hasRss ? 'text-green-700 font-bold' : 'text-red-700 font-bold';
    
    card.innerHTML = `
      <div>
        <p class="font-meta-data text-secondary uppercase tracking-widest text-[10px] mb-2 italic">TELEMETRY TARGET</p>
        <h4 class="font-display-hero text-[24px] mb-4 group-hover:text-primary transition-colors">${comp.name}</h4>
        
        <div class="grid grid-cols-2 gap-4 mt-6 border-t border-outline-variant/10 pt-4 font-body-md text-xs text-secondary">
          <div class="flex items-center gap-2">
            <span class="material-symbols-outlined text-sm">language</span>
            <span>Website: <strong class="${websiteStatus}">${comp.website ? 'Active' : 'N/A'}</strong></span>
          </div>
          <div class="flex items-center gap-2">
            <span class="material-symbols-outlined text-sm">code</span>
            <span>GitHub: <strong class="${githubStatus}">${comp.github_org ? 'Active' : 'N/A'}</strong></span>
          </div>
          <div class="flex items-center gap-2">
            <span class="material-symbols-outlined text-sm">badge</span>
            <span>Jobs Board: <strong class="${jobsStatus}">${hasJobs ? 'Active' : 'N/A'}</strong></span>
          </div>
          <div class="flex items-center gap-2">
            <span class="material-symbols-outlined text-sm">rss_feed</span>
            <span>RSS Feed: <strong class="${rssStatus}">${hasRss ? 'Active' : 'N/A'}</strong></span>
          </div>
        </div>
      </div>
    `;
    
    container.appendChild(card);
  });
}

window.runQuickSynthesisAndSync = async function() {
  showToast("Initializing dynamic telemetry compilation...", "success");
  const runBtn = document.getElementById('btn-run-synthesis');
  if (runBtn) runBtn.disabled = true;
  
  try {
    const res = await fetch('/api/generate-briefing', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    });
    if (res.ok) {
      showToast("Synthesis Successful", "success");
      state.requiresSyncAndSynthesis = false;
      await loadData();
      window.switchTab('reports');
    } else {
      showToast("Synthesis script encountered database lock.", "error");
    }
  } catch (err) {
    showToast("Synthesis agent pipeline connection timed out.", "error");
  } finally {
    if (runBtn) runBtn.disabled = false;
  }
};
