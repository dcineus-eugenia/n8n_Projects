# Gabarit — Rapport et matrice de risques cyber

## Grilles d'évaluation

**Vraisemblance (V)**
| Niveau | Définition |
|---|---|
| 1 — Minime | Nécessite un attaquant très compétent, un accès interne et des conditions rares |
| 2 — Significative | Faisable par un attaquant motivé avec des moyens notables |
| 3 — Forte | Exploitable avec des outils publics, surface exposée |
| 4 — Maximale | Exploitation triviale ou déjà observée dans ce contexte |

**Impact (I)**
| Niveau | Définition |
|---|---|
| 1 — Mineur | Gêne limitée, pas de donnée sensible, rétablissement immédiat |
| 2 — Significatif | Dégradation de service, données internes exposées, coût modéré |
| 3 — Grave | Indisponibilité prolongée, fuite de données personnelles, notification CNIL probable |
| 4 — Critique | Compromission totale, fuite massive ou de données sensibles, arrêt d'activité, sanction réglementaire |

**Risque = V × I** : 1-3 Faible · 4-6 Moyen · 8-9 Élevé · 12-16 Critique

---

```markdown
# Analyse de risques cyber — [Système / projet]

**Mode** : Conception | Audit · **Date** : AAAA-MM-JJ · **Version** : 0.1
**Périmètre** : [composants, flux, environnements]
**Hypothèses de contexte** : [exposition, secteur, hébergement, volumétrie]

## 1. Synthèse exécutive
- **Niveau de risque global** : Critique | Élevé | Moyen | Faible
- **Risques majeurs** :
  1. [R-xx] …
  2. …
- **Décisions attendues** : [budget, arbitrage, acceptation de risque, report de mise en prod]

## 2. Actifs et classification
| Actif | Type | D | I | C | T | Données réglementées |
|---|---|---|---|---|---|---|
| Base clients | Données | 3 | 3 | 4 | 3 | Données personnelles (RGPD) |
| … | … | … | … | … | … | … |

## 3. Surface d'attaque et frontières de confiance
- **Points d'entrée exposés** : …
- **Frontières de confiance** : Internet → … → …
- **Accès à privilèges** : …
- **Tiers et dépendances** : …

## 4. Matrice de risques cyber
| ID | Actif | Menace / scénario (STRIDE, réf.) | V | I | Brut | Mesures (P = préventive, D = détective, C = corrective) | Résiduel | Réf. contrôle | Priorité | Effort |
|---|---|---|---|---|---|---|---|---|---|---|
| R-01 | … | … | 3 | 4 | 12 Critique | P : … / D : … / C : … | 3 Faible | ISO A.x.x / OWASP … | Immédiate | S |

## 5. État des contrôles par domaine
| Domaine | État | Écarts principaux (preuve) |
|---|---|---|
| Protection des données | ✅ Conforme / ⚠️ Partiel / ❌ Absent | … |
| Secrets | … | … |
| Identité et accès | … | … |
| Réseau et isolation | … | … |
| Applicatif et supply chain | … | … |
| Journalisation et détection | … | … |
| Résilience | … | … |

## 6. Plan de remédiation
| Horizon | Actions | Risques traités | Responsable |
|---|---|---|---|
| Immédiat (bloquant) | … | R-01, R-03 | … |
| 30 jours | … | … | … |
| 90 jours | … | … | … |

## 7. Conformité — obligations probables (à confirmer par DPO / juridique)
| Référentiel | Applicabilité présumée | Obligations clés | Écarts identifiés |
|---|---|---|---|
| RGPD | … | … | … |

## 8. Risques résiduels à accepter formellement
- [R-xx] … — propriétaire du risque : …

## 9. Hypothèses et questions ouvertes (3 max)
- …
```
