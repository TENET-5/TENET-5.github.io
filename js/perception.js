/* ═══════════════════════════════════════════════════════
   LIRIL Perception Component — Cognitive UI Analyzer
   TENET5 — Powered by LIRIL AI | SEED 118400
   ═══════════════════════════════════════════════════════ */
(function() {
  'use strict';
  
  if (window.LIRIL_PERCEPTION) return;

  var ANALYSIS_TARGETS = 'section, .glass-panel, .record-card, .tldr';
  var DENSITY_THRESHOLD = 85; // Heuristic text/data density limit per block

  // Analyzes text payload and measures data density + cognitive friction
  function calculateAttentionDensity(node) {
    var text = node.innerText || node.textContent || '';
    if (!text.trim()) return 0;
    
    // Tokens
    var words = text.split(/\s+/).length;
    
    // Data identifiers: Dates, Currency, Percentages, specialized capitalization
    var dataHits = (text.match(/(\$|£|€|\d{2,}%|\d{4}-\d{2}|\b[A-Z]{3,}\b)/g) || []).length;
    var numericalDensity = (text.match(/\d+/g) || []).length;
    
    // Structure: Very long sentences cause fatigue
    var fatiguePenalty = 0;
    var sentences = text.split(/[.!?]+/).filter(Boolean);
    sentences.forEach(function(s) {
      if (s.split(/\s+/).length > 28) fatiguePenalty += 10;
    });

    var baseLoad = Math.min((words / 15), 40); 
    var densityScore = baseLoad + (dataHits * 4) + (numericalDensity * 2) + fatiguePenalty;
    
    // Gestalt Modifier — Proximity/Clustering
    // If the node lacks proper padding relative to its siblings, weight goes up
    var style = window.getComputedStyle(node);
    var padding = parseFloat(style.paddingTop) + parseFloat(style.paddingBottom);
    if (padding < 24 && words > 50) densityScore *= 1.25;

    return Math.round(densityScore);
  }

  // Automates adding visual hierarchy to heavily data-dense text components
  function restructureContainer(container) {
    if (!container) return;
    
    var blocks = container.querySelectorAll(ANALYSIS_TARGETS);
    blocks.forEach(function(block) {
      if (block.dataset.perceptionAnalyzed) return;
      block.dataset.perceptionAnalyzed = 'true';

      var density = calculateAttentionDensity(block);
      block.dataset.cognitiveLoad = density;

      // Classify sections based on cognitive density thresholds
      if (density > DENSITY_THRESHOLD) {
        block.classList.add('perception-dense');
        // Inject automated layout spacing or a 'Cognitive Relief' break
        if (!block.classList.contains('cognitive-spaced')) {
          block.classList.add('cognitive-spaced');
        }
      }
      
      // Auto-extract emphasis: find high-value monetary anchors ($1.58B, etc)
      // and wrap them dynamically in focal spans if they aren't already grouped
      var html = block.innerHTML;
      if (!/<span[^>]*class="cognitive-focus"/i.test(html)) {
        var modified = html.replace(/(\$[\d,]+(?:\.\d+)?\s*[BMK]?illion?)/gi, 
          '<span class="cognitive-focus" data-liril-focus="true">$1</span>');
        if (modified !== html) {
          block.innerHTML = modified;
        }
      }

      // Add interactivity: hover on high-density data focuses it and dims rest
      block.addEventListener('mouseenter', function() {
        blocks.forEach(function(b) {
          if (b !== block) b.classList.add('cognitive-dim');
        });
      });
      block.addEventListener('mouseleave', function() {
        blocks.forEach(function(b) {
          b.classList.remove('cognitive-dim');
        });
      });
    });
  }

  // Run initial pass on DOM content loaded or manual trigger
  function analyzeUI() {
    console.log('[LIRIL-PERCEPTION] Initiating Cognitive DOM Analysis...');
    restructureContainer(document.body);
  }

  window.LIRIL_PERCEPTION = {
    calculateAttentionDensity: calculateAttentionDensity,
    analyzeUI: analyzeUI,
    restructureContainer: restructureContainer
  };

  // Autostart inside iframes or root docs seamlessly
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', analyzeUI);
  } else {
    analyzeUI();
  }

})();
