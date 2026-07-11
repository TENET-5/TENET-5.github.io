# Defence procurement velocity cluster — Mermaid companion

Public-safe topology from `defence_cluster_network.json`.  
**Preferred supplier ≠ signed multi-year production contract.** Centrality is documentation density, not guilt.

```mermaid
flowchart LR
  gov_canada[Government of Canada]
  dia[Defence Investment Agency]
  dnd[National Defence]
  pspc[PSPC]
  fuhr[Sec of State Fuhr]

  glle[GLLE Griffon life extension]
  w8475[W8475-205391/001/BF]
  bell[Bell Textron Canada]
  ntacs[Next Tactical Aviation Capability Set]

  cpsp[Canadian Patrol Submarine]
  tkms[TKMS preferred]
  hanwha[Hanwha Ocean reserve]

  aothr[Arctic OTHR / NASS]
  australia[Australia Commonwealth]
  bae_au[BAE Systems Australia]
  norad[NORAD modernization frame]

  aewc[AEWC / GlobalEye track]
  saab[Saab preferred AEWC]
  l3harris[L3Harris competitor class]
  bombardier[Bombardier Global 6500]

  pspc -->|announced award FACT| w8475
  w8475 -->|contractor ~797.6M FACT| bell
  w8475 -->|implements FACT| glle
  glle -->|bridges until replacement FACT| ntacs
  dnd -->|program owner FACT| glle
  glle -.->|pause talks reported REPORTING| bell

  dia -->|advances FACT| cpsp
  cpsp -->|preferred supplier FACT| tkms
  cpsp -->|reserve supplier FACT| hanwha
  fuhr -->|announces FACT| cpsp

  dia -->|advances FACT| aothr
  aothr -->|supports FACT| norad
  aothr -->|G2G ~2.5B class FACT| australia
  aothr -->|industry partner FACT| bae_au

  dia -->|preferred path FACT| aewc
  aewc -->|preferred supplier FACT| saab
  saab -->|platform base FACT| bombardier
  aewc -.->|competition complaint class REPORTING| l3harris
```

## Dollar classes (public freezes)

| Instrument | Class |
|------------|--------|
| GLLE contract W8475 | CAD 797,556,147 |
| Arctic OTHR Australia path | CAD 2.5B class |
| CPSP | preferred TKMS; reserve Hanwha; contract target by 2027 |

## Claim levels

- Solid edges = **FACT** government instruments  
- Dashed edges = **REPORTING** (pause talks / competition class)

Source freezes: PSPC news, CanadaBuys, DCB, DIA releases. Updated with the investigation desk freezes of 2026-07-11.
