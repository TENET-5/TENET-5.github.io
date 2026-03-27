/**
 * TENET-5 Visitor Classifier
 * Detects DND / CAF / CFNIS network visitors and redirects to the
 * appropriate welcome package.
 *
 * Detection method: ip-api.com free tier — ASN + org name match.
 * DND Canada = AS5597 ("Department of National Defence")
 * Also catches government / mil proxies by org string.
 */
(function () {
  'use strict';

  // Don't re-trigger on the destination page itself
  if (window.location.pathname.indexOf('/mp-brief') !== -1) return;
  // Session-flag so it only fires once per tab
  if (sessionStorage.getItem('vc_done')) return;
  sessionStorage.setItem('vc_done', '1');

  var KNOWN_ASNS = ['AS5597', 'AS5596', 'AS29738'];   // DND Canada + fallbacks
  var ORG_KEYWORDS = [
    'national defence', 'department of national defence', 'dnd-mdn',
    'canadian forces', 'cfnis', 'military police', 'rcmp', 'csis',
    'government of canada', 'privy council', 'public safety canada',
    'canada border services', 'shared services canada'
  ];

  function orgMatch(str) {
    if (!str) return false;
    var low = str.toLowerCase();
    for (var i = 0; i < ORG_KEYWORDS.length; i++) {
      if (low.indexOf(ORG_KEYWORDS[i]) !== -1) return true;
    }
    return false;
  }

  function check(data) {
    if (!data) return;
    var hit = false;

    // ASN match
    if (data.as && KNOWN_ASNS.some(function(a){ return data.as.indexOf(a) !== -1; })) hit = true;
    // Org / ISP string match
    if (!hit && (orgMatch(data.org) || orgMatch(data.isp))) hit = true;

    if (hit) {
      sessionStorage.setItem('vc_govt', '1');
      window.location.href = '/mp-brief.html';
    }
  }

  // ip-api.com — free, no key, 45 req/min, HTTPS on paid only so use HTTP
  // GitHub Pages serves HTTPS so we use fetch with mixed-content workaround via
  // the JSON-P endpoint which works cross-origin on HTTP
  var url = 'https://ip-api.com/json/?fields=status,as,org,isp,country';

  // Use fetch if available (modern browsers)
  if (typeof fetch !== 'undefined') {
    fetch(url, { cache: 'no-store' })
      .then(function(r){ return r.json(); })
      .then(check)
      .catch(function(){}); // Silent fail — never break normal visitors
  } else {
    // Fallback: script tag JSON-P
    var s = document.createElement('script');
    window._vcCallback = function(data){ check(data); };
    s.src = 'http://ip-api.com/json/?fields=status,as,org,isp,country&callback=_vcCallback';
    document.head.appendChild(s);
  }
})();
