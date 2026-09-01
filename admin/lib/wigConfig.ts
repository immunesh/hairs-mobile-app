// NOTE ON UNITS: scale, hairlineRatio and centerXRatio are all fractions of the
// wig's HAIR SILHOUETTE (its opaque bounding box, measured at load time by
// lib/wigSilhouette.ts), never of the source PNG's frame. Asset crops vary from
// ~2% margin to ~30%, so frame-relative values silently meant something
// different on every image - that is what rendered wigs oversized and low
// enough to cover the wearer's eyes. Silhouette-relative values transfer
// between assets, so an arbitrary admin upload needs no per-product tuning.
export interface WigConfig {
  scale: number;             // Silhouette width as a multiple of head width (normally ~1.0 to 1.2)
  offsetX: number;           // Horizontal offset as a fraction of head width (normally 0)
  offsetY: number;           // Vertical offset as a fraction of head height (normally ~ -0.15)
  rotationOffset: number;    // Additional rotation roll offset in radians (normally 0)
  foreheadOffset: number;    // Depth offset relative to faceWidth (how deep the wig is in the head, normally ~0.1)
  pitchScaleMultiplier?: number; // How much pitch changes the wig height (normally ~0.3)
  yawScaleMultiplier?: number;   // How much yaw scales down the width due to projection (normally ~0.15)
  // How far down the hair silhouette the anchor point should land, as a fraction
  // of silhouette height. Transparent padding is already divided out, so this is
  // purely about where on the hair the skull anchor belongs - tuned by eye
  // against a live camera. Raise it to lift the wig up the head, lower it to
  // drop the wig down.
  hairlineRatio?: number;
  // Horizontal counterpart to hairlineRatio: how far across the hair silhouette
  // the anchor point should land, as a fraction of silhouette width. Normally
  // 0.5, and now genuinely so - off-centre source crops are already normalized
  // out, so this only needs to move for a wig whose crown really does sit off
  // the centre of its own hair mass (a turned view, say). This is a pure 2D
  // draw-space offset applied after the 3D pose projection - unlike offsetX,
  // it must NOT be used to compensate for off-center source photos via the
  // 3D anchor (offsetX travels through vRight, which gains a real depth/z
  // component once the head is actually turned, so perturbing it destabilizes
  // the perspective-scale projection at real turn angles even though it looks
  // fine near yaw=0).
  centerXRatio?: number;
  // Where the wig's fringe should land, in face-heights below the wearer's
  // hairline landmark. 0 sits the fringe exactly on the hairline; small positive
  // values let it fall naturally onto the top of the forehead.
  //
  // When set (the default), the renderer DERIVES hairlineRatio per asset from
  // the fringe position it measures in that asset's alpha channel, so every wig
  // lands on the hairline regardless of how much hair hangs below it. That
  // matters because the fringe depth varies enormously between wigs - measured
  // across this catalogue: curly 0.68, layered men's 0.61, bob 0.51 - which is
  // why a single hairlineRatio could fit one wig and drop another over the
  // wearer's eyes. hairlineRatio is used only as the fallback for an asset whose
  // fringe cannot be measured.
  fringeDrop?: number;
  // Per-angle tuning, keyed by the same angle string used for the ProductImage's
  // `angle` field (e.g. "315"). Side/turned-view photos rarely share the exact
  // same crop/centering as the front photo, so their hair mass can sit off-center
  // within the frame - these let a single angle override scale/hairlineRatio/
  // centerXRatio without needing every angle image to be pixel-aligned to the
  // front shot. Prefer centerXRatio over offsetX for this - see its doc above.
  angleOverrides?: Record<string, Partial<Omit<WigConfig, "angleOverrides">>>;
}

// Tuned against the anchor geometry rather than against one asset's numbers.
//
// HeadPoseEstimator places the anchor at a fixed, derivable point: with
// offsetY -0.48 and headHeight = 1.25 * faceHeight,
//   anchor.y = headCenter.y - 0.48*headHeight = p10.y - 0.10*faceHeight
// i.e. exactly one tenth of a face-height above the hairline landmark (p10).
// Everything below is measured from there, in face-heights:
//   crown of the wig  ~0.20 above the anchor  (just clear of the skull)
//   longest strands   ~0.65 below it          (about ear-lobe level)
// which puts the anchor 0.20/0.85 ~ 0.20 of the way down the silhouette, and
// needs a silhouette a little wider than ear-to-ear to cover the temples.
//
// An earlier attempt converted the wig7 tuning (scale 1.35 / hairlineRatio 0.65
// in the old frame-relative units) directly into silhouette units. That asset is
// a men's front hair *patch*, not a full wig - its hair mass sits far higher
// relative to the same anchor - so the converted 0.65 lifted full wigs clean off
// the head. Deriving from the anchor instead makes the numbers transfer.
export const DEFAULT_WIG_CONFIG: WigConfig = {
  scale: 1.35,
  offsetX: 0.0,
  offsetY: -0.48, // Anchored slightly above forehead center (hairline region)
  rotationOffset: 0.0,
  // How deep into the skull the wig is anchored, along vBack. This is what makes
  // the wig sit ON the head rather than hover in front of the face: the anchor is
  // a real 3D point built from the head's own basis vectors, so a deep anchor
  // ORBITS with the skull as the head turns, while a shallow one slides across
  // the face. Raised from 0.1, which read as the wig being pushed forwards.
  // Costs about 1.5% of rendered size via perspectiveScale, no more.
  foreheadOffset: 0.22,
  pitchScaleMultiplier: 0.2,
  yawScaleMultiplier: 0.1,
  // scale and hairlineRatio must move together, and the quantity to hold fixed
  // is the fringe, not the crown:
  //   distance from anchor down to the fringe = (1 - hairlineRatio) * scale * k
  // so (1 - hairlineRatio) * scale is what has to stay constant when resizing.
  // The fit confirmed as correctly positioned was scale 1.20 / ratio 0.20, i.e.
  // a constant of 0.96, so at scale 1.35 the ratio must be 1 - 0.96/1.35 = 0.289
  // and the extra size grows upwards off a fixed fringe. Anchoring the crown
  // instead (ratio 0.166) sends the whole height increase downwards and puts the
  // wig over the wearer's eyes. Scale was taken 1.45 -> 1.35 on the same rule.
  // Fringe lands just onto the top of the forehead. hairlineRatio below is only
  // the fallback for an asset whose fringe cannot be measured.
  fringeDrop: 0.03,
  hairlineRatio: 0.289,
};

// Per-slug overrides for wigs whose crown genuinely sits off the centre of their
// own hair mass. Since scale/hairlineRatio/centerXRatio are now silhouette-
// relative, differently-cropped assets no longer need an entry here - only real
// geometry does. Note these keys match seed.ts products; anything created through
// the admin panel gets DEFAULT_WIG_CONFIG, which is the intended path.
const WIG_CONFIGS: Record<string, WigConfig> = {
  // Full Head Hair Wig for Man. A front hair patch rather than a full wig: it
  // covers the top of the head only, so its hair sits higher against the same
  // anchor and it needs a larger hairlineRatio (and less width) than a wig that
  // wraps past the ears. 0.65/1.08 are this asset's live-tuned frame-relative
  // values (0.65 / 1.35) converted through its measured alpha padding.
  "full-head-hair-wig-for-man-black-breathable-front-hair-patch": {
    ...DEFAULT_WIG_CONFIG,
    scale: 1.08,
    hairlineRatio: 0.65,
    foreheadOffset: 0.08,
    pitchScaleMultiplier: 0.15,
    yawScaleMultiplier: 0.08,
    angleOverrides: {
      // centerXRatio is measured from the crown/parting point (the top ~3% of
      // the hair silhouette), NOT the overall hair-mass centroid - the centroid
      // is skewed by how far the longer side-strands hang down on one side
      // (confirmed live: using it for "45" put the wig visibly too far left).
      //
      // The old frame-relative values were 0.523 and 0.409; converted with each
      // asset's measured side padding they become the numbers below. "315"
      // landing on ~0.5 shows that override was only ever correcting a crop
      // difference, which the silhouette normalization now handles by itself.
      "315": {
        centerXRatio: 0.506,
      },
      // "men right view.png": crown really does sit left of its own hair mass.
      "45": {
        centerXRatio: 0.368,
      },
    },
  },
  // AHS Bob Hair Wig for Women. Both of its old centerXRatio overrides (0.528
  // and 0.490) convert to ~0.5, i.e. they were pure crop compensation, so the
  // angles need no override at all any more.
  "ahs-bob-hair-wig-for-women-full-head-synthetic-straight-bob-wig": {
    ...DEFAULT_WIG_CONFIG,
  },
};

/**
 * Retrieves the custom configuration for a wig based on its slug or ID, falling back to defaults.
 */
export function getWigConfig(productIdOrSlug?: string): WigConfig {
  if (!productIdOrSlug) {
    return DEFAULT_WIG_CONFIG;
  }

  // Check by slug/id direct match
  if (WIG_CONFIGS[productIdOrSlug]) {
    return WIG_CONFIGS[productIdOrSlug];
  }

  // Try to find a partial match (e.g. if the ID or name is passed and contains slug terms)
  const normalizedKey = productIdOrSlug.toLowerCase();
  for (const [key, config] of Object.entries(WIG_CONFIGS)) {
    if (normalizedKey.includes(key) || key.includes(normalizedKey)) {
      return config;
    }
  }

  return DEFAULT_WIG_CONFIG;
}
