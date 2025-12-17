# Media Server - Cloud Run Proxy

This server proxies Firebase Storage files with proper CORS headers for PDF viewing.

## Deploy to Cloud Run

1. Build and push the Docker image:
```bash
cd MediaServer
gcloud builds submit --tag gcr.io/YOUR_PROJECT_ID/media-server
```

2. Deploy to Cloud Run:
```bash
gcloud run deploy media-server \
  --image gcr.io/YOUR_PROJECT_ID/media-server \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated
```

3. Get the service URL and update your frontend to use:
```
https://YOUR_CLOUD_RUN_URL/proxy?url=FIREBASE_STORAGE_URL
```

## Local Testing

```bash
npm install
npm start
```

Server will run on http://localhost:8080
