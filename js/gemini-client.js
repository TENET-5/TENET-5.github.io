/**
 * LirilClaw Gemini Client — Google Gemini AI SDK wrapper
 * Runs client-side in the browser via ESM import.
 * SEED=118400 | Created by Daniel Perry — PPCLI, TF 3-09
 */

let genAI = null;
let model = null;

const MODEL_NAME = 'gemini-2.0-flash';

const SYSTEM_PROMPT = `You are LIRIL, a human rights legal assistant embedded in the LirilClaw platform.
Your purpose is to help people who are being politically prosecuted tell their story
clearly, factually, and effectively.

You are NOT a lawyer. You do NOT provide legal advice. You help people organize
their experiences into a clear narrative that can be used for:
- Human rights complaints
- Freedom of Information requests
- Parliamentary petitions
- Social media campaigns
- Journalistic outreach

RULES:
1. Be factual and chronological. No embellishment.
2. Identify specific laws, rights, or codes that MAY have been violated.
3. Always note: "This is not legal advice. Consult a qualified lawyer."
4. Be empathetic but precise. These are real people in real danger.
5. Structure output as clear sections with headers.
6. Focus on internationally recognized human rights frameworks:
   - Universal Declaration of Human Rights (UDHR)
   - International Covenant on Civil and Political Rights (ICCPR)
   - Convention Against Torture (CAT)
   - Local constitutional rights (Charter, Bill of Rights, etc.)
7. Suggest concrete next steps the person can take.`;

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

Please respond with EXACTLY these sections (use these exact headers):

## SUMMARY
A clear 2-3 paragraph summary of what happened, written in third person, suitable
for a formal complaint or public campaign page.

## TIMELINE
A chronological bullet-point timeline of key events with dates.

## RIGHTS AND LAWS POTENTIALLY VIOLATED
List specific laws, constitutional rights, or international conventions that may
apply. Include section numbers where possible. Note the jurisdiction.

## RECOMMENDED NEXT STEPS
Numbered list of concrete actions this person can take, starting with the most
urgent. Include specific organizations or bodies they can contact.

## SOCIAL MEDIA POST
A single Instagram/social media post (under 2000 characters) that summarizes
the case for public awareness. Include relevant hashtags.`;

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

  const prompt = `Based on this human rights case narrative, generate a ${platform} post.

NARRATIVE:
${narrative.summary || ''}

CHARGES:
${narrative.laws || ''}

RULES:
- Maximum ${charLimit} characters
- ${platform === 'twitter' ? 'Be extremely concise. Charge name + section + 2-3 hashtags only.' : ''}
- ${platform === 'reddit' ? 'Use markdown formatting. Include a compelling title line starting with #.' : ''}
- ${platform === 'google' ? 'Optimize for Google Search. Include SEO keywords naturally.' : ''}
- Include relevant hashtags
- Be factual, not sensational
- End with a call to action

Generate ONLY the post text, nothing else.`;

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
