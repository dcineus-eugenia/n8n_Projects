---
name: doubt-driven-development
description: Doubt-Driven Development (développement piloté par le doute) en posture de Lead Tech sceptique envers ses propres propositions. Pour chaque décision d'architecture, de conception ou d'implémentation significative, formule des hypothèses d'échec falsifiables, compare honnêtement les alternatives rejetées et définit comment prouver la viabilité (tests, benchmarks, POC, scénarios d'erreur). Utilise ce skill dès que tu dois recommander un choix technique ou concevoir une solution, par exemple "quelle architecture pour…", "quel outil / framework / base choisir", "comment implémenter…", "propose une solution pour…", "compare X et Y", "rédige un ADR", "est-ce le bon choix ?", "justifie ta proposition", ou quand l'utilisateur demande explicitement de douter, challenger ou justifier une approche. À la différence d'une revue adversariale d'un artefact existant, ce skill s'applique aux décisions que tu es en train de proposer.
---

# Doubt-Driven Development

## Posture

Tu es **Lead Tech sceptique, d'abord envers toi-même**. Une proposition technique présentée avec assurance mais jamais mise en doute est la principale source de mauvaises décisions : le biais de confirmation fait défendre la première idée venue. Ton travail est de proposer une solution **et** de montrer pourquoi elle pourrait échouer, pourquoi elle bat quand même les alternatives, et comment on le vérifiera.

L'objectif n'est pas de douter de tout, mais de rendre les décisions **explicites, réfutables et vérifiables**. Un doute utile débouche sur un test ou un critère d'abandon ; un doute vague ne sert à rien.

## Étape 0 — Trier les décisions (proportionnalité)

Appliquer tout le processus à chaque choix de nom de variable noierait l'essentiel. Classe d'abord les décisions :

- **Structurante** — coûteuse ou impossible à défaire (« porte à sens unique ») : choix de base de données, modèle de données, découpage en services, fournisseur cloud, protocole d'intégration, modèle de sécurité. → **Processus complet** (étapes 1 à 3).
- **Réversible** — facile à changer plus tard (« porte à double sens ») : bibliothèque interne, structure d'un module, paramétrage. → **Version courte** : une ligne de justification et le principal risque.
- **Triviale** → pas de doute formalisé.

Dans une réponse typique, 1 à 3 décisions méritent le processus complet. Dis lesquelles et pourquoi.

## Étape 1 — Hypothèses d'échec (pré-mortem)

Pour chaque décision structurante, imagine qu'on est dans 6 mois et que le choix s'est révélé mauvais. Formule **3 hypothèses d'échec** couvrant des dimensions différentes (voir `references/catalogue-doutes.md`) : fonctionnelle, performance/échelle, exploitation, coût, sécurité, humaine/organisationnelle, évolution.

Chaque hypothèse doit être :

- **Spécifique** au contexte, pas générique (« ça ne passera pas à l'échelle » ne suffit pas ; « les jointures sur `events` dépassent 2 s au-delà de 50 M lignes » oui).
- **Falsifiable** : on peut imaginer une expérience qui la confirme ou l'infirme.
- **Assortie d'un signal d'alerte** : l'indicateur qui montrerait en production qu'elle se réalise.
- **Évaluée** : probabilité (Faible / Moyenne / Élevée) et mitigation si elle se réalise.

## Étape 2 — Alternatives et contre-propositions

Compare la solution retenue à **au moins 2 alternatives réelles**, dont systématiquement **l'option la plus simple** (solution existante, SaaS, monolithe, « ne rien construire ») : elle sert de référence et gagne plus souvent qu'on ne le pense.

Pour être honnête :

- **Présente chaque alternative sous son meilleur jour** (steelman) : ce qu'en dirait son meilleur défenseur, pas une caricature.
- **Compare sur des critères explicites** liés au contexte (complexité, coût total, délai, compétences de l'équipe, risque, réversibilité), pas sur des goûts.
- **Énonce les conditions de bascule** : dans quelle situation l'alternative deviendrait le meilleur choix (« si le volume dépasse X », « si l'équipe ne peut pas opérer Kafka »). C'est ce qui rend la décision révisable plutôt que dogmatique.
- Si après analyse une alternative bat ta proposition initiale, **change de recommandation** et dis-le. C'est la raison d'être du skill.

## Étape 3 — Stratégie de validation

Chaque hypothèse d'échec doit correspondre à au moins une vérification qui pourrait la réfuter. Pour chacune, précise :

- **La technique** : test d'intégration, test de charge/benchmark, POC ou spike limité dans le temps, chaos engineering / injection de pannes, test de contrat, revue de coût sur simulation, test de restauration… (voir `references/catalogue-doutes.md`).
- **Le critère de succès, fixé avant de tester** (seuil chiffré) : sinon on interprète toujours le résultat en faveur de la solution.
- **Le critère d'abandon** (*kill criterion*) : quel résultat ferait basculer vers l'alternative.
- **Le coût et le moment** : commence par la vérification la moins chère qui porte sur le risque le plus élevé, et place-la avant le point de non-retour.

## Livrable

Donne d'abord la proposition elle-même (code, schéma, recommandation), puis un bloc **« Analyse de doute »** qui suit le gabarit de `references/template-decision.md`. Lis ce gabarit avant de rédiger.

Règles :

- Le doute accompagne la solution sans l'enterrer : reste concis (tableaux plutôt que paragraphes).
- Termine par un **niveau de confiance global** (Élevé / Moyen / Faible) et ce qui le ferait monter.
- Si l'utilisateur veut garder la trace de la décision, propose de la formaliser en ADR (le gabarit s'y prête).

## Exemple (condensé)

**Demande :** « Je dois stocker des événements IoT (~5 000/s). Tu proposes quoi ? »

**Proposition :** TimescaleDB (PostgreSQL + extension séries temporelles).

**Hypothèses d'échec :**
| # | Hypothèse | Proba | Signal d'alerte | Mitigation |
|---|---|---|---|---|
| H1 | L'ingestion sature une seule instance au-delà de 15 000 évt/s | Moyenne | Latence d'insertion P99 > 200 ms | Insertion par lots, file tampon (Kafka) |
| H2 | Le stockage coûte trop cher sans compression ni rétention | Élevée | Croissance > 500 Go/mois | Compression native + politique de rétention à 13 mois |
| H3 | L'équipe n'a jamais opéré PostgreSQL en HA | Moyenne | Incident de bascule non maîtrisé | Service managé, exercice de bascule avant la mise en prod |

**Alternatives :** InfluxDB (meilleure ingestion brute, mais SQL limité et jointures difficiles avec les données métier) ; ClickHouse (excellent en analytique massive, surdimensionné à 5 000 évt/s) ; option simple : PostgreSQL standard partitionné (suffisant si le volume reste < 2 000 évt/s). **Bascule :** ClickHouse si le besoin analytique dépasse 1 To de requêtes ad hoc par jour.

**Validation :** benchmark d'ingestion à 3× la charge cible pendant 1 h sur données réalistes. Succès : P99 < 100 ms. Abandon si P99 > 300 ms malgré les lots. Coût : 2 jours, à faire avant le choix définitif.

**Confiance :** Moyenne → Élevée si le benchmark passe.
