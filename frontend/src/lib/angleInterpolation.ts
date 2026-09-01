export interface AngleBlend {
  angleA: string;
  opacityA: number;
  angleB: string;
  opacityB: number;
}

// Widest arc between two neighbouring assets that is still worth cross-fading across.
// A typical asset set is [0, 45, 315], which leaves the 270 degree arc from 45 round to
// 315 completely uncovered - two photos that show opposite sides of the head. Blending
// across a hole that wide produces a double image, not a transition, so anything wider
// than this holds the nearer asset instead.
const MAX_BLEND_ARC_DEG = 90;

/**
 * Computes the two closest angles and their opacities for cross-fading wig assets.
 * 
 * @param yawRad Head yaw rotation in radians.
 * @param availableAngles List of available angles as string keys (e.g. ["0", "45", "90"])
 */
export function getAngleBlend(yawRad: number, availableAngles: string[]): AngleBlend {
  // Graceful fallbacks
  if (!availableAngles || availableAngles.length === 0) {
    return { angleA: "0", opacityA: 1, angleB: "0", opacityB: 0 };
  }
  if (availableAngles.length === 1) {
    return { angleA: availableAngles[0], opacityA: 1, angleB: availableAngles[0], opacityB: 0 };
  }

  // Convert yaw to degrees and normalize to [0, 360)
  let yawDeg = (yawRad * 180) / Math.PI;
  yawDeg = ((yawDeg % 360) + 360) % 360;

  // Parse angles as numbers and sort them ascending
  const anglesNum = availableAngles.map(Number).sort((a, b) => a - b);

  let lowerIdx = -1;
  let upperIdx = -1;

  // Find the bracket indices
  for (let i = 0; i < anglesNum.length; i++) {
    const current = anglesNum[i];
    const next = anglesNum[(i + 1) % anglesNum.length];

    if (next > current) {
      if (yawDeg >= current && yawDeg <= next) {
        lowerIdx = i;
        upperIdx = (i + 1) % anglesNum.length;
        break;
      }
    } else {
      // Wrap around case (e.g., current is 315, next is 0)
      if (yawDeg >= current || yawDeg <= next) {
        lowerIdx = i;
        upperIdx = (i + 1) % anglesNum.length;
        break;
      }
    }
  }

  // Fallback if bracket not found
  if (lowerIdx === -1 || upperIdx === -1) {
    const sortedStr = String(anglesNum[0]);
    return { angleA: sortedStr, opacityA: 1, angleB: sortedStr, opacityB: 0 };
  }

  const angleValA = anglesNum[lowerIdx];
  const angleValB = anglesNum[upperIdx];

  // If the bracketing pair spans an uncovered arc, hold the nearer asset rather than
  // interpolating. Without this, turning past the last real asset starts fading the
  // OPPOSITE side's photo in (with [0, 45, 315], yaw 90 draws 17% of the 315 asset on
  // top of the 45 one), which reads as the wig smearing sideways as the head turns.
  const arcSpan = ((angleValB - angleValA) % 360 + 360) % 360;

  if (arcSpan > MAX_BLEND_ARC_DEG) {
    const gapA = Math.abs(yawDeg - angleValA);
    const gapB = Math.abs(yawDeg - angleValB);
    const distA = Math.min(gapA, 360 - gapA);
    const distB = Math.min(gapB, 360 - gapB);
    const nearest = String(distA <= distB ? angleValA : angleValB);
    return { angleA: nearest, opacityA: 1, angleB: nearest, opacityB: 0 };
  }

  // Calculate interpolation factor t
  let t = 0;
  if (angleValB > angleValA) {
    t = (yawDeg - angleValA) / (angleValB - angleValA);
  } else {
    // Wrap-around interpolation (e.g., between 315 and 0)
    const normalizedB = angleValB + 360;
    const normalizedYaw = yawDeg < angleValA ? yawDeg + 360 : yawDeg;
    t = (normalizedYaw - angleValA) / (normalizedB - angleValA);
  }

  // Clamp t to [0, 1] to prevent floating point issues
  t = Math.max(0, Math.min(1, t));

  return {
    angleA: String(angleValA),
    opacityA: 1.0 - t,
    angleB: String(angleValB),
    opacityB: t,
  };
}
