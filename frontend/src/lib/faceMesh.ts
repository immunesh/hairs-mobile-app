// Dynamically import MediaPipe modules on demand on the Web to prevent the Metro bundler
// from parsing the vision_bundle.mjs dynamic imports (which causes a TransformError).
let FilesetResolver: any = null;
let FaceLandmarker: any = null;

async function loadMediaPipe() {
  if (FilesetResolver && FaceLandmarker) return;
  // Bypasses static analysis by utilizing the Function constructor to fetch the ES module.
  const importEsModule = new Function("url", "return import(url)");
  const mediapipe = await importEsModule(
    "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.35/vision_bundle.mjs"
  );
  FilesetResolver = mediapipe.FilesetResolver;
  FaceLandmarker = mediapipe.FaceLandmarker;
}

let videoFaceLandmarker: any = null;
let imageFaceLandmarker: any = null;

/* ---------------- VIDEO MODE ---------------- */
/* Used for live camera */

export async function getFaceLandmarker() {
  if (videoFaceLandmarker) {
    return videoFaceLandmarker;
  }

  await loadMediaPipe();

  const vision = await FilesetResolver.forVisionTasks(
    "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.35/wasm"
  );

  videoFaceLandmarker =
    await FaceLandmarker.createFromOptions(
      vision,
      {
        baseOptions: {
          modelAssetPath:
            "https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/latest/face_landmarker.task",
        },

        runningMode: "VIDEO",

        numFaces: 1,

        outputFaceBlendshapes: false,
        outputFacialTransformationMatrixes: false,
      }
    );

  return videoFaceLandmarker;
}

/* ---------------- IMAGE MODE ---------------- */
/* Used for uploaded photos */

export async function getImageFaceLandmarker() {
  if (imageFaceLandmarker) {
    return imageFaceLandmarker;
  }

  await loadMediaPipe();

  const vision = await FilesetResolver.forVisionTasks(
    "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.35/wasm"
  );

  imageFaceLandmarker =
    await FaceLandmarker.createFromOptions(
      vision,
      {
        baseOptions: {
          modelAssetPath:
            "https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/latest/face_landmarker.task",
        },

        runningMode: "IMAGE",

        numFaces: 1,

        outputFaceBlendshapes: false,
        outputFacialTransformationMatrixes: false,
      }
    );

  return imageFaceLandmarker;
}