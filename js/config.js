/**
 * TENET5 Site Configuration
 * 
 * Set your Supabase credentials here after creating a project at supabase.com
 * Or set them as window.SUPABASE_URL / window.SUPABASE_ANON before loading other scripts.
 * 
 * For the live chat: create a Supabase project, run the SQL in js/chat.js header,
 * and enable Google + Twitter OAuth providers in the Supabase dashboard.
 * 
 * Redirect URL for OAuth: https://tenet-5.github.io/auth-callback.html
 */

// ── Supabase (for auth + live chat widget) ────────────────────────────────────
// Replace with your actual Supabase project credentials
window.SUPABASE_URL  = 'https://YOUR_PROJECT.supabase.co';
window.SUPABASE_ANON = 'YOUR_ANON_KEY';

// ── Gemini API Key ────────────────────────────────────────────────────────────
// Optional: set a site-level key. Users can also provide their own in localStorage.
// WARNING: Setting this here exposes the key to all visitors. Use a restricted key.
// window.SITE_GEMINI_KEY = '';

// ── Feature Flags ─────────────────────────────────────────────────────────────
window.TENET5_CONFIG = {
  chatEnabled:    true,   // Show floating chat widget on all pages
  authEnabled:    true,   // Enable Google/X OAuth login
  geminiEnabled:  true,   // Enable AI research features
  supabaseReady:  false,  // Set to true after filling in credentials above
};
