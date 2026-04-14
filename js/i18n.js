/* ═══════════════════════════════════════════════════════
   TENET5 i18n Engine - English | French | Newfoundland
   ═══════════════════════════════════════════════════════ */

(function() {
    const LANG_KEY = 'tenet5_lang';
    let currentLang = localStorage.getItem(LANG_KEY) || 'en';

    window.setSiteLanguage = function(lang) {
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

    // ─── Newfie Dialect Algorithm Rules ───
    // Order matters: longer phrases first, then single-word swaps, then grammar last.
    const newfieRules = [
        // ── Multi-word phrases (match BEFORE single words) ──
        { regex: /\bWhat are you doing\b/gi, replacement: "Whaddya at, ye lazy fuck" },
        { regex: /\bWhat is going on\b/gi, replacement: "What in the flying fuck is goin' on here" },
        { regex: /\bI have (completed|finished|done)\b/gi, replacement: "I's after $1in' dat shit" },
        { regex: /\bI have been\b/gi, replacement: "I been after bein'" },
        { regex: /\bI don't know\b/gi, replacement: "Fucked if I know, b'y" },
        { regex: /\bI don't care\b/gi, replacement: "I don't give a rat's hairy arsehole" },
        { regex: /\bcome here\b/gi, replacement: "git yer arse over 'ere" },
        { regex: /\bare you serious\b/gi, replacement: "are ye jerkin' my fuckin' chain" },
        { regex: /\bshut up\b/gi, replacement: "shut yer fuckin' gob" },
        { regex: /\bget out\b/gi, replacement: "fuck right off" },
        { regex: /\bgo away\b/gi, replacement: "fuck off wit' ye" },
        { regex: /\bover there\b/gi, replacement: "over d'ere" },
        { regex: /\bright now\b/gi, replacement: "right fuckin' now" },
        { regex: /\bI am going to\b/gi, replacement: "I's gonna" },
        { regex: /\bgoing to\b/gi, replacement: "gonna" },
        { regex: /\blook at that\b/gi, replacement: "luh at dat shit" },
        { regex: /\byou are\b/gi, replacement: "you's" },
        { regex: /\bare you\b/gi, replacement: "is ye" },
        { regex: /\bthat is\b/gi, replacement: "dat's" },
        { regex: /\bthis is\b/gi, replacement: "dis is" },
        { regex: /\bdo you want\b/gi, replacement: "d'ya want" },
        { regex: /\bI am\b/g, replacement: "I's" },
        { regex: /\bis not\b/gi, replacement: "ain't" },
        { regex: /\bit is\b/gi, replacement: "'tis" },
        { regex: /\bfor god's sake\b/gi, replacement: "fer fucks sakes" },
        { regex: /\boh my god\b/gi, replacement: "jaysus murphy" },
        { regex: /\boh god\b/gi, replacement: "lard tunderin' fuck" },

        // ── Pronouns & determiners ──
        { regex: /\bmy\b/gi, replacement: "me" },
        { regex: /\bYou\b/g, replacement: "Ye" },
        { regex: /\byou\b/g, replacement: "ye" },
        { regex: /\bThem\b/g, replacement: "D'em" },
        { regex: /\bthem\b/g, replacement: "d'em" },
        { regex: /\bTheir\b/g, replacement: "D'eir" },
        { regex: /\btheir\b/g, replacement: "d'eir" },
        { regex: /\bThose\b/g, replacement: "D'em" },
        { regex: /\bthose\b/g, replacement: "d'em" },
        { regex: /\bThis\b/g, replacement: "Dis" },
        { regex: /\bthis\b/g, replacement: "dis" },
        { regex: /\bThat\b/g, replacement: "Dat" },
        { regex: /\bthat\b/g, replacement: "dat" },
        { regex: /\bThere\b/g, replacement: "D'ere" },
        { regex: /\bthere\b/g, replacement: "d'ere" },
        { regex: /\bThe\b/g, replacement: "Da" },
        { regex: /\bthe\b/g, replacement: "da" },
        { regex: /\bThey\b/g, replacement: "D'ey" },
        { regex: /\bthey\b/g, replacement: "d'ey" },

        // ── Verbs & conjugation ──
        { regex: /\b(I) (go|want|say|know|think|have|need|see|tell)\b/g, replacement: "I $2s" },
        { regex: /\bwas\b/gi, replacement: "were" },
        { regex: /\bwasn't\b/gi, replacement: "warn't" },

        // ── Intensifiers & adjectives ──
        { regex: /\bVery\b/g, replacement: "Fucking" },
        { regex: /\bvery\b/g, replacement: "fucking" },
        { regex: /\breally\b/gi, replacement: "right fuckin'" },
        { regex: /\bextremely\b/gi, replacement: "sickeningly" },
        { regex: /\bcompletely\b/gi, replacement: "altogether" },

        // ── Nouns & slang ──
        { regex: /\bHello\b/gi, replacement: "Whaddya at, cunts" },
        { regex: /\bgoodbye\b/gi, replacement: "fuck off den" },
        { regex: /\byes\b/gi, replacement: "yeah, b'y" },
        { regex: /\bno\b/g, replacement: "fuck no" },
        { regex: /\bfriend\b/gi, replacement: "buddy" },
        { regex: /\bfriends\b/gi, replacement: "crowd" },
        { regex: /\bperson\b/gi, replacement: "bastard" },
        { regex: /\bpeople\b/gi, replacement: "bastards" },
        { regex: /\bboy\b/gi, replacement: "b'y" },
        { regex: /\bman\b/g, replacement: "skipper" },
        { regex: /\bwoman\b/gi, replacement: "bitch" },
        { regex: /\bhouse\b/gi, replacement: "shack" },
        { regex: /\bmoney\b/gi, replacement: "fuckin' dolla" },
        { regex: /\bdrunk\b/gi, replacement: "hammered to shit" },
        { regex: /\bstupid\b/gi, replacement: "brain-dead as me arse" },
        { regex: /\bidiot\b/gi, replacement: "fuckin' gommel" },
        { regex: /\bcrazy\b/gi, replacement: "cracked outta their minds" },
        { regex: /\bliar\b/gi, replacement: "lyin' piece of shit" },
        { regex: /\bcorrupt\b/gi, replacement: "crooked as a dog's hind leg" },
        { regex: /\bcorruption\b/gi, replacement: "rat-fucking" },
        { regex: /\bfraud\b/gi, replacement: "goddamn thievery" },
        { regex: /\bcriminal\b/gi, replacement: "fuckin' crook" },
        { regex: /\bpolice\b/gi, replacement: "pig bastards" },
        { regex: /\bgovernment\b/gi, replacement: "corrupt cunts in Ottawa" },
        { regex: /\bpolitician\b/gi, replacement: "rat-fuck politician" },
        { regex: /\bpoliticians\b/gi, replacement: "da bloody rat-fucks" },
        { regex: /\bminister\b/gi, replacement: "shitbag minister" },
        { regex: /\binvestigation\b/gi, replacement: "bullshit sniff-around" },
        { regex: /\bevidence\b/gi, replacement: "da fuckin' proof" },
        { regex: /\bwhistleblower\b/gi, replacement: "poor bastard what ratted" },
        { regex: /\bveteran\b/gi, replacement: "b'y what served" },
        { regex: /\bveterans\b/gi, replacement: "b'ys what served" },
        { regex: /\bsoldier\b/gi, replacement: "b'y in uniform" },
        { regex: /\bsoldiers\b/gi, replacement: "b'ys in uniform" },
        { regex: /\bmurder\b/gi, replacement: "fuckin' murder" },
        { regex: /\bkilled\b/gi, replacement: "butchered" },
        { regex: /\bdestroyed\b/gi, replacement: "ruint to shit" },
        { regex: /\bbroken\b/gi, replacement: "busted to shit" },
        { regex: /\bterrible\b/gi, replacement: "wicked awful" },
        { regex: /\bhorrible\b/gi, replacement: "right shockin'" },
        { regex: /\bgreat\b/gi, replacement: "best kind" },
        { regex: /\bexcellent\b/gi, replacement: "fuckin' mint" },
        { regex: /\bgood\b/gi, replacement: "some good" },
        { regex: /\bbad\b/gi, replacement: "right rotten" },
        { regex: /\bnothing\b/gi, replacement: "not a goddamn t'ing" },
        { regex: /\bsomething\b/gi, replacement: "somet'ing" },
        { regex: /\beverything\b/gi, replacement: "every last fuckin' t'ing" },
        { regex: /\banything\b/gi, replacement: "a single friggin' t'ing" },
        { regex: /\blook\b/gi, replacement: "luh" },
        { regex: /\bcold\b/gi, replacement: "right frosty" },
        { regex: /\btired\b/gi, replacement: "beat right out" },
        { regex: /\bhungry\b/gi, replacement: "gut-foundered" },
        { regex: /\bconfused\b/gi, replacement: "all mops and brooms" },
        { regex: /\bscared\b/gi, replacement: "frighten't to death" },
        { regex: /\bangry\b/gi, replacement: "fuckin' poisoned" },

        // ── Grammar transforms (LAST — broadest patterns) ──
        { regex: /(\w+)ing\b/g, replacement: "$1in'" }  // workin', talkin', etc.
    ];

    // Random end-of-sentence interjections for extra flavour
    const _newfieExclamations = [
        ", b'y", ", luh", ", wha", ", fuck me dead", ", me ducky",
        ", I tells ye", ", lard tunderin' fuck", ", bloody 'ell",
        ", fer chrissakes", ", by da jaysus", ", sure as shit", ", the cunts"
    ];

    function applyFrench(node) {
        if (dictFR[node.nodeValue.trim()]) {
            node.nodeValue = node.nodeValue.replace(node.nodeValue.trim(), dictFR[node.nodeValue.trim()]);
        }
    }

    function applyNewfie(node) {
        let text = node.nodeValue;
        let originalText = text;
        
        // Skip purely numeric or whitespace nodes
        if (!text.trim() || !/[a-zA-Z]/.test(text)) return;

        // Apply grammar rules
        for (let rule of newfieRules) {
            text = text.replace(rule.regex, rule.replacement);
        }

        // Slam a random exclamation onto ~25% of sentences
        if (text.includes('.') && text.length > 20) {
            text = text.replace(/\.(\s|$)/g, function(match, ws) {
                if (Math.random() < 0.25) {
                    var tag = _newfieExclamations[Math.floor(Math.random() * _newfieExclamations.length)];
                    return tag + '.' + ws;
                }
                return match;
            });
        }

        if (text !== originalText) {
            node.nodeValue = text;
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
            } else if (currentLang === 'nf') {
                applyNewfie(node);
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
        } else if (currentLang === 'nf') {
            // Newfie: apply to full body (entertainment feature)
            walkDOM(document.body);
        }

        // Update Language Selector UI Selection if exists
        const langSelect = document.getElementById('lang-selector');
        if (langSelect) {
            langSelect.value = currentLang;
        }
    });

})();
