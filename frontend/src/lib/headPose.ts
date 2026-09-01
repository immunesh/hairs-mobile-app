import { Landmark3D } from "./landmarkSmoothing";

export interface HeadPose {
  roll: number;       // in radians
  pitch: number;      // in radians
  yaw: number;        // in radians
  headCenter: Landmark3D;
  skullCenter: Landmark3D;
  hairlinePos: Landmark3D;
  faceWidth: number;
  faceHeight: number;
  headWidth: number;
  headHeight: number;
  vRight: Landmark3D; // Unit vector pointing left-to-right (relative to head)
  vUp: Landmark3D;    // Unit vector pointing bottom-to-top (relative to head)
  vBack: Landmark3D;  // Unit vector pointing front-to-back (relative to head)
}

export class HeadPoseEstimator {
  /**
   * Estimates the 3D head pose from the 11 key MediaPipe landmarks.
   */
  public estimate(
    landmarks: Landmark3D[],
    canvasWidth: number,
    canvasHeight: number,
    isMirrored: boolean
  ): HeadPose | null {
    if (!landmarks || landmarks.length < 455) {
      return null;
    }

    // Helper to project landmark to 3D pixel space
    const getPixelPt = (lm: Landmark3D): Landmark3D => {
      const x = isMirrored ? (1.0 - lm.x) * canvasWidth : lm.x * canvasWidth;
      const y = lm.y * canvasHeight;
      const z = lm.z * canvasWidth; // Scale depth same as width
      return { x, y, z };
    };

    // Extract the key 11 landmarks in pixel space
    const p10 = getPixelPt(landmarks[10]);   // Forehead top center / hairline
    const p152 = getPixelPt(landmarks[152]); // Chin bottom
    const p234 = getPixelPt(landmarks[234]); // Left temple
    const p454 = getPixelPt(landmarks[454]); // Right temple
    const p33 = getPixelPt(landmarks[33]);   // Left eye outer
    const p263 = getPixelPt(landmarks[263]); // Right eye outer
    const p127 = getPixelPt(landmarks[127]); // Left ear region outer
    const p356 = getPixelPt(landmarks[356]); // Right ear region outer
    const p151 = getPixelPt(landmarks[151]); // Forehead center

    // Calculate dimensions
    const faceWidth = Math.hypot(p454.x - p234.x, p454.y - p234.y, p454.z - p234.z);
    const faceHeight = Math.hypot(p10.x - p152.x, p10.y - p152.y, p10.z - p152.z);
    
    // Head width uses ear positions if valid, otherwise fallback to faceWidth * 1.15
    const earDist = Math.hypot(p356.x - p127.x, p356.y - p127.y, p356.z - p127.z);
    const headWidth = earDist > faceWidth ? earDist : faceWidth * 1.15;
    const headHeight = faceHeight * 1.25;

    // Head Center (midpoint of temples in horizontal/depth, and midpoint of chin-forehead in vertical)
    const headCenter: Landmark3D = {
      x: (p234.x + p454.x) / 2,
      y: (p10.y + p152.y) / 2,
      z: (p234.z + p454.z) / 2,
    };

    // Compute face coordinate axes in pixel space to find the "backward" vector into the skull
    const rx = p454.x - p234.x;
    const ry = p454.y - p234.y;
    const rz = p454.z - p234.z;
    const rLen = Math.hypot(rx, ry, rz);
    const r = { x: rx / rLen, y: ry / rLen, z: rz / rLen };

    const ux = p10.x - p152.x;
    const uy = p10.y - p152.y;
    const uz = p10.z - p152.z;
    const uLen = Math.hypot(ux, uy, uz);
    const u = { x: ux / uLen, y: uy / uLen, z: uz / uLen };

    // Cross product (right x up) -> points forward (out of face)
    let fx = r.y * u.z - r.z * u.y;
    let fy = r.z * u.x - r.x * u.z;
    let fz = r.x * u.y - r.y * u.x;

    // Normalize forward vector
    const fLen = Math.hypot(fx, fy, fz);
    if (fLen > 0) {
      fx /= fLen;
      fy /= fLen;
      fz /= fLen;
    }

    // Back vector is opposite of forward
    let bx = -fx;
    let by = -fy;
    let bz = -fz;

    // Ensure it points into the screen (Z increases away from camera)
    if (bz < 0) {
      bx = -bx;
      by = -by;
      bz = -bz;
    }

    // Normalize back vector
    const bLen = Math.hypot(bx, by, bz);
    const b = { x: bx / bLen, y: by / bLen, z: bz / bLen };
    const vBack = { x: bx / bLen, y: by / bLen, z: bz / bLen };

    // Skull Center is located deeper in the head (about 45% of face width along the back vector)
    const offsetDepth = faceWidth * 0.45;
    const skullCenter: Landmark3D = {
      x: headCenter.x + b.x * offsetDepth,
      y: headCenter.y + b.y * offsetDepth,
      z: headCenter.z + b.z * offsetDepth,
    };

    // Calculate Roll, Pitch, and Yaw based on unmirrored raw coordinates for stability
    const u10 = landmarks[10];
    const u152 = landmarks[152];
    const u234 = landmarks[234];
    const u454 = landmarks[454];

    const raw_dx = u454.x - u234.x;
    const raw_dy = u454.y - u234.y;
    const raw_dz = u454.z - u234.z;

    const rawRoll = Math.atan2(raw_dy, raw_dx);
    const rawYaw = Math.atan2(raw_dz, raw_dx);

    // Pitch: Looking down is negative pitch (forehead z is smaller than chin z, so u10.z - u152.z < 0)
    // Looking up is positive pitch (forehead z is larger than chin z, so u10.z - u152.z > 0)
    const rawPitch = Math.atan2(u10.z - u152.z, u152.y - u10.y);

    // Adapt angles for screen presentation (negate Roll & Yaw if mirrored)
    const roll = isMirrored ? -rawRoll : rawRoll;
    const yaw = isMirrored ? -rawYaw : rawYaw;
    const pitch = rawPitch;

    return {
      roll,
      pitch,
      yaw,
      headCenter,
      skullCenter,
      hairlinePos: p10,
      faceWidth,
      faceHeight,
      headWidth,
      headHeight,
      vRight: r,
      vUp: u,
      vBack,
    };
  }

  /**
   * Projects a 3D point in pixel space to 2D screen coordinates using perspective projection.
   */
  public project3DPoint(
    point: Landmark3D,
    skullCenter: Landmark3D,
    canvasWidth: number,
    canvasHeight: number
  ): { x: number; y: number; scaleFactor: number } {
    // Virtual focal length in pixels
    const F = Math.max(canvasWidth, canvasHeight) * 1.2;

    // Translate relative to skull center depth
    const relativeZ = point.z - skullCenter.z;

    // Perspective scale factor
    const scaleFactor = F / (F + relativeZ);

    // Project screen coordinates relative to canvas center
    const cx = canvasWidth / 2;
    const cy = canvasHeight / 2;

    const x = (point.x - cx) * scaleFactor + cx;
    const y = (point.y - cy) * scaleFactor + cy;

    return { x, y, scaleFactor };
  }
}
