# Artify — Backend (Node.js / Express / MongoDB)

This repository contains the server-side API for Artify: a demonstration MERN-stack artwork showcase application. The backend is responsible for data storage, queries, business logic, and serving the JSON API consumed by the React frontend.

---

## 1. Project Overview

- Purpose: Provide RESTful endpoints to manage artworks, favorites, user profiles, and basic demo authentication for the Artify frontend.
- Responsibilities:
  - Persist artworks and favorites to MongoDB.
  - Expose endpoints for creating, reading, updating, deleting artworks.
  - Provide search, category filtering, featured listings, and pagination for public artworks.
  - Implement a like system (stored on artwork documents) and a favorites collection.
  - Demo-mode authentication: server accepts `userEmail` supplied by the client for owner checks (no Firebase Admin verification in demo mode).

Data models and main functionalities are implemented in the `models/`, `controllers/`, and `routes/` directories (see Folder Structure).

---

## 2. Live Server URL

- Vercel deployment URL: Replace with your actual deployment URL, for example: `https://your-artify-server.vercel.app`
- API base path: `/api`

Example full base: `https://your-artify-server.vercel.app/api`

---

## 3. Technologies Used

- Node.js
- Express.js
- MongoDB with Mongoose
- CORS
- dotenv
- cookie-parser
- jsonwebtoken (included as dependency but not required for demo-mode flows)
- nodemon (dev dependency)

---

## 4. Features

- Artworks CRUD: create, read, update, delete artworks with validation.
- Public vs Private visibility: artworks include a `visibility` field with `Public` or `Private`.
- Explore and search endpoints: query by full-text like fields (title, userName, description, medium), plus pagination.
- Category filtering: distinct categories endpoint and category-based queries.
- Featured artworks endpoint: returns a curated list for a home/featured view.
- Like system: `likesCount` and `likedBy` array are stored on each `Artwork` document; toggling adds/removes the user's email.
- Favorites system: separate `Favorite` collection allowing add, remove, list, toggle, and counts.
- User-based artwork listing: query artworks by `userEmail`.
- Input validation and consistent error responses across controllers.
- Demo-mode authentication: server accepts `userEmail` and optional `userName` from the request body for owner-sensitive actions (no Firebase Admin SDK required in demo mode).

---

## 5. Folder Structure

Top-level backend structure (important files and folders):

- `server.js` — Express app entry (exports `app` for Vercel and starts the server for local runs)
- `package.json` — dependencies and scripts (`npm run dev` runs `nodemon`)
- `config/` — configuration helpers
  - `db.js` — MongoDB connection helper
  - `firebase.js` — Firebase helper (not required for demo mode)
- `controllers/` — route handlers (business logic)
  - `artworkController.js`
  - `favoriteController.js`
- `models/` — Mongoose schemas
  - `Artwork.js`
  - `Favorite.js`
  - `User.js`
- `routes/` — Express routes
  - `artworkRoutes.js` mounted at `/api/artworks`
  - `favoriteRoutes.js` mounted at `/api/favorites`
  - `userRoutes.js` mounted at `/api/users`
- `middleware/` — helper middleware
  - `verifyFirebaseToken.js` (demo-mode: populates `req.user` from client-supplied `userEmail`)
- `vercel.json` — Vercel runtime configuration
- `seed_demo_artworks.js` — helper to seed demo artworks

Environment files:

- `.env` — local environment variables (not committed): contains `MONGODB_URI`, `PORT`, `NODE_ENV`, etc.

---

## 6. Environment Variables

Required environment variables (create a `.env` file in the root of the backend directory):

- `MONGODB_URI` — MongoDB connection string (required).
- `PORT` — Port used by local dev server (optional, defaults to `5000`).
- `NODE_ENV` — `development` or `production` (optional).
- `CLIENT_URL` — optional frontend allowed origin (the server uses allowed origins list).
- `CLIENT_URL_2` — optional second frontend allowed origin.

Note: This repository includes a `serviceAccountKey.json` file but demo-mode does not use the Firebase Admin SDK. For assignment or demo usage there is no secret required; however, do not commit real secrets to the repository. If you enable real Firebase Admin integration for production you must configure service account credentials securely (not in the repository).

---

## 7. Installation and Setup (Local Development)

1. Clone the repository and navigate to the server folder:

```powershell
git clone <repo-url>
cd assignment10_server
```

2. Install dependencies:

```powershell
npm install
```

3. Create a `.env` file (copy from any example or create a new file) and add required variables:

```text
MONGODB_URI=mongodb+srv://<user>:<pass>@cluster0.mongodb.net/artify?retryWrites=true&w=majority
PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:5173
```

4. Start the server for development:

```powershell
npm run dev
```

Or run without nodemon:

```powershell
node server.js
```

The server root health route is available at `http://localhost:5000/` and API base at `http://localhost:5000/api`.

---

## 8. API Documentation

Base path: `/api`

All responses follow this convention on success:

```json
{
  "success": true,
  "data": ...
}
```

On error:

```json
{
  "success": false,
  "message": "Human friendly message",
  "error": "Optional error message or stack when NODE_ENV=development"
}
```

Endpoints (artworks)

- GET `/api/artworks` — List public artworks (same as `/api/artworks/public`).
  - Query parameters: `search`, `category`, `limit` (default 50), `page` (default 1)
  - Response: paginated list of public artworks.

- GET `/api/artworks/featured`
  - Description: returns up to 6 artworks for featured/home view (public only).
  - Response example:
    - 200 OK: `{ success: true, count: <n>, data: [ { artwork... } ] }`

- GET `/api/artworks/public`
  - Same as GET `/api/artworks` — returns public artworks with search and filters.

- GET `/api/artworks/categories`
  - Returns distinct categories: `{ success: true, data: ["Painting","Sculpture",...] }`

- GET `/api/artworks/:id`
  - Params: `id` (artwork ObjectId)
  - Success response: `{ success: true, data: { artwork fields } }`
  - Errors: 400 for invalid id, 404 if not found

- POST `/api/artworks`
  - Body (JSON, demo-mode requires `userEmail` and recommends `userName`):
    - `imageUrl` (string, required)
    - `title` (string, required)
    - `category` (string, required)
    - `medium` (string, required)
    - `description` (string, required)
    - `dimensions` (string, optional)
    - `price` (number, optional)
    - `visibility` ("Public" | "Private", optional)
    - `userEmail` (string, required in demo-mode)
    - `userName` (string, optional)
  - Success: 201 Created `{ success: true, message: 'Artwork created successfully', data: { artwork } }`
  - Error: 400 for validation errors

- PUT `/api/artworks/:id`
  - Params: `id` (artwork ObjectId)
  - Body: any allowed artwork fields to update (imageUrl, title, category, medium, description, dimensions, price, visibility, userName); demo-mode requires `userEmail` in body to pass ownership check.
  - Success: `{ success: true, message: 'Artwork updated successfully', data: { artwork } }`
  - Errors: 400 invalid id or validation, 403 unauthorized if `userEmail` doesn't match artwork owner, 404 if not found

- DELETE `/api/artworks/:id`
  - Params: `id` (artwork ObjectId)
  - Body: include `userEmail` (demo-owner verification) — server accepts `userEmail` in body for ownership checks.
  - Success: `{ success: true, message: 'Artwork deleted successfully', data: { id } }`

- PATCH `/api/artworks/:id/like`
  - Params: `id` (artwork ObjectId)
  - Body: `{ userEmail: "user@example.com" }` (required in demo-mode)
  - Toggles like for `userEmail`. Returns `{ success: true, message, data: { liked: true|false, likesCount, artwork } }`

- GET `/api/artworks/:id/is-liked/:email`
  - Params: `id`, `email`
  - Response: `{ success: true, liked: true|false }`

Favorites endpoints

- POST `/api/favorites` — Add favorite
  - Body: `{ userEmail: "user@example.com", artworkId: "<artworkId>" }`
  - Success: 201 `{ success: true, message: 'Artwork added to favorites successfully', data: { favorite } }`
  - Errors: 400 missing fields, 404 artwork not found

- POST `/api/favorites/toggle` — Toggle favorite add/remove
  - Body: `{ userEmail, artworkId }`
  - Returns whether favorite was added or removed.

- DELETE `/api/favorites` — Remove favorite (body or query)
  - Body or query: `userEmail`, `artworkId`
  - Success: `{ success: true, message: 'Artwork removed from favorites successfully' }`

- GET `/api/favorites/:userEmail` — List user's favorites
  - Params: `userEmail`
  - Query: `limit`, `page`, `sort`
  - Success: `{ success: true, count, data: [ artwork, ... ], pagination: { total, page, pages, limit } }`

- GET `/api/favorites/:userEmail/ids` — Returns an array of artwork ids favorited by the user

- GET `/api/favorites/:userEmail/count` — Returns `{ success: true, data: { count } }`

- GET `/api/favorites/check/:userEmail/:artworkId` — Returns favorite status: `{ success: true, data: { isFavorited: true|false } }`

- DELETE `/api/favorites/:userEmail/clear` — Clears all favorites for `userEmail` (demo-use)

User endpoints

- PUT `/api/users/profile` — Upsert user profile
  - Body: `{ email, name, photoURL }`
  - Response: `{ success: true, user }`

Additional utility endpoints

- GET `/` — Root, returns `{ message: 'Artify API is running' }`.
- GET `/api/health` — Health check; returns `{ status: 'success', message: 'Server is healthy', timestamp }`.

---

## 9. Database Models

Artwork model (`models/Artwork.js`)

- Fields:
  - `imageUrl` (String, required)
  - `title` (String, required)
  - `category` (String, required) — enum: Painting, Sculpture, Digital Art, Photography, Drawing, Mixed Media, Illustration, Other
  - `medium` (String, required)
  - `description` (String, required)
  - `dimensions` (String, optional)
  - `price` (Number, optional)
  - `visibility` (String, required, enum: `Public` | `Private`, default `Public`)
  - `userName` (String, required)
  - `userEmail` (String, required, indexed)
  - `likesCount` (Number, default 0)
  - `likedBy` ([String], array of emails)
  - `createdAt`, `updatedAt` (timestamps)

Favorites model (`models/Favorite.js`)

- Fields:
  - `userEmail` (String, required, indexed)
  - `artworkId` (ObjectId reference to `Artwork`, required, indexed)
  - `addedAt` (Date)

- Unique compound index: `{ userEmail, artworkId }` to avoid duplicate favorites.

User model (`models/User.js`)

- Minimal profile schema used by the demo: `{ name, email (unique), photoURL }`.

---

## 10. Error Handling

- Controllers return consistent JSON error objects: `{ success: false, message, error? }`.
- Validation errors and missing fields return HTTP 400.
- Not found resources return HTTP 404.
- Unauthorized / ownership mismatch return HTTP 403.
- Server errors return HTTP 500 and include error stack when `NODE_ENV=development`.
- Invalid MongoDB ObjectId checks are performed and return 400 when an invalid id string is provided.

Standardized example error response:

```json
{
  "success": false,
  "message": "Artwork not found",
  "error": "Optional stack or message"
}
```

---

## 11. Deployment Instructions (Vercel)

1. Ensure `vercel.json` is present (this repository includes `vercel.json` that routes all requests to `server.js`).
2. Create a Vercel project connected to this repository or deploy using the Vercel CLI.
3. In the Vercel project settings add Environment Variables (same names as used in `.env`):
   - `MONGODB_URI` (production DB connection)
   - `NODE_ENV=production`
   - `CLIENT_URL` (optional)
4. Vercel build settings: no build step is required for this simple Node app; make sure the project uses Node and the `vercel.json` build and route settings are preserved.
5. Deploy: Vercel will run the `server.js` as the serverless function entrypoint per `vercel.json`.

Notes:
- If you serve a long-running connection or rely on local state, prefer hosting on a standard Node host (Heroku, Render, DigitalOcean) rather than Vercel Serverless functions. The included configuration is for lightweight API endpoints and works well for demos.

---

## 12. Demo Mode Note

- This server runs in demo mode: ownership and authentication are implemented by trusting `userEmail` (and optional `userName`) values sent by the client. The `verifyFirebaseToken` middleware in `middleware/verifyFirebaseToken.js` simply populates `req.user` from request fields — it does not validate tokens.
- Consequence: any client that sends `userEmail` can perform owner-like operations if the email matches the resource owner. This is intentionally simplified for assignment/demo purposes and is NOT secure for production use.
- For production, integrate a proper authentication provider (Firebase Admin SDK or JWT verification) and remove trust-on-client behavior.

---

If you want, I can:

- Add example cURL or Postman requests for each endpoint.
- Add a Postman collection or OpenAPI specification from the current code.

Replace the placeholder Vercel URL above with your actual deployment URL and this README will be ready for sharing.
