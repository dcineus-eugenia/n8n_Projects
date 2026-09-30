# Checklists d'attaque par type d'artefact

Réservoir de pistes, pas une liste à dérouler mécaniquement. Ne retiens dans le rapport que ce qui est étayé par l'artefact.

## Sommaire
1. Code applicatif
2. Architecture / design système
3. Spécification fonctionnelle
4. Infrastructure as Code & configuration (Terraform, Kubernetes, Docker)
5. Pipeline CI/CD
6. Plan de migration / mise en production
7. Schéma de données

---

## 1. Code applicatif
- **Entrées** : validation absente ou côté client uniquement, injection (SQL, commande, template, LDAP), désérialisation non sûre, SSRF, path traversal, upload non contrôlé.
- **AuthN/AuthZ** : contrôle d'accès objet par objet (IDOR), rôles vérifiés côté serveur, sessions/jetons (expiration, révocation, stockage), comparaison en temps constant.
- **Secrets** : clés en dur, dans les logs, dans les messages d'erreur, dans le dépôt.
- **Logique** : conditions inversées, off-by-one, arrondis monétaires (flottants), fuseaux horaires, états impossibles non gérés.
- **Concurrence** : check-then-act, double soumission, absence d'idempotence, verrous manquants ou deadlocks.
- **Erreurs** : exceptions avalées, retries infinis, absence de timeout sur appels réseau, erreurs qui fuient des détails internes.
- **Ressources** : fuites (connexions, fichiers), boucles non bornées, chargement complet en mémoire, N+1.
- **Dépendances** : versions vulnérables, bibliothèques abandonnées, licences incompatibles.

## 2. Architecture / design système
- **SPOF** : composant unique (base, broker, passerelle, DNS, clé KMS, personne clé).
- **Pannes partielles** : comportement quand une dépendance est lente plutôt qu'en panne ; circuit breaker, bulkhead, dégradation gracieuse.
- **Cohérence** : transactions distribuées, double écriture, ordre des événements, rejeu, messages en double ou perdus.
- **Scalabilité** : état en mémoire empêchant le scale horizontal, partitionnement, hot keys, limites fournisseur.
- **Sécurité (STRIDE)** : usurpation, altération, répudiation, divulgation, déni de service, élévation de privilèges ; zones de confiance et flux qui les traversent.
- **Reprise** : RPO/RTO réalistes vs affichés, sauvegardes testées, reprise multi-zone/région.
- **Couplage & réversibilité** : verrouillage fournisseur, services qui doivent être déployés ensemble.
- **Coûts** : egress inter-zones, trafic NAT, logs volumineux, services managés facturés à la requête.

## 3. Spécification fonctionnelle
- Exigences ambiguës ou non testables, termes non définis.
- Contradictions entre sections, entre exigences et contraintes (délai vs périmètre).
- Parcours d'erreur, d'annulation, de reprise non décrits.
- Rôles et droits incomplets, cas des utilisateurs désactivés ou supprimés.
- Volumétrie, rétention, archivage, suppression (droit à l'effacement) absents.
- Critères d'acceptation qui ne couvrent que le cas nominal.

## 4. Infrastructure as Code & configuration
- Ressources publiques par défaut (buckets, bases, ports 0.0.0.0/0), chiffrement désactivé.
- IAM trop large (`*`, admin), rôles partagés entre environnements.
- Secrets en clair dans les variables, le state Terraform non chiffré ou non verrouillé.
- Kubernetes : conteneurs root, pas de limites CPU/mémoire, pas de probes, pas de PodDisruptionBudget, `latest` comme tag, NetworkPolicy absentes.
- Absence de tags de coût, d'auto-scaling borné, de politique de cycle de vie du stockage.
- Dérive : ressources créées à la main, modules non versionnés.

## 5. Pipeline CI/CD
- Secrets exposés aux PR de forks, jetons à longue durée de vie, runners partagés.
- Actions/images tierces non épinglées (tag mutable au lieu de SHA).
- Absence de scan (SAST, dépendances, images, secrets), absence de signature des artefacts.
- Déploiement en production sans approbation ni rollback automatisé.
- Tests non bloquants, étapes marquées « allow failure ».

## 6. Plan de migration / mise en production
- Pas de plan de retour arrière, ou retour arrière impossible après migration de données.
- Bascule « big bang » sans période de double run ni feature flag.
- Migration de schéma non rétrocompatible avec la version précédente de l'application.
- Volumétrie de reprise sous-estimée (durée de la fenêtre), pas de répétition générale.
- Critères de go/no-go et responsables non définis, communication d'incident absente.

## 7. Schéma de données
- Contraintes d'intégrité absentes (FK, unicité, NOT NULL) reposant sur l'applicatif.
- Index manquants sur les requêtes fréquentes ou excès d'index sur tables à forte écriture.
- Types inadaptés (flottant pour montants, texte pour dates), identifiants séquentiels exposés.
- Données personnelles non identifiées, non chiffrées, sans durée de rétention.
- Suppressions en cascade dangereuses, absence de soft delete ou d'historique quand l'audit l'exige.
