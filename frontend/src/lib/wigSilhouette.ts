/**
 * Measures where the actual hair sits inside a wig PNG.
 *
 * Wig assets are transparent cut-outs, but how tightly they are cropped varies
 * wildly between sources: the original seeded assets carry 10-30% empty margin
 * around the hair, while the cut-outs uploaded through the admin panel are
 * trimmed to within ~2% of the silhouette. `scale`, `hairlineRatio` and
 * `centerXRatio` in WigConfig used to be expressed as fractions of the image
 * *frame*, so the same numbers produced a completely different result on each -
 * a wig tuned against a padded asset renders far too large and far too low when
 * pointed at a trimmed one, which is what put the wig over the wearer's eyes.
 *
 * Measuring the opaque bounding box lets the renderer scale and anchor against
 * the hair itself, so those config values mean the same thing on any asset and
 * an arbitrary admin upload lands correctly without per-product tuning.
 */
export interface SilhouetteBox {
  /** Left edge of the hair, as a fraction of image width. */
  x: number;
  /** Top edge of the hair, as a fraction of image height. */
  y: number;
  /** Hair width, as a fraction of image width. */
  width: number;
  /** Hair height, as a fraction of image height. */
  height: number;
  /**
   * How far down the silhouette the centre fringe ends, as a fraction of
   * silhouette height - i.e. where the hair stops and the wearer's face shows
   * through. This is NOT the bottom of the image: side strands hang well below
   * the fringe, and by wildly differing amounts (measured across the catalogue:
   * a curly wig 0.68, a layered men's wig 0.61, a bob 0.51). Anchoring on the
   * silhouette bottom therefore drops the fringe onto the forehead of some wigs
   * and lifts it off the head on others; anchoring on this puts every wig's
   * fringe at the wearer's hairline. 0 when it cannot be measured.
   */
  fringe: number;
  /**
   * Width of the head-covering cap, as a fraction of the full silhouette width,
   * measured across the fringe row (temple / ear height).
   *
   * For a short wig the widest point of the silhouette IS the cap, so this is
   * ~1.0. For a long wig the widest point is the hair hanging at shoulder level,
   * about twice the cap - measured across this catalogue, 0.53 to 0.62. Sizing
   * the full silhouette to the head therefore shrinks a long wig's cap to well
   * under head width and leaves it draped over the face instead of fitting the
   * skull, which is why the renderer scales by cap width instead.
   */
  capWidth: number;
}

const FULL_FRAME: SilhouetteBox = {
  x: 0,
  y: 0,
  width: 1,
  height: 1,
  fringe: 0,
  capWidth: 1,
};

// The bounding box only needs to be accurate to about a percent, so the image is
// measured at thumbnail size - a full 1536px scan per asset would cost far more
// than it buys.
const SAMPLE_SIZE = 128;

// Downscaling averages the alpha of wispy fringe strands down towards zero, so
// the cut-off has to stay low or the outermost hair gets trimmed off the box.
const ALPHA_THRESHOLD = 10;

const cache = new WeakMap<HTMLImageElement, SilhouetteBox>();

/**
 * Returns the hair's bounding box within `image`, normalized to [0, 1].
 *
 * Falls back to the full frame - i.e. the old behaviour - for an image that is
 * not loaded yet, is fully transparent, or cannot be read back (a cross-origin
 * asset served without CORS headers taints the canvas and makes getImageData
 * throw). Results are cached per image element; measuring is done once.
 */
export function getSilhouetteBox(image: HTMLImageElement): SilhouetteBox {
  const cached = cache.get(image);
  if (cached) return cached;

  if (!image.complete || !image.naturalWidth || !image.naturalHeight) {
    return FULL_FRAME;
  }

  const box = measure(image);
  cache.set(image, box);
  return box;
}

function measure(image: HTMLImageElement): SilhouetteBox {
  const aspect = image.naturalHeight / image.naturalWidth;
  const width = Math.max(1, Math.round(aspect >= 1 ? SAMPLE_SIZE / aspect : SAMPLE_SIZE));
  const height = Math.max(1, Math.round(aspect >= 1 ? SAMPLE_SIZE : SAMPLE_SIZE * aspect));

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;

  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  if (!ctx) return FULL_FRAME;

  ctx.drawImage(image, 0, 0, width, height);

  let pixels: Uint8ClampedArray;
  try {
    pixels = ctx.getImageData(0, 0, width, height).data;
  } catch {
    // Tainted canvas - the asset is cross-origin without CORS headers.
    return FULL_FRAME;
  }

  let minX = width;
  let minY = height;
  let maxX = -1;
  let maxY = -1;

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      if (pixels[(y * width + x) * 4 + 3] <= ALPHA_THRESHOLD) continue;

      if (x < minX) minX = x;
      if (x > maxX) maxX = x;
      if (y < minY) minY = y;
      if (y > maxY) maxY = y;
    }
  }

  if (maxX < 0 || maxY < 0) return FULL_FRAME;

  const boxHeight = maxY + 1 - minY;

  const fringe = measureFringe(pixels, width, minX, maxX, minY, maxY);

  return {
    x: minX / width,
    y: minY / height,
    width: (maxX + 1 - minX) / width,
    height: boxHeight / height,
    fringe,
    capWidth: measureCapWidth(
      pixels,
      width,
      minX,
      maxX,
      minY,
      maxY,
      fringe
    ),
  };
}

/**
 * Width of the silhouette across the fringe row - the level where the wig sits
 * on the temples - as a fraction of the full silhouette width.
 */
function measureCapWidth(
  pixels: Uint8ClampedArray,
  width: number,
  minX: number,
  maxX: number,
  minY: number,
  maxY: number,
  fringe: number
): number {
  const boxWidth = maxX + 1 - minX;
  const boxHeight = maxY + 1 - minY;
  if (boxWidth < 4 || boxHeight < 4 || fringe <= 0) return 1;

  const fringeY = minY + Math.round(fringe * boxHeight);
  const halfBand = Math.max(1, Math.round(boxHeight * 0.05));

  let capMin = maxX + 1;
  let capMax = minX - 1;

  for (
    let y = Math.max(minY, fringeY - halfBand);
    y <= Math.min(maxY, fringeY + halfBand);
    y++
  ) {
    for (let x = minX; x <= maxX; x++) {
      if (pixels[(y * width + x) * 4 + 3] <= ALPHA_THRESHOLD) continue;
      if (x < capMin) capMin = x;
      if (x > capMax) capMax = x;
    }
  }

  if (capMax < capMin) return 1;

  return (capMax + 1 - capMin) / boxWidth;
}

/**
 * Finds where the hair stops down the middle of the wig. Scans a narrow band of
 * columns either side of centre, walks each one down from the crown, and takes
 * the last opaque row before a sustained transparent run - the gap the face
 * shows through. The median across the band shrugs off stray strands.
 */
function measureFringe(
  pixels: Uint8ClampedArray,
  width: number,
  minX: number,
  maxX: number,
  minY: number,
  maxY: number
): number {
  const boxWidth = maxX + 1 - minX;
  const boxHeight = maxY + 1 - minY;
  if (boxWidth < 4 || boxHeight < 4) return 0;

  const band = Math.max(1, Math.round(boxWidth * 0.06));
  const centre = Math.round((minX + maxX) / 2);
  const gap = Math.max(2, Math.round(boxHeight * 0.03));

  const ends: number[] = [];

  for (let x = centre - band; x <= centre + band; x++) {
    if (x < minX || x > maxX) continue;

    let lastOpaque = -1;
    let transparentRun = 0;

    for (let y = minY; y <= maxY; y++) {
      const opaque = pixels[(y * width + x) * 4 + 3] > ALPHA_THRESHOLD;

      if (opaque) {
        lastOpaque = y;
        transparentRun = 0;
      } else if (lastOpaque >= 0) {
        transparentRun++;
        // A sustained gap below the hair means we have found the face opening.
        if (transparentRun >= gap) break;
      }
    }

    if (lastOpaque >= 0) ends.push((lastOpaque - minY) / boxHeight);
  }

  if (!ends.length) return 0;
  ends.sort((a, b) => a - b);
  return ends[Math.floor(ends.length / 2)];
}
