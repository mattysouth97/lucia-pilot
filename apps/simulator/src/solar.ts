/**
 * Solar generation model for the Lucia simulator (FR-D-001).
 *
 * Models output as a normal distribution centered at 12:00 KST (UTC+9),
 * sigma = 3 hours, peak = installedKw, with a configurable noise ratio.
 * Returns 0 outside the sunrise (06:00) – sunset (19:00) KST window.
 */

const KST_OFFSET_HOURS = 9;
const PEAK_HOUR_KST = 12;
const SIGMA_HOURS = 3;
const SUNRISE_KST = 6;
const SUNSET_KST = 19;

/**
 * Gaussian PDF normalised so that the peak value equals 1.
 */
function gaussian(x: number, mu: number, sigma: number): number {
  return Math.exp(-0.5 * ((x - mu) / sigma) ** 2);
}

/**
 * Returns the estimated kWh output for a single reporting interval
 * (typically 1 minute = 1/60 hour) at the given timestamp.
 *
 * @param ts            Timestamp of the generation tick.
 * @param installedKw   Nameplate installed capacity in kW.
 * @param noiseRatio    Fraction of random noise added to the output (default 0.1 = ±10%).
 *                      Set to 0 for deterministic/demo mode.
 * @returns             Estimated kWh for the tick interval (≥ 0).
 */
export function solarKwhAt(ts: Date, installedKw: number, noiseRatio = 0.1): number {
  // Convert UTC timestamp to KST fractional hour
  const utcHour = ts.getUTCHours() + ts.getUTCMinutes() / 60 + ts.getUTCSeconds() / 3600;
  const kstHour = (utcHour + KST_OFFSET_HOURS) % 24;

  // Zero output outside daylight window
  if (kstHour < SUNRISE_KST || kstHour >= SUNSET_KST) {
    return 0;
  }

  // Peak kWh per interval: assume each tick represents 1 minute = 1/60 hour
  const intervalHours = 1 / 60;
  const peakKwh = installedKw * intervalHours;

  // Gaussian envelope — value of 1.0 at solar noon, falls off toward sunrise/sunset
  const envelope = gaussian(kstHour, PEAK_HOUR_KST, SIGMA_HOURS);

  // Optional noise: uniform random in [-noiseRatio, +noiseRatio]
  const noise = noiseRatio > 0 ? 1 + (Math.random() * 2 - 1) * noiseRatio : 1;

  return Math.max(0, peakKwh * envelope * noise);
}
