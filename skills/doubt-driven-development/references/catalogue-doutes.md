# Catalogue des doutes et des techniques de validation

## 1. Dimensions d'échec (pour varier les 3 hypothèses)

Choisis 3 dimensions **différentes** parmi les plus pertinentes pour la décision.

| Dimension | Questions déclencheuses |
|---|---|
| **Fonctionnelle** | Le choix couvre-t-il vraiment tous les cas métier, y compris les cas d'erreur et les exceptions ? Quel besoin probable ne pourra-t-il pas satisfaire ? |
| **Performance / échelle** | À quel volume, quelle concurrence ou quelle taille de données casse-t-il ? Où est le goulot ? |
| **Fiabilité** | Que se passe-t-il quand il tombe, ralentit ou perd des données ? Est-il un SPOF ? |
| **Exploitation** | L'équipe sait-elle le déployer, le superviser, le mettre à jour, le restaurer à 3 h du matin ? |
| **Coût** | Comment évolue le coût avec l'usage ? Coûts cachés (licences, egress, temps humain, formation) ? |
| **Sécurité / conformité** | Nouvelle surface d'attaque ? Compatible avec les contraintes de données (RGPD, souveraineté) ? |
| **Humaine / organisationnelle** | Compétences disponibles, dépendance à une personne, adhésion des équipes, recrutement ? |
| **Évolution / réversibilité** | Verrouillage fournisseur ? Coût de sortie ? Maturité et pérennité de la techno ? |
| **Intégration** | Compatibilité avec le SI existant, les formats, les versions, les autres équipes ? |

## 2. Biais à surveiller dans ta propre proposition
- **Premier choix venu** : la solution citée en premier est-elle retenue par défaut ?
- **Techno à la mode** : choisie pour sa popularité plutôt que pour le besoin ?
- **Surdimensionnement** : architecture pour 100× la charge réelle (microservices, Kafka, Kubernetes pour 10 utilisateurs) ?
- **Familiarité** : choisie parce que connue, alors qu'une autre convient mieux ?
- **Coûts irrécupérables** : défendue parce que du travail a déjà été fait dessus ?
- **Optimisme de planification** : délais et effort sous-estimés pour l'option préférée ?

## 3. Techniques de validation

| Technique | Réfute quel type d'hypothèse | Coût typique |
|---|---|---|
| **Revue d'hypothèses avec l'équipe / l'expert** | Toutes, surtout organisationnelles | Très faible |
| **Calcul d'ordre de grandeur** (back-of-the-envelope) | Échelle, coût | Très faible |
| **Simulation de coût** (calculateur cloud, projection 12-36 mois) | Coût | Faible |
| **Spike / POC limité dans le temps** | Faisabilité, intégration, compétences | Moyen |
| **Test de contrat** (Pact, schémas OpenAPI) | Intégration | Faible à moyen |
| **Test d'intégration** avec dépendances réelles (Testcontainers) | Fonctionnelle, intégration | Moyen |
| **Test de charge / benchmark** (k6, Gatling, JMeter) sur données réalistes | Performance, échelle | Moyen |
| **Test aux limites / property-based testing** | Cas limites fonctionnels | Moyen |
| **Injection de pannes / chaos engineering** (latence, coupure, perte de nœud) | Fiabilité | Moyen à élevé |
| **Test de restauration** (sauvegarde → restauration chronométrée) | Fiabilité, RPO/RTO | Moyen |
| **Déploiement progressif** (feature flag, canary, shadow traffic) | Toutes, en conditions réelles | Moyen |
| **Revue de sécurité / threat modeling** | Sécurité | Faible à moyen |

## 4. Règles d'une bonne validation
- **Seuil fixé avant l'expérience**, jamais après.
- **Données et charge réalistes** : un benchmark sur 1 000 lignes ne dit rien d'une table de 500 M.
- **Le moins cher d'abord, sur le risque le plus élevé.**
- **Avant le point de non-retour** : valider après la migration n'est plus une validation.
- **Critère d'abandon écrit** : sinon on trouve toujours une raison de continuer.
