# Référentiel de contrôles

Checklists par domaine. Ne retiens dans le livrable que les points pertinents pour le périmètre et étayés (preuve en mode audit, exigence justifiée en mode conception).

## Sommaire
1. Protection des données
2. Secrets
3. Identité et accès
4. Réseau et isolation
5. Sécurité applicative et chaîne d'approvisionnement
6. Journalisation et détection
7. Résilience
8. Conformité réglementaire

---

## 1. Protection des données
**Socle non négociable** : chiffrement en transit partout, y compris en interne pour les données C3-C4 ; chiffrement au repos des bases, volumes, sauvegardes et buckets.
- TLS 1.2 minimum (1.3 recommandé), suites faibles désactivées, HSTS, certificats gérés et renouvelés automatiquement.
- mTLS ou maillage de services pour les flux internes sensibles.
- Clés dans un KMS/HSM ; rotation planifiée ; séparation entre administrateurs des clés et administrateurs des données ; BYOK/HYOK pour les données les plus sensibles ou soumises à souveraineté.
- Chiffrement applicatif (champ par champ) pour les données très sensibles (numéros de carte, santé, identifiants nationaux).
- Minimisation : ne collecter que le nécessaire ; pseudonymiser ou anonymiser les environnements hors production (pas de copie brute de la prod en recette).
- Durées de rétention définies et purge automatisée ; procédure de droit à l'effacement.

## 2. Secrets
**Socle non négociable** : aucun secret en clair dans le code, le dépôt, les images, les fichiers de config versionnés, les variables CI visibles ou les logs.
- Coffre-fort centralisé (HashiCorp Vault, AWS Secrets Manager, Azure Key Vault, GCP Secret Manager).
- Identités de workload (IAM roles, Workload Identity, IRSA, OIDC en CI) plutôt que clés statiques.
- Secrets dynamiques ou à courte durée de vie ; rotation automatisée des secrets restants.
- Détection de secrets en pre-commit et en CI (gitleaks, trufflehog) ; procédure de révocation en cas de fuite.
- Secrets Kubernetes chiffrés (KMS provider, External Secrets, Sealed Secrets), jamais en ConfigMap.

## 3. Identité et accès
**Socle non négociable** : MFA sur tous les accès à privilèges et les accès distants ; pas de comptes partagés ; comptes root/admin cloud verrouillés.
- SSO centralisé, désactivation automatique des comptes au départ (provisioning SCIM).
- Moindre privilège : rôles par fonction, pas de `*` dans les politiques IAM, permissions revues trimestriellement.
- Séparation stricte des environnements (comptes/projets distincts pour prod et hors-prod).
- Accès à privilèges juste-à-temps, bastion ou accès sans clé persistante, sessions tracées.
- Contrôle d'autorisation côté serveur à chaque requête, y compris au niveau objet (anti-IDOR).

## 4. Réseau et isolation
- Segmentation par niveau de sensibilité ; bases de données jamais exposées sur Internet.
- Zero-trust : authentification et autorisation de chaque appel, identité de l'appelant vérifiée, pas de confiance fondée sur l'adresse IP.
- Security groups / NetworkPolicy en « deny by default ».
- Filtrage des flux sortants (egress) pour limiter l'exfiltration et les rappels vers un serveur de commande.
- WAF et protection anti-DDoS devant les services exposés ; limitation de débit (rate limiting) par client.
- Interfaces d'administration non exposées publiquement.

## 5. Sécurité applicative et chaîne d'approvisionnement
- Validation et encodage des entrées/sorties ; requêtes paramétrées ; protection CSRF ; en-têtes de sécurité (CSP, X-Content-Type-Options…).
- Gestion des sessions et jetons : expiration, révocation, stockage sûr, algorithmes de signature imposés.
- Outils en CI : SAST, SCA (dépendances vulnérables), DAST, scan d'images et d'IaC ; seuils bloquants sur les vulnérabilités critiques.
- SBOM généré à chaque build ; artefacts signés (Sigstore/cosign) ; objectif SLSA niveau 2 ou plus.
- Dépendances et actions CI épinglées par empreinte ; images de base minimales, non root, mises à jour régulièrement.
- IA générative : protection contre l'injection de prompt, filtrage des sorties, pas de données sensibles dans les prompts envoyés à des tiers non contractualisés, contrôle des outils accessibles à l'agent.

## 6. Journalisation et détection
- Événements à journaliser : authentifications (succès/échecs), changements de droits, accès aux données sensibles, actions d'administration, modifications de configuration, erreurs de sécurité.
- Contenu : horodatage synchronisé, identité, source, action, ressource, résultat.
- Pas de données sensibles ni de secrets dans les logs (masquage).
- Centralisation (SIEM), stockage protégé contre l'altération (WORM, compte séparé), rétention alignée sur les obligations.
- Alertes sur événements critiques avec procédure de traitement ; tests réguliers des détections.
- Logs cloud activés (CloudTrail, Activity Logs, Audit Logs) sur tous les comptes.

## 7. Résilience
- Sauvegardes 3-2-1 : 3 copies, 2 supports, 1 hors site ; au moins une copie immuable ou hors ligne (anti-ransomware), dans un compte isolé.
- Sauvegardes chiffrées ; accès aux sauvegardes séparé des accès de production.
- **Restaurations testées** régulièrement et chronométrées face au RTO.
- RPO/RTO définis par service selon la criticité.
- Architecture multi-zone pour les services critiques ; plan de continuité et de reprise documenté.
- Plan de réponse à incident : rôles, contacts, procédures de notification (CNIL sous 72 h, ANSSI/autorité compétente selon NIS2/DORA), exercices.

## 8. Conformité réglementaire
Applicabilité à confirmer au cas par cas avec le DPO et le service juridique.

| Référentiel | S'applique typiquement si… | Points clés à vérifier |
|---|---|---|
| **RGPD** | Traitement de données personnelles de personnes dans l'UE | Base légale, registre des traitements, AIPD si risque élevé, minimisation, droits des personnes, transferts hors UE, sous-traitants (art. 28), notification de violation sous 72 h |
| **NIS2** | Entité essentielle ou importante dans un secteur couvert (énergie, santé, transport, numérique, administrations…) | Gestion des risques, sécurité de la chaîne d'approvisionnement, notification d'incident (alerte sous 24 h), responsabilité de la direction |
| **DORA** | Entité financière de l'UE ou prestataire TIC critique pour celle-ci | Gestion des risques TIC, tests de résilience, gestion des incidents, encadrement des prestataires tiers |
| **HDS** | Hébergement de données de santé en France | Hébergeur certifié HDS |
| **SecNumCloud** | Données sensibles d'administrations ou d'OIV/OSE, exigence de souveraineté | Prestataire qualifié par l'ANSSI, immunité aux lois extraterritoriales |
| **PCI-DSS** | Stockage, traitement ou transmission de données de carte bancaire | Segmentation de l'environnement carte, chiffrement, journalisation, tests d'intrusion |
| **AI Act** | Système d'IA mis sur le marché ou utilisé dans l'UE, surtout à haut risque | Classification du risque, documentation, transparence, gestion des données, supervision humaine |
| **ISO 27001** | Certification visée ou exigée contractuellement | SMSI, analyse de risques, contrôles de l'Annexe A, amélioration continue |

**Références utiles** : guide d'hygiène informatique de l'ANSSI, EBIOS Risk Manager, CIS Benchmarks, OWASP ASVS, recommandations de la CNIL.
