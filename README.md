# ARTIFY Server API

Backend API for ARTIFY - A Creative Artwork Showcase Platform

## 🚀 Tech Stack

- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - Database
- **Mongoose** - ODM for MongoDB
- **Firebase Admin SDK** - Authentication & token verification

## 📁 Project Structure

```
artify-server/
├── config/
│   ├── db.js                    # MongoDB connection
│   └── firebase.js              # Firebase Admin initialization
├── controllers/
│   ├── artworkController.js     # Artwork business logic
│   └── favoriteController.js    # Favorites business logic
├── middleware/
│   └── verifyFirebaseToken.js   # Firebase auth middleware
├── models/
│   ├── Artwork.js              # Artwork schema
│   └── Favorite.js             # Favorite schema
├── routes/
│   ├── artworkRoutes.js        # Artwork endpoints
│   └── favoriteRoutes.js       # Favorite endpoints
├── .env                        # Environment variables
├── .gitignore
├── package.json
├── server.js                   # Main Express app
├── vercel.json                 # Vercel deployment config
├── README.md
├── API_DOCUMENTATION.md        # Complete API docs
├── AUTH_GUIDE.md               # Authentication guide
└── FIREBASE_SETUP.md           # Firebase setup instructions
```

## 📦 Installation

```bash
# Install dependencies
npm install

# Configure environment variables
# See .env file and FIREBASE_SETUP.md

# Start development server
npm run dev

# Start production server
npm start
```

## ⚙️ Environment Variables

```env
PORT=5000
MONGODB_URI=your_mongodb_connection_string
NODE_ENV=development
JWT_SECRET=your_jwt_secret_key

# Firebase Admin SDK (choose one method)
# Method 1: Service account file (development)
FIREBASE_SERVICE_ACCOUNT_PATH=./serviceAccountKey.json

# Method 2: Environment variables (production)
# FIREBASE_PROJECT_ID=your-project-id
# FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
# FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your-project.iam.gserviceaccount.com
```

**📖 See [FIREBASE_SETUP.md](./FIREBASE_SETUP.md) for detailed Firebase configuration.**

## 🔐 Authentication

All protected routes require Firebase ID token in the `Authorization` header:

```
Authorization: Bearer <firebase-id-token>
```

**📖 See [AUTH_GUIDE.md](./AUTH_GUIDE.md) for complete authentication documentation.**

## 🎯 Key Features

✅ **Firebase Authentication Integration**
- Firebase Admin SDK for token verification
- Protected routes with middleware
- User authentication on create, update, delete operations

✅ **Complete CRUD for Artworks**
- Create, read, update, delete artworks
- Owner-based authorization
- Field validation with Mongoose

✅ **Featured Artworks using MongoDB sort() + limit()**
- Get 6 most recent artworks: `sort({ createdAt: -1 }).limit(6)`
- Efficient database queries with proper indexing

✅ **Like System**
- Toggle like/unlike on artworks
- Track likes count and likedBy array
- Authenticated users only

✅ **Favorites System**
- Add/remove favorites (authenticated)
- Toggle favorite status
- Duplicate prevention with compound indexes
- Populated artwork data in responses

✅ **Advanced Filtering & Search**
- Filter by category
- Case-insensitive search in title, userName, description, medium
- Pagination support

✅ **Performance Optimizations**
- MongoDB indexes on frequently queried fields
- Efficient aggregation pipelines
- Proper error handling

## 📚 API Endpoints

### Public Artworks (No Auth Required)
- `GET /api/artworks/featured` - Get 6 most recent (MongoDB sort + limit)
- `GET /api/artworks/public` - Get all public artworks with filters
- `GET /api/artworks/categories` - Get categories with counts
- `GET /api/artworks/:id` - Get single artwork

### Protected Artworks (Auth Required) 🔒
- `POST /api/artworks` - Create artwork
- `GET /api/artworks/user/:email` - Get user's artworks
- `PUT /api/artworks/:id` - Update artwork (owner only)
- `DELETE /api/artworks/:id` - Delete artwork (owner only)
- `PATCH /api/artworks/:id/like` - Like/unlike artwork
- `GET /api/artworks/:id/is-liked/:email` - Check like status (optional auth)

### Protected Favorites (All Auth Required) 🔒
- `POST /api/favorites` - Add to favorites
- `GET /api/favorites/:userEmail` - Get user's favorites
- `DELETE /api/favorites` - Remove from favorites
- `POST /api/favorites/toggle` - Toggle favorite status
- `GET /api/favorites/check/:userEmail/:artworkId` - Check if favorited
- `GET /api/favorites/:userEmail/ids` - Get favorite IDs
- `GET /api/favorites/:userEmail/count` - Get favorites count
- `DELETE /api/favorites/:userEmail/clear` - Clear all favorites

**📖 See [API_DOCUMENTATION.md](./API_DOCUMENTATION.md) for complete details with examples.**

## 🗄️ Database Models

### Artwork Schema
```javascript
{
  imageUrl: String (required),
  title: String (required),
  category: String (required, enum),
  medium: String (required),
  description: String (required),
  dimensions: String (optional),
  price: Number (optional),
  visibility: "Public" | "Private" (required),
  userName: String (required),
  userEmail: String (required, indexed),
  likesCount: Number (default: 0),
  likedBy: [String] (emails array),
  createdAt: Date,
  updatedAt: Date
}
```

**Categories:** Painting, Sculpture, Digital Art, Photography, Drawing, Mixed Media, Illustration, Other

### Favorite Schema
```javascript
{
  userEmail: String (required, indexed),
  artworkId: ObjectId (ref: Artwork, required),
  addedAt: Date (default: now)
}
```

**Unique Index:** `{ userEmail: 1, artworkId: 1 }` (prevents duplicates)

## 🔐 Authentication Flow

### 1. Client Signs In (Frontend)
```javascript
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';

const auth = getAuth();
const userCredential = await signInWithEmailAndPassword(auth, email, password);
const token = await userCredential.user.getIdToken();
```

### 2. Make Authenticated Request
```javascript
const response = await fetch('http://localhost:5000/api/artworks', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({ /* artwork data */ })
});
```

### 3. Server Verifies Token
```javascript
// Middleware extracts and verifies token
// Attaches user to req.user
// Controller uses req.user.email for authorization
```

## 🛠️ Development

```bash
# Run in development mode with auto-restart
npm run dev

# Run in production mode
npm start
```

## 🚢 Deployment

### Deploy to Vercel

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Set environment variables in Vercel dashboard:
# - MONGODB_URI
# - NODE_ENV=production
# - JWT_SECRET
# - FIREBASE_PROJECT_ID
# - FIREBASE_PRIVATE_KEY
# - FIREBASE_CLIENT_EMAIL
```

The `vercel.json` configuration is already set up for serverless deployment.

**Important:** Use environment variables method for Firebase on Vercel (not service account file).

## 🧪 Testing API

### Test Public Endpoints (No Auth)
```bash
# Get featured artworks
curl http://localhost:5000/api/artworks/featured

# Search artworks
curl "http://localhost:5000/api/artworks/public?search=landscape&category=Painting"
```

### Test Protected Endpoints (With Auth)
```bash
# Get Firebase token from your frontend first
TOKEN="your-firebase-id-token"

# Create artwork
curl -X POST http://localhost:5000/api/artworks \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"title":"Test","category":"Painting",...}'

# Like artwork
curl -X PATCH http://localhost:5000/api/artworks/ARTWORK_ID/like \
  -H "Authorization: Bearer $TOKEN"
```

## 🚨 Common Issues

**Firebase Admin not initialized:**
- Check service account file path
- Verify environment variables
- See FIREBASE_SETUP.md

**401 Authentication required:**
- Include Authorization header
- Verify token is valid and not expired
- Check Firebase project matches

**403 Forbidden:**
- User doesn't own the resource
- Only owners can update/delete

## 📝 Notes

- All protected routes verify Firebase ID tokens
- MongoDB validation enforced at schema level
- CORS configured for React client compatibility
- Owner authorization for update/delete operations
- Duplicate prevention for likes and favorites
- Efficient queries with pagination support
- Token verification via Firebase Admin SDK

## 📄 License

MIT
