# Rapport d'analyse : Connexions, Rôles et Permissions

Ce rapport détaille l'architecture actuelle du système d'authentification, de gestion des rôles et des permissions de la plateforme DepXpreS. L'analyse se base sur le code source existant.

## 1. Création de comptes et Connexion

Le système distingue trois types d'utilisateurs : **Client**, **Chauffeur** et **Admin**. Les flux de création de compte et de connexion sont distincts pour chaque type.

### 1.1. Clients et Chauffeurs

Les clients et les chauffeurs partagent une architecture similaire pour l'inscription et la connexion, mais avec des formulaires et des redirections spécifiques.

| Action | Méthodes supportées | Statut actuel |
|---|---|---|
| **Inscription** | Email/Mot de passe, Google, Apple | **Partiellement implémenté** |
| **Connexion** | Email/Téléphone + Code OTP | **Partiellement implémenté** |

> **Analyse** : Les formulaires d'inscription et de connexion sont présents dans l'interface utilisateur (UI), mais la logique de communication avec Firebase (création d'utilisateur, envoi de l'OTP, vérification) n'est **pas encore implémentée**. Les boutons ne déclenchent pas d'appel à l'API Firebase Auth. Le système est donc **non fonctionnel** à ce stade.

### 1.2. Administrateurs

Il n'existe **aucun formulaire** de connexion ou d'inscription pour les administrateurs. L'accès au dashboard admin (`/admin`) est actuellement public. La gestion des utilisateurs admin (création, assignation de rôle) se fait manuellement dans la base de données Firestore.

## 2. Rôles et Permissions

Le système prévoit trois rôles administratifs avec des niveaux de permission distincts.

| Rôle | Description | Permissions prévues |
|---|---|---|
| **Super Admin** | Contrôle total sur la plateforme. | Toutes les permissions, y compris la gestion des autres admins, la configuration du système et les opérations financières. |
| **Dispatcher** | Gestion des commandes et des chauffeurs. | Assignation manuelle des commandes, suivi des chauffeurs, communication avec les clients/chauffeurs. Permissions limitées sur les configurations. |
| **Agent** | Support client et gestion des litiges. | Accès aux informations des commandes et des clients pour résoudre les problèmes. Permissions très limitées. |

> **Analyse** : La définition des rôles est conceptuelle. Le code ne contient **aucune logique de rôles ou de permissions**. Il n'y a pas de `customClaims` Firebase, de collection `roles` dans Firestore, ou de middleware pour protéger les routes API en fonction du rôle. Toutes les routes API admin sont **publiques et non protégées**. La gestion des permissions affichée dans le dashboard (`/admin/permissions`) est une **maquette statique** qui ne reflète aucune configuration réelle.

## 3. Système OTP et SMS

Le système de connexion par code unique (OTP) envoyé par SMS est prévu mais **non fonctionnel**.

- **Interface** : Les champs pour entrer le numéro de téléphone et le code OTP existent.
- **Backend** : Il n'y a **aucune intégration** avec un fournisseur de services SMS (ex: Twilio, Vonage). Aucune variable d'environnement (`TWILIO_SID`, `VONAGE_KEY`, etc.) n'est configurée.
- **Firebase Auth** : L'authentification par numéro de téléphone de Firebase n'est pas configurée (y compris la vérification reCAPTCHA).

> **Conclusion** : La connexion par OTP/SMS est une **fonctionnalité non implémentée**.

## 4. Enregistrement dans la base de données

Lors de la création d'un compte, les informations des utilisateurs doivent être sauvegardées dans des collections Firestore dédiées.

- **Clients** : Collection `client_profiles`
- **Chauffeurs** : Collection `driver_profiles`

> **Analyse** : Comme les formulaires d'inscription ne sont pas fonctionnels, **aucun nouvel utilisateur n'est actuellement enregistré** dans Firestore lors de l'inscription. Les 7 chauffeurs existants ont été ajoutés manuellement via un script.

## 5. Visibilité des profils (Chauffeur vs Client)

Lors de l'assignation d'une commande, une visibilité croisée limitée entre le client et le chauffeur est nécessaire.

- **Ce que le chauffeur voit** : Le chauffeur peut voir le **nom, le téléphone et l'adresse de livraison** du client.
- **Ce que le client voit** : Le client peut voir le **nom et la photo de profil** du chauffeur.

> **Analyse** : Cette fonctionnalité est **correctement implémentée**. Les API (`/api/workflow/driver/[driverId]/active-order` et `/api/workflow/order/[orderId]/tracking`) et les pages correspondantes (`/driver/dashboard` et `/client/order`) gèrent bien cet échange d'informations de manière sécurisée et limitée au contexte d'une commande active.

## 6. Autocomplete des adresses

Les formulaires de création de compte et de commande intègrent un système d'autocomplete pour les adresses.

- **Technologie** : Le composant `<AddressAutocompleteInput />` utilise une API hybride qui combine la base de données **BDOA** (pour les recherches par numéro de rue) et l'API **Google Maps Geocoding** (pour les recherches par nom de rue).
- **Statut** : **Fonctionnel**. Le système est bien intégré dans les formulaires d'inscription chauffeur, de checkout client et de création de commande admin.

## Synthèse et Recommandations

| Domaine | Statut | Recommandations |
|---|---|---|
| **Création de comptes / Connexion** | 🔴 **Non fonctionnel** | Implémenter la logique Firebase Auth (Email/Password, Google/Apple, Phone OTP) pour les clients et chauffeurs. |
| **Rôles et Permissions Admin** | 🔴 **Non fonctionnel** | Mettre en place un système de rôles basé sur les `customClaims` Firebase. Protéger toutes les routes API admin avec un middleware de vérification des rôles. |
| **Système OTP/SMS** | 🔴 **Non fonctionnel** | Intégrer un service tiers comme Twilio et configurer Firebase Phone Auth. |
| **Enregistrement en base de données** | 🔴 **Non fonctionnel** | Lier les formulaires d'inscription à des fonctions qui créent les profils dans Firestore. |
| **Visibilité Profils Commande** | ✅ **Fonctionnel** | Aucune action requise. |
| **Autocomplete Adresse** | ✅ **Fonctionnel** | Aucune action requise. |

Le développement de l'authentification et de la gestion des permissions est **critique** et doit être la **prochaine priorité** pour sécuriser la plateforme et la rendre fonctionnelle.
