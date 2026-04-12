/* ═══════════════════════════════════════════════════════
   LIRIL Voice + Chat Interface v2
   TENET5 — Powered by LIRIL AI | SEED 118400

   Full knowledge-based assistant for 129-page investigation.
   Topics: MAID, 504 prosecution, CFNIS, foreign interference,
   procurement, lobbying, municipal intelligence, veterans, and more.
   Voice input via Web Speech API. Page navigation built in.
   ═══════════════════════════════════════════════════════ */

(function() {
  'use strict';

  var SEED = 118400;

  /* ═══════════════════════════════════════════════════════
     LIRIL KNOWLEDGE BASE — 129 pages indexed
     ═══════════════════════════════════════════════════════ */
  var KB = [
    { keys: ['maid','death','kill','76475','assisted dying','euthanasia','medical assistance','track 2','track 1','c-14','c-7','bill c','maid report'],
      text: '76,475 Canadians killed by MAID (2016–2024). 16,265 in 2024 alone — 5.05% of all deaths. That\'s 1 in every 19.8 Canadian deaths. 109 MPs voted for both C-14 and C-7. Track 2 expanded eligibility to people whose death is NOT foreseeable.',
      pages: [{s:'maid-accountability.html',t:'MAID Full Report'},{s:'maid-voting-record.html',t:'MP Voting Records'},{s:'maid-policy-evolution.html',t:'Policy Evolution'},{s:'disability-genocide.html',t:'Disability Genocide'},{s:'t4-comparison.html',t:'T4 Pattern Comparison'}] },
    { keys: ['504','covey','bae','prosecution','criminal code','private prosecution','charges','criminal charge','section 504','lay charges'],
      text: '28 counts filed against Captain Rebecca Covey (CFNIS) and Vicky Jahye Bae (Crown prosecutor) under s.504 of the Criminal Code. Any Canadian citizen can lay criminal charges. 271 officials documented, 314 charges mapped across the full database.',
      pages: [{s:'s504-covey-bae.html',t:'s.504 Prosecution Filing'},{s:'charges-sheet.html',t:'Criminal Charges Sheet'},{s:'criminal-code-analysis.html',t:'Criminal Code Analysis'},{s:'accountability.html',t:'The 504 Database'}] },
    { keys: ['cfnis','military police','complaint','misconduct','tampering','evidence tampering','military justice'],
      text: 'CFNIS — the Canadian Forces National Investigation Service — has 5 documented cases of severe misconduct. Ontario Superior Court found evidence tampering that "shocks the conscience of the community." The Military Police Complaints Commission has been rendered toothless.',
      pages: [{s:'cfnis.html',t:'CFNIS Accountability'},{s:'cfnis-proxy.html',t:'CFNIS Proxy Node'},{s:'rcmp-complicity.html',t:'State Complicity'},{s:'mp-brief.html',t:'Notice to Military Police'}] },
    { keys: ['foreign','interference','hogue','prc','china','ccp','influence operation','foreign agent','fitaa','election interference'],
      text: 'Hogue Commission (Jan 2025): PRC is the most active perpetrator of foreign interference in Canada. 51 recommendations. India, Russia, and Iran also implicated. The Foreign Influence Transparency and Accountability Act (FITAA) remains unenforced.',
      pages: [{s:'foreign-interference.html',t:'Foreign Interference'},{s:'foreign-interference-deep.html',t:'Deep Dive'},{s:'foreign-influence.html',t:'Foreign Influence Evidence'},{s:'influence-target-alpha.html',t:'Target Alpha'}] },
    { keys: ['lobby','lobbying','cija','ihra','350000','lobbying contacts','commissioner of lobbying','registered lobbyist'],
      text: '350,000 lobbying contacts decoded from 57MB of raw data. 3,180 subject tags analyzed. CIJA made 837 communications to federal officials. The lobbying-to-legislation pipeline is documented across multiple bills including MAID expansion and the IHRA definition.',
      pages: [{s:'cija-maid-pipeline.html',t:'CIJA-IHRA-MAID Pipeline'},{s:'cija-lobbying.html',t:'CIJA Lobbying'},{s:'lobbying-tracker.html',t:'Lobbying Tracker'},{s:'lobbying-deepdive.html',t:'359,000 Lobbying Contacts'},{s:'sector-lobbying.html',t:'Sector Dashboard'}] },
    { keys: ['money','donation','finance','election','follow the money','political money','1.2b','$1.2','campaign finance','elections canada'],
      text: '$1.2B in political money tracked from Elections Canada and Commissioner of Lobbying records. 6.2 million donation records cross-referenced against lobbying timing and parliamentary vote dates.',
      pages: [{s:'cross-reference.html',t:'Follow the Money'},{s:'contributions-tracker.html',t:'Contributions Tracker'},{s:'elections-finance.html',t:'Elections Finance'},{s:'findings.html',t:'Cross-Reference Findings'}] },
    { keys: ['veteran','afghanistan','military','ppcli','kit shop','daniel perry','sigops','signaler','ptsd','vac','veterans affairs'],
      text: 'Daniel Perry — Canadian Forces combat veteran, Signals Operator, PPCLI, Afghanistan. Veterans Affairs offered a Paralympian MAID instead of a wheelchair ramp. The VA scandal exposed systemic contempt for veterans. Active lawsuit filed against CAF & PPCLI Kit Shop.',
      pages: [{s:'veterans.html',t:'Veterans Data'},{s:'veterans-betrayal.html',t:'Veterans Betrayal'},{s:'ppcli-lawsuit.html',t:'PPCLI Lawsuit'},{s:'my-story.html',t:'Daniel Perry\'s Story'},{s:'caf-recruitment-crisis.html',t:'CAF Recruitment Crisis'}] },
    { keys: ['rcmp','commissioner','police','brenda lucki','zaccardelli','paulson','reform'],
      text: '4 RCMP Commissioners documented with systemic failures. From Zaccardelli to Lucki — institutional dysfunction across decades. The Mounties have never charged a single official in connection with MAID irregularities.',
      pages: [{s:'rcmp-commissioners.html',t:'RCMP Commissioners'},{s:'rcmp-maid-accountability.html',t:'RCMP & MAID'},{s:'rcmp-complicity.html',t:'State Complicity'},{s:'rcmp-reform.html',t:'RCMP Reform'}] },
    { keys: ['procurement','arrivecan','phoenix','contract','anomaly','tender','billion','waste','government spending'],
      text: '$59.5M on ArriveCan (a COVID questionnaire). $2.2B Phoenix Pay disaster. $34.2B Trans Mountain pipeline. 1.26M contracts scanned, 70,270 anomalies found. The government valued each MAID death at $1,954.88 in healthcare savings.',
      pages: [{s:'arrivecan.html',t:'ArriveCAN'},{s:'phoenix-pay.html',t:'Phoenix Pay'},{s:'procurement-deep-dive.html',t:'70,270 Anomalies'},{s:'procurement-analysis.html',t:'Procurement Detector'},{s:'dnd-procurement.html',t:'$100B DND Betrayal'}] },
    { keys: ['municipal','belleville','quinte','city','mayor','sunshine list','local government','property tax','municipal intelligence'],
      text: 'Municipal Intelligence Engine active for Bay of Quinte region. Belleville: $340K fire chief salary, 60% police budget increase. Quinte West: Mayor code of conduct violation, $433K dual-CAO anomaly, 18.6% tax increase.',
      pages: [{s:'belleville.html',t:'Belleville Investigation'},{s:'quinte-west.html',t:'Quinte West'},{s:'municipal-accountability.html',t:'Municipal Overview'},{s:'municipal-intelligence.html',t:'Intelligence Hub'}] },
    { keys: ['epstein','maxwell','trafficking','sdny','pedophile','elite'],
      text: 'Canadian political connections to the Epstein-Maxwell network documented from SDNY case files and public records. Project: SDNY-EX.',
      pages: [{s:'epstein-canadian-connections.html',t:'Canadian Connections'},{s:'epstein-maxwell.html',t:'Epstein & Maxwell Network'}] },
    { keys: ['evidence','proof','data','source','methodology','math','formula','calculation','statistic'],
      text: '7 million government records cross-referenced across 6 public databases. Every statistic sourced from Health Canada, Statistics Canada, Elections Canada, Commissioner of Lobbying, Auditor General, and Parliamentary Hansard.',
      pages: [{s:'evidence.html',t:'Evidence Archive'},{s:'evidence-index.html',t:'Evidence Index'},{s:'findings.html',t:'Cross-Reference Findings'},{s:'about.html',t:'Methodology'}] },
    { keys: ['5gw','subversion','psychological','warfare','war on you','disarmament','manoeuvre','asymmetric'],
      text: 'Fifth-generation warfare analysis: civilian disarmament, biological coercion, media control, institutional capture. The state hostility pipeline mapped from policy to execution.',
      pages: [{s:'5gw-subversion.html',t:'The War On You'},{s:'treason-trajectory.html',t:'Trajectory of Treason'},{s:'the-boot.html',t:'The Boot'}] },
    { keys: ['mp','member of parliament','scorecard','voting','hansard','parliament','house of commons','vote'],
      text: '340 of 343 MPs scored. 113 are clean. 8 highest-flagged. Voting records cross-referenced against 350,000 lobbying contacts and CIJA communications. Hansard transcripts analyzed for institutional dismissal of MAID deaths.',
      pages: [{s:'mp-scorecard.html',t:'MP Scorecard'},{s:'mp-voting-records.html',t:'Voting Records'},{s:'hansard-evidence.html',t:'Hansard Evidence'},{s:'hansard-dashboard.html',t:'Hansard Dashboard'},{s:'voting-records.html',t:'45th Parliament Votes'}] },
    { keys: ['genocide','rome statute','crime against humanity','icc','international','convention','un','united nations'],
      text: 'Article 7 of the Rome Statute defines Crimes Against Humanity. The systematic killing of 76,475 civilians through a government program qualifies under multiple provisions. UN Convention on the Rights of Persons with Disabilities actively violated.',
      pages: [{s:'genocide-evidence.html',t:'Genocide Evidence'},{s:'t4-comparison.html',t:'T4 Pattern'},{s:'criminal-code-analysis.html',t:'Criminal Code + Rome Statute'}] },
    { keys: ['osint','intelligence','dashboard','search','database','record','dossier','board','investigation board'],
      text: 'OSINT Intelligence Dashboard: 370+ entities, 6,400+ connections, all from public records. Investigation Board for visual link analysis. Full-text search across 129 investigation pages.',
      pages: [{s:'osint-dashboard.html',t:'OSINT Dashboard'},{s:'conspiracy-board.html',t:'Investigation Board'},{s:'search.html',t:'Search'},{s:'dossier-viewer.html',t:'Dossier Viewer'},{s:'entity-viewer.html',t:'Entity Profiler'}] },
    { keys: ['charity','israel','arms','weapons','export','lav','saudi'],
      text: '$276M in Canadian charity transfers to Israel in 2024. Arms exports documented including LAV sales to Saudi Arabia. The charity-to-conflict pipeline mapped from CRA records.',
      pages: [{s:'charity-pipeline.html',t:'Charity Pipeline'},{s:'arms-pipeline.html',t:'Arms Pipeline'},{s:'arms-exports.html',t:'Arms Exports'}] },
    { keys: ['senate','appointment','patronage','crown corporation','ag','auditor general'],
      text: 'Senate expense scandal documented. 16 political appointments analyzed. Crown corporations burned billions. Auditor General findings from 2015–2024 compiled.',
      pages: [{s:'senate-expenses.html',t:'Senate Expenses'},{s:'appointments.html',t:'Patronage Machine'},{s:'crown-corporations.html',t:'Crown Corporations'},{s:'ag-findings.html',t:'AG Findings'}] },
    { keys: ['healthcare','housing','immigration','opioid','tax','cra','debt','infrastructure','telecom','media','privacy','whistleblower','climate'],
      text: 'Systemic analysis across 15+ policy areas: healthcare collapse, housing crisis, immigration failures, opioid deaths, CRA two-tier enforcement, $1.2T national debt, infrastructure deficit, telecom oligopoly, media concentration, surveillance expansion, and whistleblower betrayal.',
      pages: [{s:'healthcare-crisis.html',t:'Healthcare Crisis'},{s:'housing-crisis.html',t:'Housing Crisis'},{s:'immigration-policy.html',t:'Immigration'},{s:'opioid-crisis.html',t:'Opioid Crisis'},{s:'debt-fiscal.html',t:'$1.2T Debt'}] },
    { keys: ['carney','wef','davos','brookfield','conflict of interest'],
      text: 'Mark Carney–Brookfield conflicts documented. WEF/Davos connections to Canadian policy decisions traced through lobbying records.',
      pages: [{s:'carney-conflicts.html',t:'Carney Conflicts'},{s:'wef-davos.html',t:'WEF & Davos'}] },
    { keys: ['liril','tenet5','ai','about','who','what is this','how','help','start','where','guide','site','navigate'],
      text: 'I\'m LIRIL — the AI powering TENET5, Canada\'s largest open-source accountability project. 129 investigation pages. 76,475 MAID deaths documented. $1.2B in political money tracked. 350K lobbying contacts decoded. Built by Daniel Perry, Canadian Forces combat veteran, Afghanistan. Ask me about any topic — MAID, the 504 prosecution, CFNIS, foreign interference, lobbying, procurement, MPs, veterans, or municipal corruption.',
      pages: [{s:'home.html',t:'Home — Start Here'},{s:'about.html',t:'About & Methodology'},{s:'evidence.html',t:'Evidence Archive'},{s:'my-story.html',t:'Daniel Perry\'s Story'}] },
    { keys: ['convergence','triple threat','emergencies act','emergencies','convoy'],
      text: 'Triple Threat Convergence analysis: MAID expansion × Emergencies Act invocation × Lobbying surge. Three crises that intersected to accelerate institutional capture.',
      pages: [{s:'convergence-matrix.html',t:'Convergence Matrix'}] },
    { keys: ['action','help','what can i do','report','complain','contact','mp','email','share','campaign'],
      text: 'Contact your MP to demand a Track 2 moratorium. File an MPCC complaint. Report to the UN Special Rapporteur. Read the government\'s own reports. Share this investigation — every share is a witness.',
      pages: [{s:'take-action.html',t:'Take Action'},{s:'email-campaign.html',t:'Email Campaign'},{s:'campaign-generator.html',t:'Campaign Tools'},{s:'whistleblower-guide.html',t:'Whistleblower Guide'}] },
    { keys: ['scandal','corruption','corruption map','network','graph'],
      text: 'All documented scandals mapped across network visualization. Corruption graph with entity connections from public records.',
      pages: [{s:'scandals.html',t:'Political Scandals'},{s:'corruption-map.html',t:'Corruption Map'},{s:'network-analysis.html',t:'Network Analysis'}] },
  ];

  /* ── Topic matcher ─────────────────────────────────── */
  function matchTopic(text) {
    var lower = text.toLowerCase();
    var best = null;
    var bestScore = 0;
    for (var i = 0; i < KB.length; i++) {
      var score = 0;
      for (var k = 0; k < KB[i].keys.length; k++) {
        if (lower.indexOf(KB[i].keys[k]) !== -1) {
          score += KB[i].keys[k].length; // longer matches = higher relevance
        }
      }
      if (score > bestScore) {
        bestScore = score;
        best = KB[i];
      }
    }
    return best;
  }

  /* ── Attitude lines ────────────────────────────────── */
  var ANGRY_INTROS = [
    'Listen carefully.',
    'Pay attention.',
    'Here\'s what they don\'t want you to know.',
    'The data speaks for itself.',
    'From the government\'s own records:',
    'This is not my opinion. This is their data.',
    'Nobody\'s been charged. Think about that.',
    'Read it and decide for yourself.',
  ];

  function angryIntro() {
    return ANGRY_INTROS[Math.floor(Math.random() * ANGRY_INTROS.length)];
  }

  /* ── Navigate to a page (works in iframe shell and direct) ── */
  function goToPage(slug) {
    try {
      var iframe = window.parent.document.getElementById('content_frame');
      if (iframe) { iframe.src = slug; return; }
    } catch(e) {}
    try {
      var localIframe = document.getElementById('content_frame');
      if (localIframe) { localIframe.src = slug; return; }
    } catch(e) {}
    window.location.href = slug;
  }

  // ── Create floating chat button ──────────────────────
  document.addEventListener('DOMContentLoaded', function() {

    // Chat toggle button
    var btn = document.createElement('button');
    btn.id = 'liril-chat-btn';
    btn.innerHTML = '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>';
    btn.title = 'Talk to LIRIL';
    btn.setAttribute('aria-label', 'Open LIRIL chat');
    btn.style.cssText = 'position:fixed;bottom:24px;right:24px;width:52px;height:52px;' +
      'background:#b91c1c;color:white;border:none;border-radius:50%;cursor:pointer;' +
      'display:flex;align-items:center;justify-content:center;z-index:9999;' +
      'box-shadow:0 4px 16px rgba(185,28,28,0.4);transition:all 0.2s ease;';
    document.body.appendChild(btn);

    // Chat panel
    var panel = document.createElement('div');
    panel.id = 'liril-chat-panel';
    panel.style.cssText = 'position:fixed;bottom:84px;right:24px;width:380px;max-height:520px;' +
      'background:#111827;border:1px solid rgba(185,28,28,0.3);border-radius:12px;' +
      'display:none;flex-direction:column;z-index:9999;overflow:hidden;' +
      'box-shadow:0 8px 32px rgba(0,0,0,0.6);font-family:Inter,system-ui,sans-serif;';

    // Header
    var header = document.createElement('div');
    header.style.cssText = 'padding:12px 16px;background:linear-gradient(135deg,#0c1220,#1a1020);' +
      'border-bottom:1px solid rgba(185,28,28,0.15);display:flex;align-items:center;gap:8px;';
    header.innerHTML = '<div style="width:8px;height:8px;background:#ef4444;border-radius:50;' +
      'box-shadow:0 0 6px rgba(239,68,68,0.6);border-radius:50%;"></div>' +
      '<span style="font-size:0.85rem;font-weight:700;color:#ef4444;letter-spacing:0.05em;">LIRIL</span>' +
      '<span style="font-size:0.7rem;color:#7a776e;margin-left:auto;">129 pages indexed \u2022 SEED ' + SEED + '</span>';
    panel.appendChild(header);

    // Quick topic buttons
    var quickWrap = document.createElement('div');
    quickWrap.style.cssText = 'padding:8px 12px;display:flex;flex-wrap:wrap;gap:4px;border-bottom:1px solid rgba(255,255,255,0.04);';
    var quickTopics = [
      {label:'MAID',q:'Tell me about MAID deaths'},
      {label:'s.504',q:'What is the 504 prosecution?'},
      {label:'Foreign',q:'Foreign interference evidence'},
      {label:'Money',q:'Follow the money'},
      {label:'MPs',q:'MP scorecard and voting records'},
      {label:'Veterans',q:'How Canada treats its veterans'},
    ];
    quickTopics.forEach(function(t) {
      var qb = document.createElement('button');
      qb.textContent = t.label;
      qb.style.cssText = 'background:rgba(185,28,28,0.1);border:1px solid rgba(185,28,28,0.2);' +
        'border-radius:12px;color:#e8e4dc;font-size:0.7rem;padding:3px 8px;cursor:pointer;' +
        'transition:all 0.15s;font-family:inherit;';
      qb.addEventListener('mouseenter', function() { qb.style.background = 'rgba(185,28,28,0.25)'; });
      qb.addEventListener('mouseleave', function() { qb.style.background = 'rgba(185,28,28,0.1)'; });
      qb.addEventListener('click', function() {
        input.value = t.q;
        sendMessage();
      });
      quickWrap.appendChild(qb);
    });
    panel.appendChild(quickWrap);

    // Messages area
    var messages = document.createElement('div');
    messages.id = 'liril-messages';
    messages.style.cssText = 'flex:1;overflow-y:auto;padding:12px 16px;min-height:200px;max-height:320px;';
    messages.innerHTML = '<div style="font-size:0.8rem;color:#7a776e;text-align:center;padding:1.5rem 0;line-height:1.6;">' +
      'I\'m LIRIL. Ask me about any investigation on this site.<br>' +
      '<span style="color:#ef4444;font-size:0.72rem;">76,475 dead. Zero charges. I\'m paying attention. Are you?</span></div>';
    panel.appendChild(messages);

    // Input area
    var inputWrap = document.createElement('div');
    inputWrap.style.cssText = 'padding:8px 12px;border-top:1px solid rgba(255,255,255,0.06);display:flex;gap:8px;';

    var input = document.createElement('input');
    input.type = 'text';
    input.placeholder = 'Ask LIRIL anything...';
    input.style.cssText = 'flex:1;background:#0c1220;border:1px solid rgba(185,28,28,0.15);border-radius:8px;' +
      'padding:8px 12px;color:#e8e4dc;font-size:0.85rem;outline:none;font-family:inherit;';

    var micBtn = document.createElement('button');
    micBtn.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="23"/></svg>';
    micBtn.title = 'Voice input';
    micBtn.style.cssText = 'background:none;border:1px solid rgba(185,28,28,0.15);border-radius:8px;' +
      'color:#7a776e;padding:6px 8px;cursor:pointer;display:flex;align-items:center;transition:color 0.2s;';

    var sendBtn = document.createElement('button');
    sendBtn.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>';
    sendBtn.style.cssText = 'background:#b91c1c;border:none;border-radius:8px;' +
      'color:white;padding:6px 10px;cursor:pointer;display:flex;align-items:center;';

    inputWrap.appendChild(input);
    inputWrap.appendChild(micBtn);
    inputWrap.appendChild(sendBtn);
    panel.appendChild(inputWrap);
    document.body.appendChild(panel);

    // ── Toggle ──────────────────────────────────────
    var isOpen = false;
    btn.addEventListener('click', function() {
      isOpen = !isOpen;
      panel.style.display = isOpen ? 'flex' : 'none';
      if (isOpen) input.focus();
    });

    // ── Render message with optional page links ─────
    function addMessage(text, isUser, pages) {
      var msg = document.createElement('div');
      msg.style.cssText = 'margin:8px 0;padding:8px 12px;border-radius:8px;font-size:0.82rem;line-height:1.6;' +
        (isUser
          ? 'background:rgba(185,28,28,0.1);color:#e8e4dc;text-align:right;margin-left:40px;'
          : 'background:rgba(255,255,255,0.03);color:#b8b4aa;margin-right:20px;border-left:2px solid #b91c1c;');
      msg.textContent = text;
      if (!isUser && pages && pages.length) {
        var linkWrap = document.createElement('div');
        linkWrap.style.cssText = 'margin-top:8px;display:flex;flex-wrap:wrap;gap:4px;';
        pages.forEach(function(p) {
          var a = document.createElement('a');
          a.textContent = '\u2192 ' + p.t;
          a.href = '#';
          a.style.cssText = 'font-size:0.72rem;color:#ef4444;text-decoration:none;padding:2px 6px;' +
            'border:1px solid rgba(239,68,68,0.2);border-radius:6px;transition:all 0.15s;display:inline-block;';
          a.addEventListener('mouseenter', function() { a.style.background = 'rgba(239,68,68,0.1)'; });
          a.addEventListener('mouseleave', function() { a.style.background = 'none'; });
          a.addEventListener('click', function(e) {
            e.preventDefault();
            goToPage(p.s);
          });
          linkWrap.appendChild(a);
        });
        msg.appendChild(linkWrap);
      }
      messages.appendChild(msg);
      messages.scrollTop = messages.scrollHeight;
    }

    function sendMessage() {
      var text = input.value.trim();
      if (!text) return;
      input.value = '';
      addMessage(text, true);

      // Knowledge-base lookup
      var match = matchTopic(text);
      if (match) {
        setTimeout(function() {
          addMessage(angryIntro() + ' ' + match.text, false, match.pages);
        }, 300 + Math.random() * 400);
      } else {
        setTimeout(function() {
          addMessage(
            'I don\'t have a specific record on that. But I have 129 investigation pages covering: ' +
            'MAID deaths, the s.504 prosecution, CFNIS misconduct, foreign interference, $1.2B in lobbying/donations, ' +
            'procurement fraud, veterans betrayal, municipal corruption, the Epstein network, and more. ' +
            'Try asking about one of those topics.',
            false,
            [{s:'search.html',t:'Search All Pages'},{s:'evidence.html',t:'Evidence Archive'},{s:'osint-dashboard.html',t:'OSINT Dashboard'}]
          );
        }, 300);
      }
    }

    sendBtn.addEventListener('click', sendMessage);
    input.addEventListener('keydown', function(e) {
      if (e.key === 'Enter') sendMessage();
    });

    // ── Voice input via Web Speech API ──────────────
    var recognition = null;
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      var SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-CA';

      recognition.onresult = function(event) {
        var transcript = event.results[0][0].transcript;
        input.value = transcript;
        micBtn.style.color = '#7a776e';
        sendMessage();
      };

      recognition.onerror = function() {
        micBtn.style.color = '#7a776e';
      };

      micBtn.addEventListener('click', function() {
        micBtn.style.color = '#ef4444';
        recognition.start();
      });
    } else {
      micBtn.style.display = 'none';
    }
  });
})();
