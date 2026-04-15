/**
 * Mirror Engine — CAP Per-Recipient Report Generator
 *
 * Core omission algorithm: generates personalized intelligence briefs
 * where each recipient sees all data EXCEPT their own entries.
 * Clean MPs (score 0) see everything. Media/courts see everything.
 *
 * Strategy: Prisoner's Dilemma at scale — 340 MPs each see 339 others' records.
 */

(function(global) {
  'use strict';

  // ── Data cache ──
  var DATA = {};
  var loaded = false;

  var DATA_FILES = {
    mps: 'data/mp_full_analysis.json',
    dossier: 'data/mp_criminal_ethics_dossier.json',
    criminalCode: 'data/criminal_code_analysis.json',
    cija: 'data/cija_deep_analysis.json',
    lobbying: 'data/lobbying_analysis.json',
    crossref: 'data/cross_reference_findings.json',
    rivalries: 'data/parliamentary_rivalries.json',
    strategy: 'data/campaign_strategy.json',
    directory: 'data/mp_email_directory.json',
    committee: 'data/committee_targets.json'
  };

  // ── Load all data ──
  async function loadAll() {
    if (loaded) return DATA;
    var promises = [];
    var keys = Object.keys(DATA_FILES);
    keys.forEach(function(key) {
      promises.push(
        fetch(DATA_FILES[key])
          .then(function(r) { return r.json(); })
          .then(function(d) { DATA[key] = d; })
          .catch(function() { DATA[key] = null; })
      );
    });
    await Promise.all(promises);
    loaded = true;
    return DATA;
  }

  // ── Name matching utilities ──
  function normName(n) { return (n || '').toLowerCase().trim().replace(/[^a-z ]/g, ''); }
  function nameMatch(a, b) {
    var na = normName(a), nb = normName(b);
    if (na === nb) return true;
    // Last name match
    var partsA = na.split(' '), partsB = nb.split(' ');
    if (partsA.length > 1 && partsB.length > 1) {
      return partsA[partsA.length - 1] === partsB[partsB.length - 1] && partsA[0].charAt(0) === partsB[0].charAt(0);
    }
    return false;
  }

  function esc(s) { var d = document.createElement('div'); d.textContent = s || ''; return d.innerHTML; }
  function fmt(n) { return Number(n || 0).toLocaleString('en-CA'); }

  // ── CORE: Filter data for a specific recipient ──
  function filterForRecipient(targetName, recipientType) {
    var isMP = recipientType === 'mp';
    var isFlagged = false;
    var targetParty = '';
    var targetRiding = '';
    var targetScore = 0;

    // Find target in MP directory
    if (isMP && DATA.directory && DATA.directory.directory) {
      var entry = DATA.directory.directory.find(function(d) { return nameMatch(d.name, targetName); });
      if (entry) {
        targetParty = entry.party || '';
        targetRiding = entry.riding || '';
        targetScore = entry.score || 0;
        isFlagged = targetScore > 0;
      }
    }

    // Clean MPs and non-MP recipients see EVERYTHING
    if (!isMP || targetScore === 0) {
      return {
        omitted: false,
        targetName: targetName,
        targetParty: targetParty,
        targetRiding: targetRiding,
        targetScore: targetScore,
        recipientType: recipientType,
        mps: DATA.mps,
        dossier: DATA.dossier,
        cija: DATA.cija,
        lobbying: DATA.lobbying,
        crossref: DATA.crossref,
        rivalries: DATA.rivalries,
        strategy: DATA.strategy
      };
    }

    // ── OMISSION: Remove target from all datasets ──
    var filtered = {
      omitted: true,
      targetName: targetName,
      targetParty: targetParty,
      targetRiding: targetRiding,
      targetScore: targetScore,
      recipientType: recipientType
    };

    // 1. Filter MP tiers — remove target from their tier
    if (DATA.mps) {
      filtered.mps = {};
      ['tier1_highest', 'tier2_moderate', 'tier3_low', 'tier4_clean'].forEach(function(tier) {
        filtered.mps[tier] = (DATA.mps[tier] || []).filter(function(mp) {
          return !nameMatch(mp.name, targetName);
        });
      });
      filtered.mps.summary = DATA.mps.summary;
      filtered.mps.total_mps = DATA.mps.total_mps;
    }

    // 2. Filter dossier — remove target's entries
    if (DATA.dossier) {
      filtered.dossier = {};
      ['criminal_convictions', 'ethics_commissioner_violations', 'foreign_interference_flagged',
       'caucus_expulsions_resignations', 'other_misconduct'].forEach(function(cat) {
        filtered.dossier[cat] = (DATA.dossier[cat] || []).filter(function(entry) {
          return !nameMatch(entry.name, targetName);
        });
      });
      filtered.dossier.key_patterns = DATA.dossier.key_patterns;
    }

    // 3. Filter CIJA — remove target's meeting count
    if (DATA.cija) {
      filtered.cija = JSON.parse(JSON.stringify(DATA.cija));
      if (filtered.cija.top_contacted_mps) {
        filtered.cija.top_contacted_mps = filtered.cija.top_contacted_mps.filter(function(mp) {
          return !nameMatch(mp.name || mp.official, targetName);
        });
      }
    }

    // 4. Filter lobbying — remove target from top officials
    if (DATA.lobbying) {
      filtered.lobbying = JSON.parse(JSON.stringify(DATA.lobbying));
      if (filtered.lobbying.top_lobbied_officials) {
        filtered.lobbying.top_lobbied_officials = filtered.lobbying.top_lobbied_officials.filter(function(o) {
          return !nameMatch(o.name, targetName);
        });
      }
    }

    // 5. Filter cross-references — remove target from evidence
    if (DATA.crossref) {
      filtered.crossref = JSON.parse(JSON.stringify(DATA.crossref));
      if (Array.isArray(filtered.crossref)) {
        filtered.crossref = filtered.crossref.map(function(finding) {
          if (finding.evidence) {
            finding.evidence = finding.evidence.filter(function(e) {
              return !(e.fact || '').toLowerCase().includes(normName(targetName));
            });
          }
          if (finding.entities) {
            finding.entities = finding.entities.filter(function(ent) {
              return !nameMatch(ent.name, targetName);
            });
          }
          return finding;
        });
      }
    }

    // 6. Filter rivalries — keep entries where target BENEFITS, remove where target is exposed
    if (DATA.rivalries) {
      filtered.rivalries = JSON.parse(JSON.stringify(DATA.rivalries));
      if (filtered.rivalries.active_feuds) {
        filtered.rivalries.active_feuds = filtered.rivalries.active_feuds.filter(function(feud) {
          // Remove feuds where the target is the one being exposed
          var targetInvolved = nameMatch(feud.actor_a, targetName) || nameMatch(feud.actor_b, targetName);
          if (!targetInvolved) return true; // Keep feuds between other people
          // Keep if target has leverage (they benefit), remove if they're disadvantaged
          if (nameMatch(feud.actor_a, targetName) && feud.leverage_a) return true;
          if (nameMatch(feud.actor_b, targetName) && feud.leverage_b) return true;
          return false;
        });
      }
    }

    // 7. Strategy — always included (it's policy recommendations, not incriminating)
    filtered.strategy = DATA.strategy;

    return filtered;
  }

  // ── Generate report HTML ──
  function generateReport(targetName, recipientType) {
    var data = filterForRecipient(targetName, recipientType);
    var isClean = !data.omitted;
    var party = data.targetParty;
    var oppositeParty = party === 'Conservative' ? 'Liberal' : party === 'Liberal' ? 'Conservative' : '';

    var h = '';

    // ── Subject line ──
    var subject = generateSubject(data);

    // ── Header ──
    h += '<div style="text-align:center;padding:20px 0 16px;border-bottom:2px solid #c41e3a;margin-bottom:20px;">';
    h += '<div style="font-size:0.65rem;letter-spacing:4px;color:#c41e3a;text-transform:uppercase;margin-bottom:8px;">Canadian Government Accountability Report</div>';
    h += '<div style="font-family:Georgia,serif;font-size:1.6rem;font-weight:900;color:#e8e8ec;line-height:1.3;">Public Record Intelligence Brief</div>';
    h += '<div style="font-size:0.8rem;color:#6b7280;margin-top:6px;">Prepared for: ' + esc(targetName) + '</div>';
    h += '<div style="font-size:0.7rem;color:#9ca3af;margin-top:4px;">From: Daniel Perry — Canadian Forces Veteran, Afghanistan</div>';
    h += '</div>';

    // ── Section 1: Executive Summary ──
    h += sectionHeader('1', 'Executive Summary');
    h += '<p>This brief summarizes findings from cross-referencing six Canadian government public datasets: the Commissioner of Lobbying registry (' + fmt(DATA.lobbying ? DATA.lobbying.total_communications : 350612) + ' communications), Elections Canada donation records (6.2 million entries), OpenParliament voting data, ISED corporate registry, government procurement contracts, and parliamentary Hansard records.</p>';
    if (data.targetRiding) {
      h += '<p><strong>Your riding (' + esc(data.targetRiding) + ')</strong> is represented in this analysis.</p>';
    }
    if (isClean && recipientType === 'mp') {
      h += '<div style="background:#ecfdf5;border:1px solid #34d399;border-radius:6px;padding:12px 16px;margin:12px 0;font-size:0.85rem;color:#065f46;">';
      h += '<strong>Your record is clean.</strong> Based on our analysis of lobbying contacts, CIJA communications, ethics findings, and criminal records, you have no flags in any of our datasets. We are reaching out to you specifically because Canada needs parliamentarians who can champion structural reform without personal conflicts of interest.';
      h += '</div>';
    }
    h += '</div>';

    // ── Section 2: Cross-Party Accountability ──
    h += sectionHeader('2', 'Cross-Party Accountability Record');
    h += '<p style="font-size:0.78rem;color:#6b7280;margin-bottom:12px;">Criminal convictions, ethics violations, and misconduct findings from public records. All entries are sourced from court records, Ethics Commissioner reports, and parliamentary records.</p>';

    var dossier = data.dossier || DATA.dossier;
    if (dossier) {
      if (dossier.criminal_convictions && dossier.criminal_convictions.length > 0) {
        h += '<h4 style="color:#c41e3a;font-size:0.82rem;margin:12px 0 8px;">Criminal Convictions</h4>';
        dossier.criminal_convictions.forEach(function(c) {
          h += dossierCard(c, 'conviction');
        });
      }
      if (dossier.ethics_commissioner_violations && dossier.ethics_commissioner_violations.length > 0) {
        h += '<h4 style="color:#f59e0b;font-size:0.82rem;margin:12px 0 8px;">Ethics Commissioner Findings</h4>';
        dossier.ethics_commissioner_violations.forEach(function(c) {
          h += ethicsCard(c);
        });
      }
      if (dossier.foreign_interference_flagged && dossier.foreign_interference_flagged.length > 0) {
        h += '<h4 style="color:#8b5cf6;font-size:0.82rem;margin:12px 0 8px;">Foreign Interference Flags</h4>';
        dossier.foreign_interference_flagged.forEach(function(c) {
          h += dossierCard(c, 'foreign');
        });
      }
    }
    h += '</div>';

    // ── Section 2B: Criminal Code Findings ──
    var ccData = DATA.criminalCode;
    if (ccData && ccData.findings) {
      h += sectionHeader('2B', 'Criminal Code Analysis — Applicable Sections');
      h += '<p style="font-size:0.78rem;color:#6b7280;margin-bottom:10px;">Findings mapped to specific Criminal Code of Canada sections. ' + fmt(ccData.statistics.total_findings) + ' total findings across ' + Object.keys(ccData.statistics.by_section).length + ' legal sections. All findings are actionable via s.504 (private prosecution).</p>';
      var ccFindings = ccData.findings.filter(function(f) {
        // Omit findings about this recipient if they're a flagged MP
        if (!data.omitted) return true;
        return !nameMatch(f.entity, targetName);
      });
      var severityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
      ccFindings.sort(function(a, b) { return (severityOrder[a.severity] || 9) - (severityOrder[b.severity] || 9); });
      ccFindings.slice(0, 15).forEach(function(f) {
        var borderColor = f.severity === 'critical' ? '#ef4444' : f.severity === 'high' ? '#f59e0b' : '#eab308';
        h += '<div style="background:rgba(10,14,22,0.6);border:1px solid rgba(255,255,255,0.08);border-left:3px solid ' + borderColor + ';border-radius:4px;padding:10px 14px;margin:6px 0;font-size:0.78rem;">';
        h += '<div style="display:flex;justify-content:space-between;align-items:center;"><span style="font-weight:700;color:#e8e8ec;">' + esc(f.entity) + '</span><span style="font-size:0.65rem;padding:2px 8px;border-radius:10px;background:' + borderColor + '20;color:' + borderColor + ';font-weight:600;text-transform:uppercase;">' + esc(f.severity) + '</span></div>';
        h += '<div style="color:#6b7280;margin-top:4px;"><strong>CC ' + esc(f.section) + '</strong> — ' + esc(f.section_title) + ' (max: ' + esc(f.max_penalty) + ')</div>';
        h += '<div style="color:#3d4355;margin-top:4px;">' + esc(f.description.substring(0, 200)) + (f.description.length > 200 ? '...' : '') + '</div>';
        if (f.action) h += '<div style="color:#c41e3a;margin-top:4px;font-weight:600;font-size:0.72rem;">' + esc(f.action) + '</div>';
        h += '</div>';
      });
      if (ccFindings.length > 15) {
        h += '<div style="text-align:center;font-size:0.72rem;color:#9ca3af;margin-top:8px;">+ ' + (ccFindings.length - 15) + ' additional findings. See <a href="https://tenet5.github.io/criminal-code-analysis.html" style="color:#c41e3a;">full Criminal Code analysis</a>.</div>';
      }
      h += '</div>';
    }

    // ── Section 3: Lobbying Patterns ──
    h += sectionHeader('3', 'Lobbying Contact Patterns');
    var lobbyData = data.lobbying || DATA.lobbying;
    if (lobbyData && lobbyData.top_lobbied_officials) {
      var topMPs = lobbyData.top_lobbied_officials.filter(function(o) {
        return o.title === 'Member of Parliament' || o.title === 'Member of Parliment';
      }).slice(0, 15);
      h += '<p style="font-size:0.78rem;color:#6b7280;margin-bottom:10px;">Top 15 most-contacted Members of Parliament by registered lobbyists (Commissioner of Lobbying open data):</p>';
      h += '<table style="width:100%;border-collapse:collapse;font-size:0.78rem;">';
      h += '<thead><tr style="background:rgba(10,14,22,0.55);"><th style="text-align:left;padding:6px 10px;border-bottom:1px solid rgba(255,255,255,0.07);">MP</th><th style="text-align:right;padding:6px 10px;border-bottom:1px solid rgba(255,255,255,0.07);">Meetings</th></tr></thead>';
      h += '<tbody>';
      topMPs.forEach(function(mp) {
        h += '<tr><td style="padding:5px 10px;border-bottom:1px solid #f0f0ee;">' + esc(mp.name) + '</td>';
        h += '<td style="text-align:right;padding:5px 10px;border-bottom:1px solid #f0f0ee;font-weight:700;color:#c41e3a;">' + fmt(mp.meetings) + '</td></tr>';
      });
      h += '</tbody></table>';
    }

    // CIJA-specific
    var cijaData = data.cija || DATA.cija;
    if (cijaData) {
      h += '<h4 style="color:#8b5cf6;font-size:0.82rem;margin:16px 0 8px;">CIJA Lobbying Contacts (Registration 959914-111-95)</h4>';
      h += '<p style="font-size:0.78rem;color:#6b7280;">' + fmt(cijaData.total_communications || 2156) + ' registered communications to ' + fmt(cijaData.unique_contacts || 993) + ' unique officials since 2008. Post-October 7, 2023 surge: ' + fmt(cijaData.post_oct7_total || 390) + ' contacts (' + (cijaData.oct7_surge_pct || 239) + '% increase).</p>';
    }
    h += '</div>';

    // ── Section 4: Policy Recommendations ──
    h += sectionHeader('4', 'Structural Reform Recommendations');
    var strat = data.strategy || DATA.strategy;
    if (strat && strat.policies) {
      strat.policies.forEach(function(p) {
        h += '<div style="background:rgba(10,14,22,0.55);border:1px solid rgba(255,255,255,0.08);border-left:3px solid #c41e3a;border-radius:4px;padding:10px 14px;margin:8px 0;">';
        h += '<div style="font-weight:700;font-size:0.82rem;color:#e8e8ec;">' + esc(p.name || p.title || '') + '</div>';
        h += '<div style="font-size:0.75rem;color:#6b7280;margin-top:4px;">' + esc(p.description || p.summary || '') + '</div>';
        h += '</div>';
      });
    } else {
      // Inline policy recommendations if strategy not loaded
      var policies = [
        { name: 'P1: Public Officer Accountability Act', desc: 'Strengthen Criminal Code s.122 with mandatory minimums for breach of trust by public officials.' },
        { name: 'P2: Foreign Lobbying Transparency Act', desc: 'Require disclosure of all foreign-connected funding sources and trip sponsorships by lobbying organizations.' },
        { name: 'P3: Revolving Door Prohibition', desc: '10-year cooling period before former ministers can register as lobbyists to their former departments.' },
        { name: 'P4: PM Corporate Divestiture Act', desc: 'Require sitting PMs to fully divest (not blind trust) all holdings over $1M in entities that lobby government.' },
        { name: 'P5: Military Oversight Independence Act', desc: 'Remove CFNIS from military chain of command. Give MPCC binding investigative power.' }
      ];
      policies.forEach(function(p) {
        h += '<div style="background:rgba(10,14,22,0.55);border:1px solid rgba(255,255,255,0.08);border-left:3px solid #c41e3a;border-radius:4px;padding:10px 14px;margin:8px 0;">';
        h += '<div style="font-weight:700;font-size:0.82rem;color:#e8e8ec;">' + esc(p.name) + '</div>';
        h += '<div style="font-size:0.75rem;color:#6b7280;margin-top:4px;">' + esc(p.desc) + '</div>';
        h += '</div>';
      });
    }

    if (isClean && recipientType === 'mp') {
      h += '<div style="background:#eff6ff;border:1px solid #60a5fa;border-radius:6px;padding:12px 16px;margin:12px 0;font-size:0.82rem;color:#1e40af;">';
      h += '<strong>Action requested:</strong> As a clean MP with no conflicts in our datasets, we ask you to consider championing one of these five reforms. Each is designed to be non-partisan and constitutionally sound. We can provide full legislative drafting support and evidence packages for committee testimony.';
      h += '</div>';
    }
    h += '</div>';

    // ── Section 5: Evidence Links ──
    h += sectionHeader('5', 'Public Evidence & Source Data');
    h += '<ul style="font-size:0.78rem;line-height:2;color:#3d4355;">';
    h += '<li><a href="https://tenet5.github.io/findings.html" style="color:#c41e3a;">Cross-Reference Findings</a> — 26+ findings from 7M+ government records</li>';
    h += '<li><a href="https://tenet5.github.io/cross-reference.html" style="color:#c41e3a;">Follow the Money</a> — Lobbying, donations, votes, procurement cross-reference</li>';
    h += '<li><a href="https://tenet5.github.io/evidence.html" style="color:#c41e3a;">Evidence Archive</a> — Primary source documents</li>';
    h += '<li><a href="https://tenet5.github.io/accountability.html" style="color:#c41e3a;">The 504 Database</a> — 504+ sourced accountability records</li>';
    h += '<li><a href="https://tenet5.github.io/foreign-influence.html" style="color:#c41e3a;">Foreign Influence Investigation</a> — CIJA lobbying pipeline analysis</li>';
    h += '<li><a href="https://lobbycanada.gc.ca/en/open-data/" style="color:#c41e3a;">Commissioner of Lobbying Open Data</a> — Government source (verify all claims)</li>';
    h += '</ul>';
    h += '</div>';

    // ── Section 6: Legal Framework ──
    h += sectionHeader('6', 'Applicable Legal Framework');
    h += '<div style="font-size:0.78rem;line-height:1.8;color:#3d4355;">';
    h += '<p><strong>Criminal Code s.122 (Breach of Trust):</strong> Every official who, in connection with the duties of their office, commits fraud or a breach of trust is guilty of an indictable offence and liable to imprisonment for a term not exceeding 5 years.</p>';
    h += '<p><strong>Criminal Code s.504 (Private Prosecution):</strong> Any person who, on reasonable grounds, believes that a person has committed an indictable offence may lay an information in writing and under oath before a justice.</p>';
    h += '<p><strong>Lobbying Act (R.S.C., 1985, c. 44):</strong> Designated public office holders must be reported. The Commissioner investigates violations including unregistered lobbying and improper communication.</p>';
    h += '<p><strong>Conflict of Interest Act (S.C. 2006, c. 9):</strong> Public office holders must not further their private interests or those of their relatives or friends using their position.</p>';
    h += '<p><strong>Foreign Influence Transparency and Accountability Act (C-70/FITAA):</strong> Requires registration of arrangements with foreign principals. Unproclaimed as of this date.</p>';
    h += '</div>';
    h += '</div>';

    // ── Footer ──
    h += '<div style="text-align:center;padding:20px 0;border-top:2px solid rgba(255,255,255,0.1);margin-top:20px;font-size:0.72rem;color:#9ca3af;">';
    h += '<p>Every number in this report is sourced from Canadian government public records.</p>';
    h += '<p>Prepared by Daniel Perry — Canadian Forces combat veteran, former Signals Operator, Afghanistan</p>';
    h += '<p style="margin-top:8px;"><a href="https://tenet5.github.io/" style="color:#c41e3a;">tenet5.github.io</a></p>';
    h += '</div>';

    return { subject: subject, html: h, plaintext: htmlToPlain(h), targetName: targetName, party: party, score: data.targetScore, omitted: data.omitted };
  }

  // ── Subject line generation ──
  function generateSubject(data) {
    var name = data.targetName;
    var party = data.targetParty;
    var type = data.recipientType;

    if (type === 'media') return 'Investigation Brief: Cross-Referenced Canadian Government Accountability Data — 7M+ Records';
    if (type === 'court') return 'Evidence Submission: Public Record Analysis — Criminal Code s.122 / s.504 Applicable Findings';
    if (type === 'institution') return 'Policy Brief: Structural Reform Analysis — 5 Interlocking Accountability Measures';
    if (type === 'thinktank') return 'Research Data: Cross-Referenced Government Lobbying, Donation, and Voting Analysis';

    // MP-specific
    if (data.targetScore === 0) return 'Constituent Brief: Clean Record — Request for Structural Reform Leadership';
    if (party === 'Conservative') return 'Opposition Intelligence: Liberal Government Ethics Record — 504+ Documented Entries';
    if (party === 'Liberal') return 'Parliamentary Brief: Cross-Party Accountability Gaps in Government Oversight';
    if (party === 'NDP') return 'Evidence Brief: Corporate Capture of Both Major Parties — Cross-Referenced Data';
    if (party === 'Bloc') return 'Quebec Interest Brief: Federal Lobbying Concentration and Provincial Impact Analysis';
    return 'Parliamentary Brief: Canadian Government Accountability — Public Record Analysis';
  }

  // ── Helper: Section header ──
  function sectionHeader(num, title) {
    return '<div style="margin-top:20px;margin-bottom:12px;"><div style="display:flex;align-items:center;gap:10px;padding-bottom:8px;border-bottom:1px solid rgba(255,255,255,0.07);">' +
      '<span style="display:inline-flex;align-items:center;justify-content:center;width:24px;height:24px;border-radius:50%;background:#c41e3a;color:#fff;font-size:0.7rem;font-weight:700;">' + num + '</span>' +
      '<span style="font-family:Georgia,serif;font-size:1.05rem;font-weight:700;color:#e8e8ec;">' + esc(title) + '</span></div>';
  }

  // ── Helper: Dossier card ──
  function dossierCard(entry, type) {
    var borderColor = type === 'conviction' ? '#ef4444' : type === 'foreign' ? '#8b5cf6' : '#f59e0b';
    var h = '<div style="background:rgba(10,14,22,0.6);border:1px solid rgba(255,255,255,0.08);border-left:3px solid ' + borderColor + ';border-radius:4px;padding:10px 14px;margin:6px 0;font-size:0.78rem;">';
    h += '<div style="font-weight:700;color:#e8e8ec;">' + esc(entry.name) + ' <span style="color:#9ca3af;font-weight:400;">(' + esc(entry.party) + ')</span></div>';
    h += '<div style="color:#6b7280;margin-top:4px;">' + esc(entry.offence || entry.allegations || entry.issue || '') + '</div>';
    if (entry.sentence) h += '<div style="color:#ef4444;margin-top:2px;font-weight:600;">' + esc(entry.sentence) + '</div>';
    h += '</div>';
    return h;
  }

  function ethicsCard(entry) {
    var h = '<div style="background:rgba(10,14,22,0.6);border:1px solid rgba(255,255,255,0.08);border-left:3px solid #f59e0b;border-radius:4px;padding:10px 14px;margin:6px 0;font-size:0.78rem;">';
    h += '<div style="font-weight:700;color:#e8e8ec;">' + esc(entry.name) + ' <span style="color:#9ca3af;font-weight:400;">(' + esc(entry.party || entry.role || '') + ')</span></div>';
    if (entry.violations && entry.violations.length > 0) {
      entry.violations.forEach(function(v) {
        h += '<div style="color:#6b7280;margin-top:4px;">' + esc(v.case || '') + ' (' + (v.year || '') + '): ' + esc(v.finding || '') + '</div>';
      });
    }
    h += '</div>';
    return h;
  }

  // ── HTML to plaintext ──
  function htmlToPlain(html) {
    var tmp = document.createElement('div');
    tmp.innerHTML = html;
    return tmp.textContent || tmp.innerText || '';
  }

  // ── Batch generate all MP reports ──
  async function generateAllMPReports() {
    await loadAll();
    var reports = [];
    if (DATA.directory && DATA.directory.directory) {
      DATA.directory.directory.forEach(function(mp) {
        reports.push(generateReport(mp.name, 'mp'));
      });
    }
    return reports;
  }

  // ── Get all MPs from directory ──
  function getAllMPs() {
    if (!DATA.directory) return [];
    return DATA.directory.directory || [];
  }

  // ── Get tier info ──
  function getTierForMP(name) {
    if (!DATA.mps) return { tier: 'unknown', score: 0 };
    var tiers = ['tier1_highest', 'tier2_moderate', 'tier3_low', 'tier4_clean'];
    for (var i = 0; i < tiers.length; i++) {
      var found = (DATA.mps[tiers[i]] || []).find(function(mp) { return nameMatch(mp.name, name); });
      if (found) return { tier: tiers[i], score: found.score, flags: found.flags };
    }
    return { tier: 'tier4_clean', score: 0, flags: [] };
  }

  // ── Export ──
  global.MirrorEngine = {
    loadAll: loadAll,
    generateReport: generateReport,
    generateAllMPReports: generateAllMPReports,
    filterForRecipient: filterForRecipient,
    getAllMPs: getAllMPs,
    getTierForMP: getTierForMP
  };

})(window);
