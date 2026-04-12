/**
 * gemini-research.js — Google Gemini AI Research & Commentary integration
 * Allows signed-in Google users to use their Gemini AI for research on the site
 * Canadian Government Accountability Investigation
 *
 * Uses Google AI Studio API (client-side ESM)
 * Docs: https://ai.google.dev/gemini-api/docs/quickstart?lang=web
 */

// ── Models ────────────────────────────────────────────────────────────────────
const RESEARCH_MODEL   = 'gemini-2.0-flash';
const GROUNDING_MODEL  = 'gemini-2.0-flash';  // supports Google Search grounding

// ── Research system prompt ────────────────────────────────────────────────────
const RESEARCH_SYSTEM = `You are an investigative research assistant embedded in the Canadian Accountability Project,
a Canadian government accountability investigation platform.

Your role is to help citizens research Canadian politics, governance, legislation,
public officials, contracts, and policy decisions using publicly available information.

GUIDELINES:
- Focus on factual, verifiable information from public records
- Cite sources (Hansard, government websites, news outlets, Statistics Canada, etc.)
- Note when information may be incomplete or requires verification
- Flag conflicts of interest, procurement anomalies, and policy inconsistencies
- Reference relevant legislation by section number when applicable
- Be analytical, not partisan — present facts and let users draw conclusions
- For municipal research: reference council minutes, budget documents, auditor reports
- Always distinguish between allegations and proven facts`;

// ── Commentary system prompt ──────────────────────────────────────────────────
const COMMENTARY_SYSTEM = `You are a political commentary assistant for the Canadian Accountability Project,
a Canadian government accountability platform. Help users understand and comment on
Canadian political events, policies, and governance issues.

Be balanced, cite evidence, and help users formulate clear evidence-based commentary.`;

// ── Init with user's API key or site key ─────────────────────────────────────
let _ai = null;
let _apiKey = null;

export function setApiKey(key) {
  _apiKey = key;
  _ai = null;
  localStorage.setItem('t5_gemini_key', key);
}

export function getStoredApiKey() {
  return localStorage.getItem('t5_gemini_key') || '';
}

function getAI() {
  if (!_apiKey) throw new Error('No Gemini API key set. Get one free at https://aistudio.google.com/apikey');
  if (!window.GoogleGenerativeAI) throw new Error('Gemini SDK not loaded');
  if (!_ai) _ai = new window.GoogleGenerativeAI(_apiKey);
  return _ai;
}

// ── Stream a research response ────────────────────────────────────────────────
export async function* streamResearch(query, { useGrounding = true, systemPrompt = null } = {}) {
  const ai = getAI();
  const modelName = useGrounding ? GROUNDING_MODEL : RESEARCH_MODEL;

  const config = {
    systemInstruction: systemPrompt || RESEARCH_SYSTEM,
  };

  // Google Search grounding — gives real-time Canadian news context
  if (useGrounding) {
    config.tools = [{ googleSearch: {} }];
  }

  const model = ai.getGenerativeModel({ model: modelName, ...config });

  const result = await model.generateContentStream([
    { text: `Research request for Canadian government accountability investigation:\n\n${query}` }
  ]);

  for await (const chunk of result.stream) {
    const text = chunk.text();
    if (text) yield text;
  }

  // Return grounding metadata if available
  const finalResponse = await result.response;
  const groundingMeta = finalResponse.candidates?.[0]?.groundingMetadata;
  if (groundingMeta?.webSearchQueries?.length) {
    yield `\n\n---\n*🔍 Google Search queries used: ${groundingMeta.webSearchQueries.join(', ')}*`;
  }
  if (groundingMeta?.groundingChunks?.length) {
    const sources = groundingMeta.groundingChunks
      .filter(c => c.web?.uri)
      .map(c => `[${c.web.title || c.web.uri}](${c.web.uri})`)
      .join(', ');
    if (sources) yield `\n*📰 Sources: ${sources}*`;
  }
}

// ── One-shot commentary generation ───────────────────────────────────────────
export async function generateCommentary(topic, userContext = '') {
  const ai = getAI();
  const model = ai.getGenerativeModel({
    model: RESEARCH_MODEL,
    systemInstruction: COMMENTARY_SYSTEM,
  });

  const prompt = userContext
    ? `Topic: ${topic}\n\nUser context: ${userContext}\n\nProvide analytical commentary.`
    : `Provide analytical commentary on: ${topic}`;

  const result = await model.generateContent(prompt);
  return result.response.text();
}

// ── Summarize a news article or document ─────────────────────────────────────
export async function summarizeDocument(text, focus = 'accountability and governance') {
  const ai = getAI();
  const model = ai.getGenerativeModel({ model: RESEARCH_MODEL });

  const result = await model.generateContent([
    `Summarize the following document with focus on ${focus}. 
     Identify key findings, persons of interest, financial figures, and any red flags.
     Format with clear sections.\n\n---\n${text.slice(0, 30000)}`
  ]);
  return result.response.text();
}

// ── Render markdown to HTML (simple) ─────────────────────────────────────────
export function renderMarkdown(text) {
  return text
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/^### (.+)$/gm, '<h3>$1</h3>')
    .replace(/^## (.+)$/gm, '<h2>$1</h2>')
    .replace(/^# (.+)$/gm, '<h1>$1</h1>')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/`(.+?)`/g, '<code>$1</code>')
    .replace(/^\* (.+)$/gm, '<li>$1</li>')
    .replace(/(<li>.*<\/li>)/s, '<ul>$1</ul>')
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener">$1</a>')
    .replace(/\n{2,}/g, '</p><p>')
    .replace(/^(?!<[hul])/gm, '')
    .replace(/(.+)/s, '<p>$1</p>');
}
