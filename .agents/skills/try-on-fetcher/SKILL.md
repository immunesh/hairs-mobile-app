---
name: try-on-fetcher
description: Technical overview of the virtual try-on augmented-reality feature, detailing starting a try-on, camera flow, photo uploading, wig assets and angles, rendering, fitting configurations, capture/download, debug mode, and data maintenance scripts.
---

## Virtual Try-On

The virtual try-on is a browser-side augmented-reality feature. The backend
does not generate a new try-on image or run face recognition. It returns a
product and its prepared transparent wig assets; the frontend detects the
face, estimates head pose, draws the wig on a canvas, and optionally captures
the result.

### Starting a try-on

Open the try-on page with a product ID or slug in the `wig` query parameter:

```text
/try-on?wig=<product-id-or-slug>
```

The page fetches the product from `GET /api/products/:id`. The backend accepts
either the product ID or slug and returns the product, variants, category,
reviews, and images. The try-on component then loads the product images again
and keeps only images where `isTryOn` is `true`.

### Camera flow

1. The user selects **Start Camera** and grants browser camera permission.
2. The frontend requests the user-facing camera with audio disabled. It asks
   for a portrait or landscape resolution based on the viewport.
3. MediaPipe Face Landmarker is loaded from the remote WASM package and model
   URLs. It tracks one face in `VIDEO` mode.
4. Each video frame is mirrored onto a canvas, matching a front-facing
   camera preview.
5. The detected landmarks pass through a One Euro Filter to reduce jitter.
6. `HeadPoseEstimator` calculates face and head dimensions plus yaw, pitch,
   roll, a skull center, and 3D basis vectors.
7. The renderer anchors the wig to that skull position and redraws it on every
   animation frame.
8. When tracking is lost, the tracking indicator disappears and the landmark
   smoother is reset.

The camera can be stopped. Stopping the camera ends all media tracks, cancels
the animation frame, clears the tracking state, and resets the smoother.

### Uploaded-photo flow

1. The user switches to **Upload Photo** and selects an image.
2. The image opens in a crop dialog with a fixed 4:5 crop area.
3. Applying the crop creates a local JPEG data URL; the source image is not
   uploaded to the backend.
4. MediaPipe loads in `IMAGE` mode and detects one face in the cropped photo.
5. The photo is resized to a maximum of 900 by 600 pixels for display, then
   the wig is drawn onto a local canvas.

If no face is detected, the original photo remains visible but no wig is
drawn. The current UI does not show a dedicated "face not found" error.

### Wig assets and angles

Try-on assets are stored as `ProductImage` rows. Each row has:

| Field | Purpose |
|---|---|
| `url` | Transparent wig image URL, normally hosted by Cloudinary or served locally |
| `angle` | View angle in degrees, normalized to 0 through 359 |
| `isTryOn` | Whether the image is eligible for live try-on |
| `isPrimary` | Whether the image is the product's primary catalogue image |

The normal live asset set is:

| Angle | View |
|---|---|
| `0` | Front |
| `45` | Right profile |
| `315` | Left profile |

Back and top views can remain in the product gallery, but are normally marked
`isTryOn: false` because a face-facing camera cannot see those views.

`angleInterpolation.ts` converts the estimated yaw to degrees, finds the two
neighboring loaded assets, and cross-fades between them. If the gap between
assets is greater than 90 degrees, it holds the nearest asset instead of
blending unrelated views. With only one eligible image, that image is used at
full opacity for every head angle.

### Rendering and fit calculation

`wigRenderer.ts` draws each selected asset with these calculations:

- The skull anchor is calculated in 3D using the head's right, up, and back
  vectors.
- A perspective factor changes the rendered size based on depth.
- Head width controls the base wig width.
- Yaw compresses the wig horizontally for turned profiles.
- Pitch changes the rendered height.
- Roll rotates the canvas to follow head tilt.
- The image's opaque silhouette is measured instead of treating the whole PNG
  frame as hair.
- The cap width is measured separately, so long wigs are sized by their
  head-covering cap rather than by their shoulder-length silhouette.
- The fringe position is measured from the alpha channel and used to place the
  front hairline consistently across differently cropped assets.

Default and product-specific fitting values are in `frontend/lib/wigConfig.ts`.
They include scale, horizontal and vertical offsets, depth, rotation, pitch
and yaw multipliers, fringe placement, and optional per-angle overrides.

### Capturing and downloading

In camera mode, the capture button calls `canvas.toDataURL("image/jpeg", 0.9)`
and stores the result in browser state. The user can then:

- View the captured image.
- Download it as `hairsup-tryon-<timestamp>.jpg`.
- Reset the capture and return to the live view.
- Clear the current upload or capture and try another image.

The wig images request anonymous CORS before drawing. This is required so the
canvas remains clean and `toDataURL()` can export the captured result.

### Required browser and deployment conditions

- Camera mode requires browser camera permission.
- Production camera use normally requires HTTPS.
- The browser must be able to reach the MediaPipe WASM and model URLs.
- The backend product endpoint must be reachable through `NEXT_PUBLIC_API_URL`.
- Every product intended for try-on needs at least one valid transparent image
  with `isTryOn: true`.
- Cross-origin wig hosts must send CORS headers, otherwise the silhouette
  measurement and capture export fall back or fail.

### Debug fitting mode

Add `debug=1` to the try-on URL:

```text
/try-on?wig=<product-id-or-slug>&debug=1
```

This displays yaw, pitch, roll, available assets, angle blending, head width,
and the projected asset anchors. It also enables sliders for scale, fringe
drop, and depth. The displayed values can be copied into
`frontend/lib/wigConfig.ts` for a permanent default or product override.

### Data maintenance scripts

The backend includes one-off Prisma scripts for correcting image metadata:

```bash
# Preview front-asset flags, then apply them
npx ts-node prisma/backfillTryOn.ts
npx ts-node prisma/backfillTryOn.ts --apply

# Preview profile angle flags, then apply them
npx ts-node prisma/backfillProfiles.ts
npx ts-node prisma/backfillProfiles.ts --apply

# Remove profile try-on flags while retaining their angles
npx ts-node prisma/backfillProfiles.ts --revert
```

The scripts are intentionally dry-run by default. Product updates normalize
image input and preserve `angle` and `isTryOn`; this matters because editing a
product deletes and recreates its image rows.

### Current implementation gaps

- The try-on page currently passes one selected product and does not provide a
  populated product list, so the **Try These Wigs** carousel is generally
  inactive.
- The component has no add-to-cart operation. Try-on currently supports
  capture, download, and reset only.
- Product-fetch and image-load failures are logged or silently ignored rather
  than shown as detailed user-facing errors.
- `productImages` is populated but is not used by the rendered UI.
- Face detection supports one face only.
- Uploaded photos and captured images stay in browser memory and are not
  persisted by the backend.

### Main implementation files

- `frontend/app/(shop)/try-on/page.tsx` — page route and initial product fetch.
- `frontend/components/features/VirtualTryOn.tsx` — camera, upload, crop,
  capture, and product-image fetch flow.
- `frontend/lib/faceMesh.ts` — MediaPipe model initialization and caching.
- `frontend/lib/headPose.ts` — 3D head-pose estimation.
- `frontend/lib/landmarkSmoothing.ts` — landmark jitter filtering.
- `frontend/lib/angleInterpolation.ts` — angle selection and cross-fading.
- `frontend/lib/wigRenderer.ts` — perspective-aware canvas rendering.
- `frontend/lib/wigSilhouette.ts` — alpha-channel silhouette measurements.
- `frontend/lib/wigConfig.ts` — default and product-specific fit settings.
- `backend/src/routes/product.routes.ts` — product API routes.
- `backend/src/controllers/product.controller.ts` — product and image response.
- `backend/prisma/schema.prisma` — `ProductImage` metadata schema.
