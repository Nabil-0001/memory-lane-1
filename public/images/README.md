# Memory Lane Images

This project uses **Firebase Storage** for storing images.

## Setting Up Firebase Storage

### 1. Create a Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project or use an existing one
3. Go to **Storage** in the left sidebar
4. Click **Get Started** to enable Firebase Storage

### 2. Configure Storage Rules

In the Firebase Console, go to Storage > Rules and set:

```
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /{allPaths=**} {
      allow read;  // Public read access for images
      allow write: if request.auth != null;  // Only authenticated users can upload
    }
  }
}
```

### 3. Upload Images

You can upload images via:

- **Firebase Console**: Go to Storage > Files and drag/drop images
- **Firebase CLI**:
  ```bash
  firebase storage:bucket upload first_date.jpg
  ```

### 4. Configure Environment Variable

Create a `.env.local` file in the project root:

```
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project-id.appspot.com
```

Find your bucket name in Firebase Console > Storage (it's shown at the top, e.g., `gs://your-project-id.appspot.com`)

## Image Path Formats

The app supports multiple image path formats:

| Format            | Example                                      | Description                           |
| ----------------- | -------------------------------------------- | ------------------------------------- |
| Filename only     | `first_date.jpg`                             | Auto-converts to Firebase Storage URL |
| Full Firebase URL | `https://firebasestorage.googleapis.com/...` | Used as-is                            |
| Local path        | `/images/first_date.jpg`                     | For local development                 |

## Recommended Image Specs

- **Format**: JPG or PNG (JPG preferred for photos)
- **Size**: 800-1200px width recommended
- **Aspect Ratio**: 4:3 or 16:9 works best
- **File Size**: Keep under 500KB for fast loading

## Default Placeholder Images

Upload these images to your Firebase Storage bucket:

- `first_date.jpg`
- `first_trip.jpg`
- `valentines.jpg`
- `moving_in.jpg`
- `anniversary_2.jpg`
- `surprise_cabin.jpg`
- `christmas.jpg`
- `anniversary_5.jpg`
- `future.jpg`

## Alternative: Local Development

For local development without GCS, you can:

1. Place images in this `public/images/` folder
2. Use paths like `/images/first_date.jpg` in milestones
3. These will work locally but won't be on GCS
