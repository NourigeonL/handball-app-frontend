# Gestionnaire de Clubs de Handball

Application web moderne pour la gestion des clubs de handball, conçue exclusivement pour les utilisateurs authentifiés.

## 🚀 **Fonctionnalités**

### **Authentification**
- Connexion via Google Sign-In
- Gestion des sessions utilisateur
- Protection des routes

### **Gestion des Clubs**
- Sélection automatique du club (si un seul)
- Modal de sélection pour utilisateurs multi-clubs
- Interface centrée sur le club sélectionné
- Gestion des permissions (membre, admin, propriétaire)

### **Interface Utilisateur**
- Design moderne avec Tailwind CSS
- Interface entièrement en français
- Navigation intuitive et responsive
- Gestion des états de chargement

## 🏗️ **Architecture**

### **Frontend**
- **Framework** : Next.js 14 avec App Router
- **Langage** : TypeScript
- **Styling** : Tailwind CSS
- **État** : React Context + localStorage

### **Authentification**
- **Provider** : Google Identity Services
- **Gestion** : Context React personnalisé
- **Sécurité** : Routes protégées

### **API**
- **Utilitaires** : Fonctions d'authentification avec token + club ID
- **Hook** : `useClubAuth` pour la gestion des requêtes
- **Headers** : Authentification automatique

## 📁 **Structure du Projet**

```
src/
├── app/                    # Pages Next.js
│   ├── clubs/            # Gestion des clubs
│   ├── profile/          # Profil utilisateur
│   └── layout.tsx        # Layout principal
├── components/            # Composants React
│   ├── Navigation.tsx    # Barre de navigation
│   ├── ProtectedRoute.tsx # Protection des routes
│   ├── UserProfile.tsx   # Profil utilisateur
│   └── ...               # Autres composants
├── contexts/             # Contextes React
│   └── AuthContext.tsx   # Gestion de l'authentification
├── hooks/                # Hooks personnalisés
│   └── useClubAuth.ts    # Hook d'authentification club
├── types/                # Types TypeScript
│   ├── auth.ts          # Types d'authentification
│   └── clubs.ts         # Types des clubs
└── utils/                # Utilitaires
    ├── api.ts           # Fonctions d'API
    └── googleAuth.ts    # Utilitaires Google
```

## 🚀 **Installation**

### **Prérequis**
- Node.js 18+ 
- npm ou yarn

### **Configuration**
1. **Cloner le projet**
   ```bash
   git clone <repository-url>
   cd handball-app-frontend
   ```

2. **Installer les dépendances**
   ```bash
   npm install
   ```

3. **Configuration des variables d'environnement**
   ```bash
   cp env.example .env.local
   ```
   
   Configurer dans `.env.local` :
   ```env
   NEXT_PUBLIC_GOOGLE_CLIENT_ID=votre-client-id-google
   NEXT_PUBLIC_API_URL=http://localhost:8000
   ```

4. **Configuration Google OAuth**
   - Aller à [Google Cloud Console](https://console.cloud.google.com/)
   - Créer un projet et activer Google+ API
   - Créer des identifiants OAuth 2.0
   - Ajouter `http://localhost:3000` aux origines autorisées

5. **Démarrer l'application**
   ```bash
   npm run dev
   ```

## 🔧 **Utilisation**

### **Connexion**
1. Accéder à l'application
2. Cliquer sur "Se connecter avec Google"
3. Authentification via Google
4. Sélection du club (si plusieurs)

### **Navigation**
- **Tableau de Bord** : Vue d'ensemble et actions rapides
- **Profil** : Gestion du profil et changement de club
- **Club** : Accès aux détails du club sélectionné

### **Gestion des Clubs**
- Affichage automatique du club sélectionné
- Changement de club depuis le profil
- Gestion des permissions selon le rôle

## 📚 **Documentation**

- **`ROUTE_STRUCTURE.md`** - Structure des routes et navigation
- **`CLUB_API_README.md`** - Utilitaires d'API d'authentification
- **`GOOGLE_USER_INFO_README.md`** - Intégration Google

## 🛠️ **Développement**

### **Scripts disponibles**
```bash
npm run dev          # Démarrage en mode développement
npm run build        # Build de production
npm run start        # Démarrage en mode production
npm run lint         # Vérification du code
```

### **Structure des composants**
- **Composants fonctionnels** avec hooks React
- **TypeScript strict** pour la sécurité des types
- **Tailwind CSS** pour le styling
- **Responsive design** pour mobile et desktop

## 🔒 **Sécurité**

- **Routes protégées** : Authentification requise
- **Validation des tokens** : Vérification Google
- **Isolation des clubs** : Accès limité au club sélectionné
- **Gestion des permissions** : Rôles utilisateur

## 🌍 **Internationalisation**

- Interface entièrement en français
- Support des locales Google
- Messages d'erreur localisés

## 🤝 **Contribution**

1. Fork le projet
2. Créer une branche feature (`git checkout -b feature/AmazingFeature`)
3. Commit les changements (`git commit -m 'Add some AmazingFeature'`)
4. Push vers la branche (`git push origin feature/AmazingFeature`)
5. Ouvrir une Pull Request

## 📄 **Licence**

Ce projet est sous licence MIT. Voir le fichier `LICENSE` pour plus de détails.

## 📞 **Support**

Pour toute question ou problème :
- Créer une issue sur GitHub
- Contacter l'équipe de développement

---

**Gestionnaire de Clubs de Handball** - Application moderne et sécurisée pour la gestion des clubs de handball 🏐
