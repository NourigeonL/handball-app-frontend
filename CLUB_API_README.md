# Club API Authentication Utilities

Ce document explique comment utiliser les nouvelles utilitaires d'authentification pour les requêtes qui nécessitent à la fois un token d'accès et un ID de club.

## 🚀 Utilisation Rapide

### 1. Utilisation Directe des Fonctions

```typescript
import { authenticatedClubGet, authenticatedClubPost } from '@/utils/api';

// GET request
const clubs = await authenticatedClubGet('/clubs/members');

// POST request
const newMember = await authenticatedClubPost('/clubs/members', {
  name: 'John Doe',
  email: 'john@example.com'
});
```

### 2. Utilisation du Hook `useClubAuth`

```typescript
import { useClubAuth } from '@/hooks/useClubAuth';

function MyComponent() {
  const { 
    clubId, 
    clubName, 
    isClubAdmin, 
    get, 
    post 
  } = useClubAuth();

  const handleFetchMembers = async () => {
    try {
      const members = await get('/clubs/members');
      console.log('Members:', members);
    } catch (error) {
      console.error('Error:', error.message);
    }
  };

  const handleAddMember = async (memberData) => {
    try {
      const result = await post('/clubs/members', memberData);
      console.log('Member added:', result);
    } catch (error) {
      console.error('Error:', error.message);
    }
  };

  return (
    <div>
      <h2>Club: {clubName}</h2>
      <p>Club ID: {clubId}</p>
      {isClubAdmin && <button onClick={handleFetchMembers}>Voir les Membres</button>}
    </div>
  );
}
```

## 🔧 Fonctions Disponibles

### Fonctions de Base

- **`authenticatedClubRequest(endpoint, options)`** - Requête personnalisée
- **`authenticatedClubGet(endpoint)`** - Requête GET
- **`authenticatedClubPost(endpoint, body)`** - Requête POST
- **`authenticatedClubPut(endpoint, body)`** - Requête PUT
- **`authenticatedClubDelete(endpoint)`** - Requête DELETE
- **`authenticatedClubPatch(endpoint, body)`** - Requête PATCH

### Hook `useClubAuth`

#### Informations du Club
- **`selectedClub`** - Objet complet du club sélectionné
- **`clubId`** - ID du club actuel
- **`clubName`** - Nom du club actuel
- **`clubRole`** - Rôle de l'utilisateur dans le club
- **`isClubSelected`** - Si un club est sélectionné
- **`hasSelectedClub`** - Vérification complète de la sélection

#### Permissions
- **`isClubAdmin`** - Si l'utilisateur est admin ou propriétaire
- **`isClubOwner`** - Si l'utilisateur est propriétaire

#### API Functions
- **`clubApi`** - Objet avec toutes les méthodes API
- **`get`, `post`, `put`, `delete`, `patch`** - Méthodes directes

## 📡 Headers Automatiques

Chaque requête inclut automatiquement :

```typescript
{
  'Content-Type': 'application/json',
  'Authorization': 'Bearer ${accessToken}',
  'X-Club-ID': ${selectedClub.club_id}
}
```

## 🚨 Gestion des Erreurs

Les utilitaires gèrent automatiquement les erreurs courantes :

- **401** - Token expiré → "Token d'accès expiré. Veuillez vous reconnecter."
- **403** - Accès refusé → "Accès refusé. Vérifiez vos permissions pour ce club."
- **404** - Ressource non trouvée → "Ressource non trouvée."
- **Autres** - Erreur avec code et message du serveur

## 📝 Exemples d'Utilisation

### Gestion des Membres

```typescript
const { get, post, put, delete: del } = useClubAuth();

// Récupérer tous les membres
const members = await get('/clubs/members');

// Ajouter un nouveau membre
const newMember = await post('/clubs/members', {
  name: 'Alice',
  email: 'alice@example.com',
  role: 'member'
});

// Modifier un membre
const updatedMember = await put('/clubs/members/123', {
  name: 'Alice Smith',
  role: 'admin'
});

// Supprimer un membre
await del('/clubs/members/123');
```

### Gestion des Événements

```typescript
const { post, get } = useClubAuth();

// Créer un événement
const event = await post('/clubs/events', {
  title: 'Match de Championnat',
  date: '2024-01-15',
  location: 'Gymnase Municipal'
});

// Récupérer les événements
const events = await get('/clubs/events');
```

### Gestion des Finances

```typescript
const { get, post } = useClubAuth();

// Récupérer le bilan
const balance = await get('/clubs/finances/balance');

// Ajouter une transaction
const transaction = await post('/clubs/finances/transactions', {
  amount: 50.00,
  description: 'Cotisation mensuelle',
  type: 'income'
});
```

## ⚠️ Prérequis

1. **Utilisateur connecté** - Token d'accès valide dans localStorage
2. **Club sélectionné** - Club sélectionné dans localStorage
3. **Permissions** - L'utilisateur doit avoir accès au club

## 🔒 Sécurité

- Vérification automatique du token d'accès
- Validation de l'ID du club
- Gestion des erreurs d'authentification
- Headers sécurisés pour chaque requête

## 🎯 Avantages

- **Code plus propre** - Plus besoin de gérer manuellement les headers
- **Sécurité renforcée** - Validation automatique des prérequis
- **Gestion d'erreurs** - Messages d'erreur en français et contextuels
- **Réutilisabilité** - Une seule fonction pour tous les types de requêtes
- **Type Safety** - Support TypeScript complet
