# Gabarit — Analyse de doute (compatible ADR)

Répète le bloc « Décision » pour chaque décision structurante. Pour les décisions réversibles, utilise uniquement le tableau « Décisions réversibles » en fin de bloc.

---

```markdown
## Analyse de doute

### Décision D1 — [Titre court, ex. « Base de stockage des événements »]
**Type** : Structurante · **Choix retenu** : [solution]
**Contexte déterminant** : [les 2-3 faits qui orientent le choix : volume, équipe, délai, contraintes]

#### Hypothèses d'échec
| # | Hypothèse (spécifique, falsifiable) | Dimension | Proba | Signal d'alerte | Mitigation |
|---|---|---|---|---|---|
| H1 | … | Performance | Moyenne | … | … |
| H2 | … | Coût | Élevée | … | … |
| H3 | … | Exploitation | Faible | … | … |

#### Alternatives
| Option | Meilleur argument en sa faveur | Pourquoi écartée ici | Condition de bascule |
|---|---|---|---|
| Option la plus simple : … | … | … | … |
| Alternative A : … | … | … | … |
| Alternative B : … | … | … | … |

**Critères de comparaison** : [ex. complexité, coût total à 3 ans, compétences équipe, réversibilité]

#### Validation
| Hypothèse | Vérification | Critère de succès | Critère d'abandon | Coût / moment |
|---|---|---|---|---|
| H1 | Benchmark à 3× la charge | P99 < 100 ms | P99 > 300 ms | 2 j, avant choix définitif |
| H2 | Simulation de coût sur 12 mois | < X €/mois | > Y €/mois | 0,5 j |
| H3 | Exercice de bascule | Bascule < 5 min sans perte | Perte de données | 1 j, avant mise en prod |

**Confiance** : Élevée | Moyenne | Faible — [ce qui la ferait monter]
**À réexaminer si** : [événement déclencheur, ex. volume × 5, changement d'équipe, nouvelle contrainte réglementaire]

---

### Décisions réversibles
| Décision | Justification en une ligne | Principal risque |
|---|---|---|
| … | … | … |
```
