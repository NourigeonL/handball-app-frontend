# Google User Information Integration

Ce document explique comment récupérer et utiliser les informations utilisateur de Google lors de la connexion.

## 🚀 **Informations Disponibles**

Lors de la connexion avec Google, vous récupérez automatiquement :

### **Informations de Base**
- **`sub`** - ID unique Google de l'utilisateur
- **`name`** - Nom complet
- **`given_name`** - Prénom
- **`family_name`** - Nom de famille
- **`email`** - Adresse email
- **`email_verified`** - Statut de vérification de l'email
- **`picture`** - URL de la photo de profil
- **`locale`** - Langue/préférence régionale

### **Exemple de Données Google**
```json
{
  "sub": "110169484474386276334",
  "name": "John Doe",
  "given_name": "John",
  "family_name": "Doe",
  "picture": "https://lh3.googleusercontent.com/a-/AOh14Gj...",
  "email": "john.doe@gmail.com",
  "email_verified": true,
  "locale": "fr"
}
```

## 🔧 **Utilisation dans les Composants**

### **1. Hook `useAuth` avec Informations Google**

```typescript
import { useAuth } from '@/contexts/AuthContext';

function MyComponent() {
  const { user } = useAuth();
  
  if (user?.googleProfile) {
    console.log('Prénom:', user.googleProfile.given_name);
    console.log('Nom:', user.googleProfile.family_name);
    console.log('Photo:', user.googleProfile.picture);
    console.log('Email vérifié:', user.googleProfile.email_verified);
  }
  
  return (
    <div>
      <h2>Bonjour {user?.googleProfile?.given_name || user?.email} !</h2>
    </div>
  );
}
```

### **2. Utilisation des Utilitaires Google**

```typescript
import { formatGoogleUserDisplay, decodeGoogleIdToken } from '@/utils/googleAuth';

// Formater l'affichage utilisateur
const displayInfo = formatGoogleUserDisplay(googleProfile);
console.log(displayInfo.fullName);    // "John Doe"
console.log(displayInfo.firstName);   // "John"
console.log(displayInfo.lastName);    // "Doe"
console.log(displayInfo.initials);    // "JD"
console.log(displayInfo.picture);     // URL de la photo

// Décoder un token Google (pour debug)
const profile = decodeGoogleIdToken(googleIdToken);
```

### **3. Affichage Conditionnel**

```typescript
function UserDisplay() {
  const { user } = useAuth();
  
  return (
    <div>
      {/* Photo de profil Google ou initiales */}
      {user?.googleProfile?.picture ? (
        <img 
          src={user.googleProfile.picture} 
          alt={`Photo de ${user.googleProfile.name}`}
          className="w-16 h-16 rounded-full"
        />
      ) : (
        <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
          <span className="text-2xl font-bold text-blue-600">
            {user?.googleProfile?.given_name?.charAt(0) || user?.email?.charAt(0)}
          </span>
        </div>
      )}
      
      {/* Nom complet ou email */}
      <h3>{user?.googleProfile?.name || user?.email}</h3>
      
      {/* Badge Google vérifié */}
      {user?.googleProfile?.email_verified && (
        <span className="text-green-600 text-sm">✓ Email vérifié</span>
      )}
    </div>
  );
}
```

## 📱 **Exemples d'Interface**

### **Profil Utilisateur Amélioré**
```typescript
function EnhancedUserProfile() {
  const { user } = useAuth();
  const displayInfo = user?.googleProfile 
    ? formatGoogleUserDisplay(user.googleProfile)
    : { fullName: user?.email, initials: user?.email?.charAt(0) };

  return (
    <div className="bg-white rounded-lg p-6 shadow-md">
      <div className="flex items-center space-x-4">
        {/* Photo de profil Google */}
        {displayInfo.picture ? (
          <img 
            src={displayInfo.picture} 
            alt={`Photo de ${displayInfo.fullName}`}
            className="w-20 h-20 rounded-full object-cover border-4 border-blue-100"
          />
        ) : (
          <div className="w-20 h-20 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center">
            <span className="text-3xl font-bold text-white">
              {displayInfo.initials}
            </span>
          </div>
        )}
        
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            {displayInfo.fullName}
          </h2>
          <p className="text-gray-600">{user?.email}</p>
          
          {/* Informations Google */}
          {user?.googleProfile && (
            <div className="mt-2 space-y-1">
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 bg-white rounded-sm flex items-center justify-center border border-gray-300">
                  <span className="text-blue-600 font-bold text-xs">G</span>
                </div>
                <span className="text-sm text-gray-500">Compte Google</span>
              </div>
              
              {user.googleProfile.email_verified && (
                <div className="flex items-center space-x-1 text-green-600">
                  <span className="text-sm">✓</span>
                  <span className="text-sm">Email vérifié</span>
                </div>
              )}
              
              {user.googleProfile.locale && (
                <span className="text-xs text-gray-400">
                  Langue: {user.googleProfile.locale}
                </span>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
```

### **Navigation avec Nom Utilisateur**
```typescript
function UserNavigation() {
  const { user } = useAuth();
  const displayInfo = user?.googleProfile 
    ? formatGoogleUserDisplay(user.googleProfile)
    : { fullName: user?.email, initials: user?.email?.charAt(0) };

  return (
    <div className="flex items-center space-x-3">
      {/* Avatar avec photo Google */}
      {displayInfo.picture ? (
        <img 
          src={displayInfo.picture} 
          alt={displayInfo.fullName}
          className="w-8 h-8 rounded-full"
        />
      ) : (
        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
          <span className="text-sm font-semibold text-blue-600">
            {displayInfo.initials}
          </span>
        </div>
      )}
      
      {/* Nom utilisateur */}
      <span className="text-sm font-medium text-gray-700">
        {displayInfo.fullName}
      </span>
    </div>
  );
}
```

## 🔒 **Sécurité et Bonnes Pratiques**

### **1. Vérification du Token**
```typescript
// Le token est automatiquement vérifié par votre backend
// Mais vous pouvez aussi valider les scopes côté client
import { validateGoogleScopes } from '@/utils/googleAuth';

const requiredScopes = ['openid', 'email', 'profile'];
const hasValidScopes = validateGoogleScopes(googleIdToken, requiredScopes);

if (!hasValidScopes) {
  console.error('Token Google manque des scopes requis');
}
```

### **2. Gestion des Erreurs**
```typescript
try {
  const profile = decodeGoogleIdToken(googleToken);
  if (!profile) {
    throw new Error('Impossible de décoder le profil Google');
  }
  
  // Utiliser le profil
  console.log('Profil Google:', profile);
} catch (error) {
  console.error('Erreur lors du décodage Google:', error);
  // Fallback vers les données du backend
}
```

### **3. Fallback Graciel**
```typescript
const userName = user?.googleProfile?.given_name 
  || user?.first_name 
  || user?.email?.split('@')[0] 
  || 'Utilisateur';

const userPicture = user?.googleProfile?.picture 
  || user?.profile_picture 
  || null;
```

## 📊 **Données Stockées**

### **LocalStorage**
```typescript
// Données utilisateur enrichies
localStorage.setItem('userData', JSON.stringify({
  id: '123',
  email: 'john.doe@gmail.com',
  googleProfile: {
    sub: '110169484474386276334',
    name: 'John Doe',
    given_name: 'John',
    family_name: 'Doe',
    picture: 'https://lh3.googleusercontent.com/...',
    email: 'john.doe@gmail.com',
    email_verified: true,
    locale: 'fr'
  },
  first_name: 'John',
  last_name: 'Doe',
  profile_picture: 'https://lh3.googleusercontent.com/...'
}));
```

### **État React**
```typescript
const authState = {
  user: {
    id: '123',
    email: 'john.doe@gmail.com',
    googleProfile: { /* ... */ },
    first_name: 'John',
    last_name: 'Doe',
    profile_picture: 'https://...'
  },
  isAuthenticated: true,
  // ... autres propriétés
};
```

## 🎯 **Avantages**

1. **Expérience utilisateur améliorée** - Noms réels au lieu d'emails
2. **Photos de profil** - Interface plus personnelle
3. **Informations vérifiées** - Email et profil Google validés
4. **Fallback robuste** - Fonctionne même sans profil Google
5. **Internationalisation** - Support des locales utilisateur
6. **Sécurité** - Validation automatique des tokens

## ⚠️ **Limitations**

- **Décodage côté client** - Pour la production, vérifiez les tokens côté serveur
- **Dépendance Google** - L'application nécessite une connexion Google
- **Stockage local** - Les données sont stockées dans le navigateur
- **Permissions** - Nécessite les scopes `openid`, `email`, `profile`

Maintenant vous pouvez facilement afficher les noms réels, photos de profil et autres informations Google de vos utilisateurs ! 🎉
