/* ═══════════════════════════════════════════════════════
   TENET5 i18n Engine — English | French
   2026-04-16: Newfie dialect mangler removed. It was hallucinating
   in dialect on pages like veterans-betrayal.html. Any stale `nf`
   localStorage is auto-migrated back to `en` on next page load.
   ═══════════════════════════════════════════════════════ */

(function() {
    const LANG_KEY = 'tenet5_lang';
    let currentLang = localStorage.getItem(LANG_KEY) || 'en';

    // Migrate any stale Newfie preference back to English so returning
    // visitors don't keep seeing dialect output after the feature is gone.
    if (currentLang === 'nf') {
        currentLang = 'en';
        try { localStorage.setItem(LANG_KEY, 'en'); } catch (e) {}
    }

    window.setSiteLanguage = function(lang) {
        // Defence-in-depth: refuse any value that isn't one of the two
        // supported languages, so URL-injected ?lang=nf can't re-enable it.
        if (lang !== 'en' && lang !== 'fr') lang = 'en';
        localStorage.setItem(LANG_KEY, lang);
        location.reload();
    };

    if (currentLang === 'en') return; // Default, no processing needed.

    // ─── French Dictionary (UI & Navigation Hub) ───
    const dictFR = {
        "Home": "Accueil",
        "Records DB": "Base de données",
        "MAID Report": "Rapport AMM",
        "RCMP": "GRC",
        "ArriveCAN": "ArriveCAN",
        "Senate": "Sénat",
        "AG Findings": "Conclusions de la VG",
        "Phoenix Pay": "Phénix",
        "Foreign Interference": "Ingérence étrangère",
        "Publications": "Publications",
        "Kit Shop": "Boutique",
        "Simple Guide": "Guide simplifié",
        "CDS": "CEMD",
        "All Pages": "Toutes les pages",
        "Malice Doctrine": "Doctrine de Malice",
        "Follow $": "Suivre l'argent",
        "Powered by LIRIL AI": "Propulsé par l'IA LIRIL",
        "Generate Template": "Générer le modèle",
        "Access Dossier": "Accéder au dossier",
        "Copy to Clipboard": "Copier dans le presse-papiers"
    };

    function applyFrench(node) {
        if (dictFR[node.nodeValue.trim()]) {
            node.nodeValue = node.nodeValue.replace(node.nodeValue.trim(), dictFR[node.nodeValue.trim()]);
        }
    }

    // ─── DOM Walker ───
    function walkDOM(node) {
        // Skip <pre>, <code>, and <script> tags to protect legal templates and logic
        if (node.tagName && ['PRE', 'CODE', 'SCRIPT', 'STYLE'].includes(node.tagName.toUpperCase())) {
            return;
        }

        if (node.nodeType === 3) { // Text node
            if (currentLang === 'fr') {
                applyFrench(node);
            }
        } else {
            for (let child of node.childNodes) {
                walkDOM(child);
            }
        }
    }

    document.addEventListener("DOMContentLoaded", () => {
        if (currentLang === 'fr') {
            // French: ONLY translate nav/UI elements — never body content
            // Target nav links, buttons, and UI chrome — NOT investigation text
            const navEl = document.querySelector('nav, .site-nav, #site-header-frame');
            if (navEl) walkDOM(navEl);
            // Also translate footer if present
            const footerEl = document.querySelector('footer, .site-footer, #site-footer-frame');
            if (footerEl) walkDOM(footerEl);
        }

        // Update Language Selector UI Selection if exists
        const langSelect = document.getElementById('lang-selector');
        if (langSelect) {
            langSelect.value = currentLang;
        }
    });

})();
