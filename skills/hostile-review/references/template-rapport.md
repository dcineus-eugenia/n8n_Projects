# Gabarit — Rapport de revue adversariale

Utilise ce gabarit tel quel. Omets une section de sévérité si elle ne contient aucun constat (n'écris pas « aucun » sous chaque titre vide, regroupe-les en une ligne).

---

```markdown
# Hostile Review — [Nom de l'artefact]

**Périmètre revu** : [fichiers, composants, version/commit]
**Type** : code / architecture / spec / IaC / CI-CD / plan de migration
**Hypothèses de contexte** : [ex. service exposé sur Internet, ~1 000 req/s, données personnelles]

## Verdict
**[Bloquant | Mise en production sous conditions | Acceptable]** — [justification en une phrase]

| Critique | Élevé | Moyen | Faible |
|---|---|---|---|
| n | n | n | n |

### Top 3 des actions
1. [C-01] …
2. [E-01] …
3. …

---

## CRITIQUE

### [C-01] Titre court · Confiance : Confirmé | Probable | À vérifier
- **Localisation** : `fichier:ligne` / composant / section de la spec
- **Problème** : …
- **Preuve** : [extrait, valeur de config, élément du schéma]
- **Scénario de défaillance** :
  1. …
  2. …
  3. …
- **Impact** : [données, disponibilité, argent, conformité, réputation]
- **Correction recommandée** : … [extrait de code/config si utile]
- **Effort** : S | M | L

## ÉLEVÉ

### [E-01] …

## MOYEN

### [M-01] …

## FAIBLE
- [F-01] … — correction en une ligne
- [F-02] …

---

## Angles non couverts
- [ce qui n'a pas pu être examiné et pourquoi : code absent, dépendance opaque, contexte manquant]

## Questions ouvertes
- [question dont la réponse pourrait changer une sévérité, avec l'ID concerné]
```
