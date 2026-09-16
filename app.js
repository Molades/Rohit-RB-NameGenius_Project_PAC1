const STORAGE_KEY = "namegenius_groq_api_key";
const GROQ_MODEL = "llama-3.1-8b-instant";
const GROQ_ENDPOINT = "https://api.groq.com/openai/v1/chat/completions";
const RDAP_BASE = "https://rdap.verisign.com/com/v1/domain/";

const form = document.getElementById("searchForm");
const keywordInput = document.getElementById("keywordInput");
const generateBtn = document.getElementById("generateBtn");
const errorMsg = document.getElementById("errorMsg");
const resultsLabel = document.getElementById("resultsLabel");
const cardsGrid = document.getElementById("cardsGrid");

const settingsToggle = document.getElementById("settingsToggle");
const settingsDialog = document.getElementById("settingsDialog");
const apiKeyInput = document.getElementById("apiKeyInput");
const apiKeyClear = document.getElementById("apiKeyClear");

function getApiKey() {
  return localStorage.getItem(STORAGE_KEY) || "";
}

function setApiKey(key) {
  if (key) localStorage.setItem(STORAGE_KEY, key);
  else localStorage.removeItem(STORAGE_KEY);
}

settingsToggle.addEventListener("click", () => {
  apiKeyInput.value = getApiKey();
  settingsDialog.showModal();
});

settingsDialog.addEventListener("close", () => {
  if (settingsDialog.returnValue === "save") {
    setApiKey(apiKeyInput.value.trim());
  }
});

apiKeyClear.addEventListener("click", () => {
  apiKeyInput.value = "";
  setApiKey("");
});

function showError(message) {
  errorMsg.textContent = message;
  errorMsg.hidden = false;
}

function clearError() {
  errorMsg.hidden = true;
  errorMsg.textContent = "";
}

function domainFor(name) {
  const slug = name.toLowerCase().replace(/[^a-z0-9]/g, "");
  return `${slug || "name"}.com`;
}

function renderSkeletons(count) {
  cardsGrid.innerHTML = "";
  for (let i = 0; i < count; i++) {
    const card = document.createElement("div");
    card.className = "card skeleton";
    card.innerHTML = `
      <div class="skeleton-line w1"></div>
      <div class="skeleton-line w2"></div>
      <div class="skeleton-line badge-sk"></div>
    `;
    cardsGrid.appendChild(card);
  }
}

function renderCards(names) {
  cardsGrid.innerHTML = "";
  return names.map((name) => {
    const domain = domainFor(name);
    const card = document.createElement("div");
    card.className = "card";
    card.innerHTML = `
      <div class="card-name">${escapeHtml(name)}</div>
      <div class="card-domain">${escapeHtml(domain)}</div>
      <div class="badge checking">Checking…</div>
    `;
    cardsGrid.appendChild(card);
    return { name, domain, badgeEl: card.querySelector(".badge") };
  });
}

function escapeHtml(str) {
  const div = document.createElement("div");
  div.textContent = str;
  return div.innerHTML;
}

function setBadge(badgeEl, status) {
  badgeEl.classList.remove("checking", "available", "taken", "unknown");
  if (status === "available") {
    badgeEl.classList.add("available");
    badgeEl.textContent = "Available";
  } else if (status === "taken") {
    badgeEl.classList.add("taken");
    badgeEl.textContent = "Taken";
  } else {
    badgeEl.classList.add("unknown");
    badgeEl.textContent = "Unknown";
  }
}

// .com registration lookup via Verisign's public RDAP endpoint — the
// registry's own authoritative record, free, keyless, CORS-enabled.
async function checkDomain(domain) {
  try {
    const res = await fetch(RDAP_BASE + encodeURIComponent(domain), {
      headers: { Accept: "application/rdap+json" },
    });
    if (res.status === 404) return "available";
    if (res.status === 200) return "taken";
    return "unknown";
  } catch {
    return "unknown";
  }
}

// AI path: Groq's free tier (api.groq.com) — no credit card required,
// OpenAI-compatible chat endpoint, CORS-enabled for direct browser calls.
async function generateNamesWithGroq(keyword, apiKey) {
  const prompt = `Generate 10 short, brandable business name ideas related to the keyword or theme: "${keyword}".
Rules:
- Each name should be 1-3 words, easy to say, suitable as a .com domain name
- No generic filler words like "Solutions", "Inc", "LLC"
- No explanations, no numbering, no markdown
- Respond with ONLY a JSON array of 10 strings, nothing else. Example: ["Name1","Name2"]`;

  const res = await fetch(GROQ_ENDPOINT, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: GROQ_MODEL,
      max_tokens: 400,
      messages: [{ role: "user", content: prompt }],
    }),
  });

  if (!res.ok) {
    let detail = "";
    try {
      const errBody = await res.json();
      detail = errBody?.error?.message || "";
    } catch {}
    if (res.status === 401) throw new Error("Invalid Groq API key. Check it in settings (bottom-right gear).");
    throw new Error(detail || `Groq API error (${res.status})`);
  }

  const data = await res.json();
  const text = data?.choices?.[0]?.message?.content || "";
  const match = text.match(/\[[\s\S]*\]/);
  if (!match) throw new Error("Couldn't parse name ideas from the model's response.");
  const names = JSON.parse(match[0]);
  if (!Array.isArray(names) || names.length === 0) {
    throw new Error("Model returned no name ideas.");
  }
  return names.slice(0, 10).map((n) => String(n).trim()).filter(Boolean);
}

// Offline fallback: no key, no network call, works instantly. Combines
// the keyword with a curated pool of brandable prefixes/suffixes.
const LOCAL_PREFIXES = [
  "Go", "Get", "My", "The", "Pure", "Urban", "Bright", "True", "Nimbus",
  "Bold", "Prime", "Nova", "Craft", "Kindred", "Vivid", "North", "Everly", "Loom",
];
const LOCAL_SUFFIXES = [
  "Hub", "Co", "Studio", "Labs", "Works", "Loop", "Collective", "House",
  "Nest", "Craft", "Society", "Market", "Lane", "Forge", "Atlas",
];

function toTitleWords(keyword) {
  return keyword
    .split(/[^a-zA-Z0-9]+/)
    .filter(Boolean)
    .map((w) => w[0].toUpperCase() + w.slice(1).toLowerCase());
}

function shuffled(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function generateNamesLocal(keyword) {
  const words = toTitleWords(keyword);
  if (words.length === 0) return [];
  const short = words.map((w) => (w.length > 6 ? w.slice(0, 5) : w));

  const candidates = new Set();
  const prefixes = shuffled(LOCAL_PREFIXES);
  const suffixes = shuffled(LOCAL_SUFFIXES);
  let pi = 0;
  let si = 0;

  const nextPrefix = () => prefixes[pi++ % prefixes.length];
  const nextSuffix = () => suffixes[si++ % suffixes.length];

  // combine adjacent keyword words first, e.g. "Sustainable" + "Fashion"
  for (let i = 0; i < words.length - 1 && candidates.size < 10; i++) {
    candidates.add(words[i] + words[i + 1]);
  }

  let guard = 0;
  while (candidates.size < 10 && guard < 200) {
    guard++;
    const word = words[guard % words.length];
    const shortWord = short[guard % short.length];
    const pattern = guard % 3;
    let name;
    if (pattern === 0) name = nextPrefix() + word;
    else if (pattern === 1) name = word + nextSuffix();
    else name = nextPrefix() + shortWord;
    if (name.length <= 20) candidates.add(name);
  }

  return [...candidates].slice(0, 10);
}

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  clearError();

  const keyword = keywordInput.value.trim();
  if (!keyword) return;

  const apiKey = getApiKey();

  generateBtn.disabled = true;
  generateBtn.textContent = "Generating…";
  resultsLabel.textContent = `Generating names for "${keyword}"…`;
  resultsLabel.classList.remove("placeholder");
  renderSkeletons(10);

  try {
    let names;
    if (apiKey) {
      try {
        names = await generateNamesWithGroq(keyword, apiKey);
      } catch (err) {
        names = generateNamesLocal(keyword);
        showError(`Groq call failed (${err.message}) — showing offline-generated names instead.`);
      }
    } else {
      names = generateNamesLocal(keyword);
    }

    resultsLabel.textContent = `Checking .com availability for "${keyword}"…`;
    const cards = renderCards(names);

    await Promise.all(
      cards.map(async ({ domain, badgeEl }) => {
        const status = await checkDomain(domain);
        setBadge(badgeEl, status);
      })
    );

    resultsLabel.textContent = `Results for "${keyword}"`;
  } catch (err) {
    resultsLabel.textContent = "Enter a keyword above and hit Generate to see 8–10 name ideas with domain status";
    resultsLabel.classList.add("placeholder");
    cardsGrid.innerHTML = "";
    showError(err.message || "Something went wrong. Try again.");
  } finally {
    generateBtn.disabled = false;
    generateBtn.textContent = "Generate Names";
  }
});
