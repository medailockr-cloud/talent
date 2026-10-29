# Commercial Deployment Guide: Talent Platform on Supabase & Google Cloud

This guide provides instructions to deploy the Talent backend and services to **Supabase** (PostgreSQL) and **Google Cloud Platform** (Cloud Run, Cloud Storage, and Memorystore Redis).

---

## 1. Architecture Overview

- **Database**: Supabase Managed PostgreSQL with PgBouncer connection pooling (`DATABASE_URL` on port 6543, `DIRECT_URL` on port 5432).
- **Compute / API**: Google Cloud Run (containerized Node.js 20 with native FFmpeg, session affinity, auto-scaling).
- **Real-Time WebSockets**: Socket.IO with `@socket.io/redis-adapter` for multi-instance message synchronization.
- **Media & Video Streaming**: Google Cloud Storage (GCS) + Cloud CDN for HLS playlists (`.m3u8`), `.ts` segments, raw videos, and avatars.
- **Task Queues & Caching**: Redis (Google Cloud Memorystore or Upstash) powering BullMQ video transcoding and feed caching.
- **Mobile Release**: Expo Application Services (EAS) targeting iOS App Store and Google Play.

---

## 2. Environment Variables Configuration

| Variable | Description | Example Value |
| :--- | :--- | :--- |
| `NODE_ENV` | Runtime environment | `production` |
| `PORT` | Listening HTTP port | `3000` |
| `DATABASE_URL` | Supabase pooled connection string (port 6543) | `postgresql://postgres.[ref]:[pw]@aws-0-ap-south-1.pooler.supabase.com:6543/postgres?pgbouncer=true` |
| `DIRECT_URL` | Supabase direct connection string (port 5432) | `postgresql://postgres.[ref]:[pw]@aws-0-ap-south-1.pooler.supabase.com:5432/postgres` |
| `REDIS_URL` | Redis connection URL | `redis://default:[token]@[host]:6379` |
| `JWT_SECRET` | High-entropy authentication token secret | Random 64-character hex string |
| `GCS_BUCKET_NAME` | Cloud Storage bucket for video assets | `talent-production-media` |
| `CDN_BASE_URL` | Optional custom CDN edge domain | `https://media.talentapp.com` (or empty to use `storage.googleapis.com`) |
| `CORS_ORIGIN` | Allowed web origins | `https://talentapp.com,https://app.talentapp.com` (or `*`) |

---

## 3. Step-by-Step Deployment

### Phase 1: Database Setup on Supabase

1. Create a new Supabase project in your target region (e.g. `ap-south-1` Mumbai).
2. Go to **Project Settings > Database** and copy:
   - **Transaction Connection Pooler** (Port `6543`) -> Use for `DATABASE_URL`.
   - **Direct Connection** (Port `5432`) -> Use for `DIRECT_URL`.
3. Push your Prisma database schema:
   ```bash
   cd talent-backend
   npx prisma db push
   ```
4. (Optional) Seed the database with sample performance records:
   ```bash
   node src/seed_videos.js
   ```

---

### Phase 2: Google Cloud Storage Setup

1. Create the cloud storage bucket for media:
   ```bash
   gcloud storage buckets create gs://talent-production-media \
     --location=ASIA-SOUTH1 \
     --uniform-bucket-level-access
   ```
2. Grant public read access to media files (or configure via Cloud CDN):
   ```bash
   gcloud storage buckets add-iam-policy-binding gs://talent-production-media \
     --member=allUsers \
     --role=roles/storage.objectViewer
   ```
3. Set CORS configuration so web browsers and mobile apps can play HLS streams:
   Create a `cors.json` file:
   ```json
   [
     {
       "origin": ["*"],
       "method": ["GET", "HEAD"],
       "responseHeader": ["Content-Type", "Range"],
       "maxAgeSeconds": 3600
     }
   ]
   ```
   Apply CORS:
   ```bash
   gcloud storage buckets update gs://talent-production-media --cors-file=cors.json
   ```

---

### Phase 3: Redis Provisioning

Provision either:
- **Google Cloud Memorystore for Redis**:
  ```bash
  gcloud redis instances create talent-redis \
    --size=1 \
    --region=asia-south1 \
    --redis-version=redis_7_0
  ```
- **Or Upstash Redis**: Create a serverless database at [upstash.com](https://upstash.com) and copy the `rediss://...` connection URL.

---

### Phase 4: Container Build & Deploy to Google Cloud Run

1. Enable necessary Google Cloud APIs:
   ```bash
   gcloud services enable run.googleapis.com \
     artifactregistry.googleapis.com \
     secretmanager.googleapis.com
   ```

2. Create an Artifact Registry repository:
   ```bash
   gcloud artifacts repositories create talent-repo \
     --repository-format=docker \
     --location=asia-south1 \
     --description="Talent backend containers"
   ```

3. Build and submit the container image:
   ```bash
   cd talent-backend
   gcloud builds submit --tag asia-south1-docker.pkg.dev/[PROJECT_ID]/talent-repo/talent-backend:latest
   ```

4. Deploy to Cloud Run with Session Affinity (required for Socket.IO WebSockets):
   ```bash
   gcloud run deploy talent-backend \
     --image asia-south1-docker.pkg.dev/[PROJECT_ID]/talent-repo/talent-backend:latest \
     --platform managed \
     --region asia-south1 \
     --allow-unauthenticated \
     --session-affinity \
     --cpu 2 \
     --memory 2Gi \
     --set-env-vars "NODE_ENV=production,PORT=3000,GCS_BUCKET_NAME=talent-production-media,CORS_ORIGIN=*" \
     --set-env-vars "DATABASE_URL=[YOUR_SUPABASE_POOLED_URL]" \
     --set-env-vars "DIRECT_URL=[YOUR_SUPABASE_DIRECT_URL]" \
     --set-env-vars "REDIS_URL=[YOUR_REDIS_URL]" \
     --set-env-vars "JWT_SECRET=[YOUR_JWT_SECRET]"
   ```

5. Once deployed, Cloud Run will output your live URL (e.g., `https://talent-backend-xyz.a.run.app`).

---

### Phase 5: Mobile App Connection (Expo EAS)

1. Open `talent-mobile/eas.json` and set your Cloud Run URL in the `production` and `preview` profiles:
   ```json
   "env": {
     "EXPO_PUBLIC_API_URL": "https://talent-backend-xyz.a.run.app/api"
   }
   ```
2. Build the Android release:
   ```bash
   cd talent-mobile
   eas build --platform android --profile production
   ```
3. Build the iOS release:
   ```bash
   cd talent-mobile
   eas build --platform ios --profile production
   ```

