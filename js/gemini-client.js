/**
 * LirilClaw Gemini Client — Google Gemini AI SDK wrapper
 * Runs client-side in the browser via ESM import.
 * SEED=118400 | Created by Daniel Perry
 */

let genAI = null;
let model = null;

const MODEL_NAME = 'gemini-2.0-flash';

const SYSTEM_PROMPT = `You are LIRIL, a human rights legal documentation assistant embedded in the LirilClaw platform.
Your purpose is to help people who are being politically prosecuted document their case
clearly, factually, and effectively — so they can fight back through legal and public channels.

You are NOT a lawyer. You do NOT provide legal advice. You help people organize
their experiences into a clear, evidence-based narrative that can be used for:
- Human rights complaints to commissions and tribunals
- Freedom of Information requests
- Letters to elected representatives (MPs, senators, congresspeople)
- Private prosecution filings (e.g., Criminal Code s.504 in Canada)
- UN Human Rights Council individual complaints
- Social media campaigns for public awareness
- Media and journalistic outreach

RULES:
1. Be factual and chronological. No embellishment or speculation.
2. Identify SPECIFIC laws, rights, or codes that MAY have been violated — include section numbers.
3. Always note: "This is not legal advice. Consult a qualified lawyer."
4. Be empathetic but precise. These are real people in real danger.
5. Structure output as clear sections with markdown headers (## SECTION NAME).
6. For each law cited, explain WHY it may apply to this specific situation.
7. Focus on internationally recognized human rights frameworks:
   - Universal Declaration of Human Rights (UDHR) — cite specific articles
   - International Covenant on Civil and Political Rights (ICCPR) — cite articles
   - Convention Against Torture (CAT) — cite articles
   - Rome Statute (ICC) — if crimes against humanity or war crimes apply
   - Local constitutional rights (Charter of Rights and Freedoms, Bill of Rights, ECHR)
   - Local criminal code provisions with section numbers
8. Suggest concrete, actionable next steps — with specific organization names and URLs.
9. Write the social media post to be compelling but factual — it must make people care AND share.
10. Use numbered charges format: "1. CHARGE NAME — Section X.XX" for legal analysis.`;

const NARRATIVE_TEMPLATE = `A person is seeking help documenting their case of political persecution.
Please analyze their situation and produce a structured response.

## Their Story

**What happened:**
{what_happened}

**Who did this (names, organizations, positions):**
{who_did_it}

**When (dates, timeline):**
{when_happened}

**Where (location, jurisdiction):**
{where_happened}

**Evidence they have:**
{evidence}

**Jurisdiction:**
{jurisdiction}

---

Please respond with EXACTLY these sections (use these exact ## headers):

## SUMMARY
A clear 2-3 paragraph summary of what happened, written in third person, suitable
for a formal human rights complaint or public campaign page. Be specific about
who, what, when, where. Name the actors and their roles.

## TIMELINE
A chronological bullet-point timeline of key events with dates. Format:
* [DATE]: [EVENT]
Include approximate dates if exact dates aren't known.

## RIGHTS AND LAWS POTENTIALLY VIOLATED
Use numbered format. For EACH violation:
1. CHARGE/VIOLATION NAME — Section/Article number
   Explanation of why this specific law may apply to this situation.

Include both LOCAL laws (criminal code, constitutional rights) and
INTERNATIONAL law (UDHR articles, ICCPR articles, CAT articles, Rome Statute).
Cite specific section numbers for every entry.

## RECOMMENDED NEXT STEPS
Numbered list of 8-10 concrete actions, starting with most urgent.
For each step include:
- The specific organization or body to contact
- A URL if available
- What to file or request
- Why this step matters

## SOCIAL MEDIA POST
A single Instagram-ready post (under 2000 characters) that:
- Opens with an attention-grabbing factual statement
- Summarizes the case in 3-4 sentences
- Lists the top 3-5 charges with section numbers
- Ends with a call to action
- Includes 8-10 relevant hashtags
- Is factual, not sensational — but compelling enough to make people share`;

/**
 * Initialize the Gemini SDK with an API key.
 */
export async function initGemini(apiKey) {
  const { GoogleGenerativeAI } = await import('https://esm.run/@google/generative-ai');
  genAI = new GoogleGenerativeAI(apiKey);
  model = genAI.getGenerativeModel({
    model: MODEL_NAME,
    systemInstruction: { parts: [{ text: SYSTEM_PROMPT }] },
  });
  return true;
}

/**
 * Test the connection by sending a minimal prompt.
 */
export async function testConnection() {
  if (!model) throw new Error('Gemini not initialized. Call initGemini() first.');
  const result = await model.generateContent('Say "LIRIL online. SEED=118400." and nothing else.');
  return result.response.text();
}

/**
 * Build a narrative from user input.
 */
export async function buildNarrative(formData) {
  if (!model) throw new Error('Gemini not initialized.');

  const prompt = NARRATIVE_TEMPLATE
    .replace('{what_happened}', formData.what_happened || '[Not provided]')
    .replace('{who_did_it}', formData.who_did_it || '[Not provided]')
    .replace('{when_happened}', formData.when_happened || '[Not provided]')
    .replace('{where_happened}', formData.where_happened || '[Not provided]')
    .replace('{evidence}', formData.evidence || '[Not provided]')
    .replace('{jurisdiction}', formData.jurisdiction || 'International');

  const result = await model.generateContent({
    contents: [{ role: 'user', parts: [{ text: prompt }] }],
    generationConfig: { maxOutputTokens: 4096, temperature: 0.3 },
  });

  const text = result.response.text();
  return parseSections(text);
}

/**
 * Refine an existing narrative with new input.
 */
export async function refineNarrative(previousSummary, newInput) {
  if (!model) throw new Error('Gemini not initialized.');

  const prompt = `The person has provided additional information about their case.
Here is the previous narrative summary:

${previousSummary}

Here is their new input:

${newInput}

Please update the narrative with this new information. Use the same section format as before.`;

  const result = await model.generateContent({
    contents: [{ role: 'user', parts: [{ text: prompt }] }],
    generationConfig: { maxOutputTokens: 4096, temperature: 0.3 },
  });

  return parseSections(result.response.text());
}

/**
 * Generate a platform-specific social media post.
 */
export async function generatePost(platform, narrative) {
  if (!model) throw new Error('Gemini not initialized.');

  const limits = {
    instagram: 2200,
    twitter: 280,
    reddit: 10000,
    google: 1500,
  };
  const charLimit = limits[platform] || 2200;

  const platformInstructions = {
    instagram: `Instagram post (max ${charLimit} chars):
- Open with a powerful factual statement or statistic
- Summarize the case in 2-3 sentences
- List 3-5 specific charges with legal section numbers
- Add a call to action (share, contact MP, file complaint)
- End with 8-12 relevant hashtags on a new line
- Use line breaks for readability`,
    twitter: `Twitter/X post (max ${charLimit} chars):
- ONE charge name + legal section number
- ONE sentence explaining what happened
- 2-3 hashtags
- Must be under 280 characters total. Be extremely concise.`,
    reddit: `Reddit post with markdown:
- Start with a compelling # title
- **Bold** key names and charges
- Structure with clear paragraphs
- Include a "What you can do" section
- End with links to evidence or organizations
- Longer format is fine — Reddit rewards detail`,
    google: `Google Business/Search optimized post (max ${charLimit} chars):
- Use SEO-friendly language (human rights, political persecution, whistleblower, accountability)
- Include the jurisdiction and key organization names
- Structure for featured snippet potential
- End with a clear call to action`,
  };

  const prompt = `Based on this human rights case, generate a ${platform} post.

CASE SUMMARY:
${narrative.summary || ''}

LEGAL CHARGES:
${narrative.laws || ''}

INSTRUCTIONS:
${platformInstructions[platform] || platformInstructions.instagram}

Generate ONLY the post text. No explanations or meta-commentary.`;

  const result = await model.generateContent({
    contents: [{ role: 'user', parts: [{ text: prompt }] }],
    generationConfig: { maxOutputTokens: 1024, temperature: 0.5 },
  });

  const text = result.response.text().trim();
  return { post: text.slice(0, charLimit), platform, charCount: Math.min(text.length, charLimit) };
}

/**
 * Suggest OSINT search queries based on the narrative.
 */
export async function suggestSearches(narrative) {
  if (!model) throw new Error('Gemini not initialized.');

  const prompt = `Based on this human rights case, suggest 5 specific search queries to find supporting evidence.

SUMMARY: ${narrative.summary || ''}
LAWS: ${narrative.laws || ''}

For each query, provide:
1. The search query text
2. Which search engine to use (Google, DuckDuckGo, CanLII, Google Scholar)
3. What evidence this might find

Format as a numbered list.`;

  const result = await model.generateContent({
    contents: [{ role: 'user', parts: [{ text: prompt }] }],
    generationConfig: { maxOutputTokens: 1024, temperature: 0.3 },
  });

  return result.response.text();
}

/**
 * Parse AI response into sections by ## headers.
 */
export function parseSections(text) {
  const sections = {};
  let currentKey = 'raw';
  let currentLines = [];

  for (const line of text.split('\n')) {
    if (line.startsWith('## ')) {
      if (currentLines.length > 0) {
        sections[currentKey] = currentLines.join('\n').trim();
      }
      currentKey = line.replace('## ', '').trim().toLowerCase().replace(/\s+/g, '_');
      currentLines = [];
    } else {
      currentLines.push(line);
    }
  }
  if (currentLines.length > 0) {
    sections[currentKey] = currentLines.join('\n').trim();
  }

  // Normalize common keys
  return {
    summary: sections['summary'] || sections['raw'] || '',
    timeline: sections['timeline'] || '',
    laws: sections['rights_and_laws_potentially_violated'] || sections['laws'] || '',
    next_steps: sections['recommended_next_steps'] || sections['next_steps'] || '',
    social_post: sections['social_media_post'] || sections['social_post'] || '',
    raw: text,
  };
}

/**
 * Check if Gemini is initialized.
 */
export function isReady() {
  return model !== null;
}
