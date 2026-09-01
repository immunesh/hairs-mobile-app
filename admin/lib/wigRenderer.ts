import { HeadPose } from "./headPose";
import { WigConfig } from "./wigConfig";
import { getAngleBlend } from "./angleInterpolation";
import { getSilhouetteBox } from "./wigSilhouette";

function resolveAngleConfig(config: WigConfig, angleKey: string): WigConfig {
  const override = config.angleOverrides?.[angleKey];
  return override ? { ...config, ...override } : config;
}

export interface WigRenderOptions {
  scale?: number;
  xOffset?: number;
  yOffset?: number;
}

/**
 * Advanced perspective-aware 3D skull-anchored wig rendering.
 * Animates roll, pitch, yaw, and handles dual-angle cross-fading for smooth transitions.
 */
export function drawWigPose(
  ctx: CanvasRenderingContext2D,
  wigImages: Record<string, HTMLImageElement>,
  pose: HeadPose,
  config: WigConfig,
  canvasWidth: number,
  canvasHeight: number,
  // When true, overlays the live pose numbers and the projected anchor of every drawn
  // asset. The angle keys are screen-space yaw, but which SIGN of yaw corresponds to
  // which direction of turn depends on MediaPipe's runtime z convention, which cannot
  // be settled by reading the code - turn your head and read the HUD. Enabled with
  // ?debug=1 on the try-on page.
  debug: boolean = false
): void {
  // 1. Get all loaded available angles
  const availableAngles = Object.keys(wigImages).filter(
    (key) => wigImages[key] && wigImages[key].complete
  );

  if (availableAngles.length === 0) {
    return;
  }

  // 2. Compute blending angles based on current head yaw
  const blend = getAngleBlend(pose.yaw, availableAngles);

  const F = Math.max(canvasWidth, canvasHeight) * 1.2;
  const cx = canvasWidth / 2;
  const cy = canvasHeight / 2;

  // Draw helper with custom alpha blending. Each angle resolves its own merged
  // config (see WigConfig.angleOverrides) so a turned-view photo whose hair mass
  // isn't framed identically to the front photo can still anchor to the head
  // correctly instead of inheriting the front image's offsets verbatim.
  const drawnAnchors: { x: number; y: number; label: string }[] = [];

  const drawWigAsset = (img: HTMLImageElement, opacity: number, angleKey: string) => {
    if (opacity <= 0.005) return;

    const cfg = resolveAngleConfig(config, angleKey);

    // 3. Compute target 3D anchor position relative to the skull center
    // Offsets are scaled dynamically by the head's physical dimensions (width/height)
    const anchor3D = {
      x:
        pose.skullCenter.x +
        pose.vRight.x * (cfg.offsetX * pose.headWidth) +
        pose.vUp.x * (-cfg.offsetY * pose.headHeight) +
        pose.vBack.x * (cfg.foreheadOffset * pose.faceWidth),
      y:
        pose.skullCenter.y +
        pose.vRight.y * (cfg.offsetX * pose.headWidth) +
        pose.vUp.y * (-cfg.offsetY * pose.headHeight) +
        pose.vBack.y * (cfg.foreheadOffset * pose.faceWidth),
      z:
        pose.skullCenter.z +
        pose.vRight.z * (cfg.offsetX * pose.headWidth) +
        pose.vUp.z * (-cfg.offsetY * pose.headHeight) +
        pose.vBack.z * (cfg.foreheadOffset * pose.faceWidth),
    };

    // Everything below sizes and anchors against the hair itself rather than the
    // image frame. Assets differ enormously in how tightly they are cropped (the
    // seeded PNGs carry 10-30% empty margin, admin-uploaded cut-outs about 2%),
    // so frame-relative numbers meant something different on every asset and a
    // wig tuned on one sat over the wearer's eyes on another.
    const box = getSilhouetteBox(img);

    // 4. Perspective projection calculation
    const relativeZ = anchor3D.z - pose.skullCenter.z;
    const perspectiveScale = F / (F + relativeZ);

    // 5. Dynamic scale adjustments for pitch and yaw projection compression
    const pitchScaleMult = cfg.pitchScaleMultiplier ?? 0.2;
    const yawScaleMult = cfg.yawScaleMultiplier ?? 0.1;

    // As the user tilts their head, the projected height changes
    const pitchFactor = 1.0 + Math.abs(pose.pitch) * pitchScaleMult;
    // As the user turns side profile, horizontal width compresses
    const yawFactor = 1.0 - Math.abs(pose.yaw) * yawScaleMult;

    const sourceX = box.x * img.naturalWidth;
    const sourceY = box.y * img.naturalHeight;
    const sourceWidth = box.width * img.naturalWidth;
    const sourceHeight = box.height * img.naturalHeight;

    // scale sizes the wig's CAP - the head-covering part - to the wearer's head,
    // not the full silhouette. On a short wig those are the same thing, but a
    // long wig is roughly twice as wide at shoulder level as it is across the
    // temples, so sizing the silhouette would shrink its cap to about 0.74 of
    // head width and leave it hanging over the face instead of fitting the
    // skull. Dividing by capWidth keeps the cap on the head and lets the length
    // fall wherever the wig's own proportions put it.
    const capWidth = Math.max(0.3, Math.min(1, box.capWidth));

    const baseWigWidth = (pose.headWidth * cfg.scale) / capWidth;
    const finalWigWidth = baseWigWidth * perspectiveScale * yawFactor;

    // Project 3D anchor point to screen 2D coordinates
    const screenX = (anchor3D.x - cx) * perspectiveScale + cx;
    const screenY = (anchor3D.y - cy) * perspectiveScale + cy;

    const aspect = sourceHeight / sourceWidth;
    const finalWigHeight = finalWigWidth * aspect * pitchFactor;

    ctx.save();

    // Translate to projected skull center
    ctx.translate(screenX, screenY);

    // Rotate canvas around anchor point by Roll + Offset
    ctx.rotate(pose.roll + cfg.rotationOffset);

    // Vertical anchoring. Derived per asset from where its own fringe sits,
    // rather than from a shared constant - see WigConfig.fringeDrop.
    //
    // The anchor's height is fixed by the pose: with headHeight = 1.25 *
    // faceHeight, offsetY puts it (-offsetY * 1.25 - 0.5) face-heights above the
    // hairline landmark p10. Putting the fringe a chosen distance below p10 is
    // then solved directly:
    //   fringe_y = anchor_y + (fringe - r) * H  =  p10 + fringeDrop * faceHeight
    //   => r = fringe - (fringeDrop + anchorAboveHairline) * faceHeight / H
    const anchorAboveHairline = -cfg.offsetY * 1.25 - 0.5;
    const fringeDrop = cfg.fringeDrop ?? 0.03;

    const derivedRatio =
      box.fringe > 0 && finalWigHeight > 0
        ? box.fringe -
          ((fringeDrop + anchorAboveHairline) * pose.faceHeight) /
            finalWigHeight
        : (cfg.hairlineRatio ?? 0.289);

    // Clamped so a bad measurement can never fling the wig off the head.
    const hairlineRatio = Math.max(0, Math.min(0.95, derivedRatio));

    const verticalAlignOffset = finalWigHeight * hairlineRatio;
    // Horizontal counterpart - see WigConfig.centerXRatio. Pure local draw-space
    // shift, computed independently of the 3D pose so it can't destabilize the
    // perspective projection the way perturbing offsetX/vRight would.
    const horizontalAlignOffset = finalWigWidth * (cfg.centerXRatio ?? 0.5);

    ctx.globalAlpha = opacity;
    ctx.drawImage(
      img,
      sourceX,
      sourceY,
      sourceWidth,
      sourceHeight,
      -horizontalAlignOffset,
      -verticalAlignOffset,
      finalWigWidth,
      finalWigHeight
    );

    ctx.restore();

    if (debug) {
      drawnAnchors.push({
        x: screenX,
        y: screenY,
        label: `${angleKey} @ ${opacity.toFixed(2)}  w=${Math.round(finalWigWidth)}`,
      });
    }
  };

  // Render both neighboring angles for cross-fade blending
  const imgA = wigImages[blend.angleA];
  const imgB = wigImages[blend.angleB];

  if (imgA) drawWigAsset(imgA, blend.opacityA, blend.angleA);
  if (imgB) drawWigAsset(imgB, blend.opacityB, blend.angleB);

  // Restore opacity state
  ctx.globalAlpha = 1.0;

  if (debug) {
    drawPoseDebug(ctx, pose, blend, availableAngles, drawnAnchors, canvasWidth);
  }
}

const DEG = 180 / Math.PI;

/**
 * Diagnostic overlay for tuning wigConfig. Shows the pose the renderer is actually
 * working from, which asset(s) the yaw selected, and where each one got anchored, so
 * the sign of yaw and the accuracy of centerXRatio/hairlineRatio can be read off the
 * screen instead of inferred.
 */
function drawPoseDebug(
  ctx: CanvasRenderingContext2D,
  pose: HeadPose,
  blend: { angleA: string; opacityA: number; angleB: string; opacityB: number },
  availableAngles: string[],
  anchors: { x: number; y: number; label: string }[],
  canvasWidth: number
): void {
  ctx.save();
  ctx.globalAlpha = 1;

  // Crosshair + label on every anchor the renderer used this frame.
  for (const a of anchors) {
    ctx.strokeStyle = "#00ff88";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(a.x - 18, a.y);
    ctx.lineTo(a.x + 18, a.y);
    ctx.moveTo(a.x, a.y - 18);
    ctx.lineTo(a.x, a.y + 18);
    ctx.stroke();

    ctx.font = "600 15px monospace";
    ctx.fillStyle = "#00ff88";
    ctx.fillText(a.label, a.x + 22, a.y - 4);
  }

  // Hairline landmark (10) for reference - the anchor should sit above it.
  ctx.fillStyle = "#ff3b6b";
  ctx.beginPath();
  ctx.arc(pose.hairlinePos.x, pose.hairlinePos.y, 5, 0, Math.PI * 2);
  ctx.fill();

  const lines = [
    `yaw   ${(pose.yaw * DEG).toFixed(1)}deg   <- turn head, note the sign`,
    `pitch ${(pose.pitch * DEG).toFixed(1)}deg`,
    `roll  ${(pose.roll * DEG).toFixed(1)}deg`,
    `assets [${availableAngles.join(", ")}]`,
    `blend  A=${blend.angleA} (${blend.opacityA.toFixed(2)})  B=${blend.angleB} (${blend.opacityB.toFixed(2)})`,
    `headW ${Math.round(pose.headWidth)}  faceW ${Math.round(pose.faceWidth)}`,
  ];

  ctx.font = "600 17px monospace";
  const boxW = Math.min(canvasWidth - 20, 430);
  ctx.fillStyle = "rgba(0, 0, 0, 0.62)";
  ctx.fillRect(10, 10, boxW, 24 * lines.length + 14);
  ctx.fillStyle = "#ffffff";
  lines.forEach((line, i) => ctx.fillText(line, 20, 34 + i * 24));

  ctx.restore();
}

/**
 * Legacy drawWig compatibility wrapper for standard 2D drawing.
 */
export function drawWig(
  ctx: CanvasRenderingContext2D,
  wigImage: HTMLImageElement,
  headX: number,
  headY: number,
  faceWidth: number,
  faceHeight: number,
  angle: number,
  options: WigRenderOptions = {}
): void {
  if (!wigImage.complete) return;

  const scale = options.scale ?? 1.75;
  const xOffset = options.xOffset ?? 0;
  const yOffset = options.yOffset ?? 0;

  const aspect = wigImage.height / wigImage.width;
  const wigWidth = faceWidth * scale;
  const wigHeight = wigWidth * aspect;

  const angleFactor = Math.abs(angle) * 0.05;
  const anchorX = headX + xOffset;
  const anchorY = headY - wigHeight * (0.24 + angleFactor) + yOffset;

  ctx.save();
  ctx.translate(anchorX, anchorY + wigHeight * 0.12);
  ctx.rotate(angle);
  ctx.drawImage(
    wigImage,
    -wigWidth / 2,
    -wigHeight * 0.1,
    wigWidth,
    wigHeight
  );
  ctx.restore();
}