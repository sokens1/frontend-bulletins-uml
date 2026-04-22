# Documentation Technique et Fonctionnelle - Frontend (Next.js)

Cette documentation détaille l'interface utilisateur et les processus d'interaction de l'application de gestion des bulletins (UML).

## 🚀 Ressources Techniques

- **Framework** : [Next.js](https://nextjs.org/) (v15.1.0+) avec App Router
- **Langage** : TypeScript
- **Styling** : [Tailwind CSS](https://tailwindcss.com/)
- **Icônes** : [Lucide React](https://lucide.dev/)
- **Gestion d'État** : Hooks React (useState, useEffect, etc.)
- **Consommation API** : Fetch API / Axios
- **Déploiement** : [À compléter par l'utilisateur]

## 🔗 Liens Utiles

- **Dépôt GitHub (Frontend)** : [https://github.com/sokens1/frontend-bulletins-uml.git](https://github.com/sokens1/frontend-bulletins-uml.git)
- **Application en Production** : [Lien Frontend à insérer]
- **API (Backend)** : [https://grade-management-api-qfe3.onrender.com](https://grade-management-api-qfe3.onrender.com)

---

## 🔐 Comptes de Test / Accès

Pour tester les différentes interfaces, vous pouvez utiliser les comptes suivants (mdp par défaut : `Inptic2024!`) :

| Rôle | Email | Mot de Passe |
| :--- | :--- | :--- |
| **Administrateur** | `admin@inptic.ga` | `AdminPassword123!` |
| **Enseignant** | `prof@inptic.ga` | `Inptic2024!` |
| **Secrétariat** | `secretariat@inptic.ga` | `Inptic2024!` |
| **Étudiant** | `etudiant@inptic.ga` | `Inptic2024!` |

---

## 👥 Expérience Utilisateur par Profil

L'interface s'adapte dynamiquement en fonction du rôle de l'utilisateur connecté pour offrir une expérience fluide et sécurisée.

### 1. Administrateur (ADMIN)
- **Tableau de Bord** : Vue d'ensemble de l'activité du système.
- **Interface de Gestion** : Formulaires interactifs pour gérer les semestres, les UEs et les matières.
- **Gestion des Comptes** : Interface de création et d'édition des profils utilisateurs (import massif possible via CSV/Excel).

### 2. Enseignant (TEACHER)
- **Mes Matières** : Liste des cours attribués avec accès rapide aux listes d'étudiants.
- **Grille de Notes** : Tableaux modifiables en temps réel pour la saisie des notes (CC, Exam, Rattrapage).
- **Suivi des Absences** : Interface simple pour marquer les absences par séance ou par période.

### 3. Secrétariat (SECRETARY)
- **Annuaire Étudiant** : Recherche avancée et mise à jour des dossiers étudiants.
- **Centre de Documents** : Interface de génération de bulletins avec prévisualisation. Possibilité d'imprimer ou de télécharger des lots de bulletins.
- **Exportations** : Outils d'extraction de données structurées.

### 4. Étudiant (STUDENT)
- **Mon Espace** : Visualisation claire des notes par semestre.
- **Progression** : Graphiques ou indicateurs (si implémentés) sur la moyenne générale et les crédits validés.
- **Bulletins** : Section sécurisée pour télécharger les documents officiels.

---

## 🛠️ Installation et Exécution en Local

1.  **Cloner le dépôt** : `git clone https://github.com/sokens1/frontend-bulletins-uml.git`
2.  **Installer les dépendances** : `npm install`
3.  **Configurer le `.env.local`** : 
    ```env
    NEXT_PUBLIC_API_URL=https://grade-management-api-qfe3.onrender.com
    ```
4.  **Lancer le serveur de développement** : `npm run dev`
5.  **Accéder à l'application** : `http://localhost:3000`
