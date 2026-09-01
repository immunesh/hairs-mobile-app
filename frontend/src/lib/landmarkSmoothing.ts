/**
 * One Euro Filter for adaptive low-pass filtering.
 * High frequency jitter is filtered at low speeds, while lag is minimized at high speeds.
 */
export class OneEuroFilter {
  private minCutoff: number;
  private beta: number;
  private dCutoff: number;

  private xPrev: number | null = null;
  private dxPrev: number = 0;
  private tPrev: number | null = null;

  constructor(minCutoff = 1.0, beta = 0.03, dCutoff = 1.0) {
    this.minCutoff = minCutoff;
    this.beta = beta;
    this.dCutoff = dCutoff;
  }

  public filter(value: number, timestamp: number): number {
    if (this.tPrev === null || this.xPrev === null) {
      this.tPrev = timestamp;
      this.xPrev = value;
      this.dxPrev = 0;
      return value;
    }

    const dt = (timestamp - this.tPrev) / 1000.0; // convert ms to seconds
    if (dt <= 0) {
      // Duplicate frame or timestamp anomaly, return last filtered value
      return this.xPrev;
    }

    // 1. Calculate velocity
    const dx = (value - this.xPrev) / dt;

    // 2. Low-pass filter velocity
    const alphaD = this.calculateAlpha(dt, this.dCutoff);
    const dxFilt = alphaD * dx + (1.0 - alphaD) * this.dxPrev;

    // 3. Compute adaptive cutoff frequency
    const cutoff = this.minCutoff + this.beta * Math.abs(dxFilt);

    // 4. Low-pass filter value
    const alpha = this.calculateAlpha(dt, cutoff);
    const xFilt = alpha * value + (1.0 - alpha) * this.xPrev;

    // Update state
    this.tPrev = timestamp;
    this.xPrev = xFilt;
    this.dxPrev = dxFilt;

    return xFilt;
  }

  public reset(): void {
    this.xPrev = null;
    this.dxPrev = 0;
    this.tPrev = null;
  }

  private calculateAlpha(dt: number, cutoff: number): number {
    const tau = 1.0 / (2.0 * Math.PI * cutoff);
    return 1.0 / (1.0 + tau / dt);
  }
}

export interface Landmark3D {
  x: number;
  y: number;
  z: number;
}

/**
 * Manages OneEuroFilters for an array of 3D landmarks to prevent AR overlay jitter.
 */
export class LandmarkSmoother {
  private filters: Map<number, { x: OneEuroFilter; y: OneEuroFilter; z: OneEuroFilter }> = new Map();
  private minCutoff: number;
  private beta: number;
  private dCutoff: number;

  constructor(minCutoff = 1.0, beta = 0.03, dCutoff = 1.0) {
    this.minCutoff = minCutoff;
    this.beta = beta;
    this.dCutoff = dCutoff;
  }

  /**
   * Smooths a full array of landmarks.
   */
  public smooth(landmarks: Landmark3D[], timestamp: number): Landmark3D[] {
    return landmarks.map((lm, idx) => {
      let filterGroup = this.filters.get(idx);
      if (!filterGroup) {
        filterGroup = {
          x: new OneEuroFilter(this.minCutoff, this.beta, this.dCutoff),
          y: new OneEuroFilter(this.minCutoff, this.beta, this.dCutoff),
          z: new OneEuroFilter(this.minCutoff, this.beta, this.dCutoff),
        };
        this.filters.set(idx, filterGroup);
      }

      return {
        x: filterGroup.x.filter(lm.x, timestamp),
        y: filterGroup.y.filter(lm.y, timestamp),
        z: filterGroup.z.filter(lm.z, timestamp),
      };
    });
  }

  /**
   * Resets all filters (call this when tracking is lost or camera restarts).
   */
  public reset(): void {
    this.filters.forEach(group => {
      group.x.reset();
      group.y.reset();
      group.z.reset();
    });
  }
}
