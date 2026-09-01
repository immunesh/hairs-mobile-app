import {
  FilesetResolver,
  FaceLandmarker,
} from "@mediapipe/tasks-vision";

let videoFaceLandmarker: FaceLandmarker | null = null;
let imageFaceLandmarker: FaceLandmarker | null = null;

/* ---------------- VIDEO MODE ---------------- */
/* Used for live camera */

export async function getFaceLandmarker() {
  if (videoFaceLandmarker) {
    return videoFaceLandmarker;
  }

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