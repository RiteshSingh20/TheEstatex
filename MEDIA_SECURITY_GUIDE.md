# Centralized Media URL Security System

This system provides secure access to media files through your MediaServer proxy with token-based authentication.

## Components

### 1. MediaSecurityManager

Central manager for handling URL security and token generation.

```typescript
import { mediaSecurityManager } from "../utils/mediaSecurityManager";

// Get secure URL with default 1-hour expiry
const secureUrl = mediaSecurityManager.getSecureUrl(
  "https://example.com/image.jpg"
);

// Get secure URL with custom expiry
const secureUrl = mediaSecurityManager.getSecureUrl(
  "https://example.com/image.jpg",
  {
    expiryHours: 24,
    allowDirectAccess: false,
  }
);

// Clear token cache
mediaSecurityManager.clearCache();
```

### 2. useSecureMedia Hook

React hook for secure media handling with loading states.

```typescript
import { useSecureMedia } from "../hooks/useSecureMedia";

function MyComponent() {
  const { secureUrl, loading, error, refresh } = useSecureMedia(
    "https://firebasestorage.googleapis.com/image.jpg",
    { expiryHours: 2 }
  );

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return <img src={secureUrl} alt="Secure image" />;
}
```

### 3. SecureImage Component

Drop-in replacement for img tags with automatic security.

```typescript
import { SecureImage } from "../components/SecureImage";

function Gallery() {
  return (
    <SecureImage
      src="https://firebasestorage.googleapis.com/image.jpg"
      fallbackSrc="/placeholder.jpg"
      alt="Property image"
      className="w-full h-64 object-cover"
      securityOptions={{ expiryHours: 6 }}
      onSecurityError={(error) => console.error("Security error:", error)}
    />
  );
}
```

### 4. SecureVideo Component

Secure video player with controls and error handling.

```typescript
import { SecureVideo } from "../components/SecureVideo";

function VideoPlayer() {
  return (
    <SecureVideo
      src="https://storage.googleapis.com/video.mp4"
      poster="https://storage.googleapis.com/thumbnail.jpg"
      controls
      className="w-full h-96"
      securityOptions={{ expiryHours: 12 }}
    />
  );
}
```

### 5. SecureMediaGallery Component

Complete gallery with mixed media types.

```typescript
import { SecureMediaGallery } from "../components/SecureMediaGallery";

function PropertyGallery() {
  const mediaItems = [
    {
      id: "1",
      url: "https://firebasestorage.googleapis.com/image1.jpg",
      type: "image" as const,
      title: "Living Room",
    },
    {
      id: "2",
      url: "https://storage.googleapis.com/tour.mp4",
      type: "video" as const,
      thumbnail: "https://storage.googleapis.com/tour-thumb.jpg",
      title: "Virtual Tour",
    },
  ];

  return (
    <SecureMediaGallery
      items={mediaItems}
      securityOptions={{ expiryHours: 8 }}
      showTitles
      onItemClick={(item, index) => console.log("Clicked:", item)}
      onSecurityError={(error, item) =>
        console.error("Error for", item.id, error)
      }
    />
  );
}
```

## Environment Variables

Add to your `.env` file:

```
VITE_SECRET_KEY=your-actual-secret-key-here
```

## Server Configuration

Your MediaServer is already configured at:
`https://signed-media-gateway-655518493333.asia-south1.run.app`

## Supported Domains

The system validates URLs from these trusted domains:

- firebasestorage.googleapis.com
- storage.googleapis.com
- cloudinary.com
- amazonaws.com

## Security Features

1. **Token-based Authentication**: URLs are secured with HMAC-SHA256 tokens
2. **Expiry Control**: Configurable token expiration (default 1 hour)
3. **Domain Validation**: Only trusted domains are allowed
4. **Caching**: Intelligent token caching to reduce server calls
5. **Error Handling**: Comprehensive error handling with fallbacks
6. **CORS Support**: Proper CORS headers for cross-origin requests

## Migration Guide

### From Direct URLs

```typescript
// Before
<img src="https://firebasestorage.googleapis.com/image.jpg" />

// After
<SecureImage src="https://firebasestorage.googleapis.com/image.jpg" />
```

### From Manual Token Generation

```typescript
// Before
const token = encryptUrl(url);
const secureUrl = `${MEDIA_SERVER}?token=${token}`;

// After
const secureUrl = mediaSecurityManager.getSecureUrl(url);
```

## Performance Tips

1. Use appropriate expiry times (longer for static content)
2. Enable caching for frequently accessed media
3. Use fallback images for better UX
4. Batch process multiple URLs when possible
