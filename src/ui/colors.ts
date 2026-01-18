import chalk from 'chalk';

/**
 * Color gradient utilities for smooth visual transitions in the statusline.
 * Uses RGB interpolation between color stops based on time remaining.
 */

// RGB color stops for gradient: green -> yellow -> orange -> red -> dark red
interface ColorStop {
  percent: number; // 0.0 to 1.0 (percent remaining)
  r: number;
  g: number;
  b: number;
}

const GRADIENT_STOPS: ColorStop[] = [
  { percent: 1.0, r: 0, g: 200, b: 0 },      // Green - fresh
  { percent: 0.75, r: 150, g: 200, b: 0 },   // Yellow-green
  { percent: 0.50, r: 255, g: 200, b: 0 },   // Yellow
  { percent: 0.25, r: 255, g: 140, b: 0 },   // Orange
  { percent: 0.10, r: 255, g: 60, b: 0 },    // Red-orange
  { percent: 0.0, r: 200, g: 0, b: 0 },      // Red - critical
  { percent: -0.25, r: 139, g: 0, b: 0 },    // Dark red - overdue
];

/**
 * Interpolates between two values based on a factor (0-1)
 */
function lerp(a: number, b: number, factor: number): number {
  return Math.round(a + (b - a) * factor);
}

/**
 * Gets an interpolated RGB color based on percent remaining.
 * @param percentRemaining - Value from 1.0 (full) to negative (overdue)
 * @returns RGB tuple [r, g, b]
 */
export function getGradientColor(percentRemaining: number): [number, number, number] {
  // Clamp to reasonable range
  const percent = Math.max(-0.25, Math.min(1.0, percentRemaining));

  // Find the two stops we're between
  let upperStop = GRADIENT_STOPS[0];
  let lowerStop = GRADIENT_STOPS[GRADIENT_STOPS.length - 1];

  for (let i = 0; i < GRADIENT_STOPS.length - 1; i++) {
    if (percent <= GRADIENT_STOPS[i].percent && percent > GRADIENT_STOPS[i + 1].percent) {
      upperStop = GRADIENT_STOPS[i];
      lowerStop = GRADIENT_STOPS[i + 1];
      break;
    }
  }

  // Calculate interpolation factor between the two stops
  const range = upperStop.percent - lowerStop.percent;
  const factor = range === 0 ? 0 : (upperStop.percent - percent) / range;

  return [
    lerp(upperStop.r, lowerStop.r, factor),
    lerp(upperStop.g, lowerStop.g, factor),
    lerp(upperStop.b, lowerStop.b, factor),
  ];
}

/**
 * Applies gradient color to text based on percent remaining.
 * @param text - The text to colorize
 * @param percentRemaining - Value from 1.0 (full) to negative (overdue)
 * @returns Chalk-colored string
 */
export function applyGradientColor(text: string, percentRemaining: number): string {
  const [r, g, b] = getGradientColor(percentRemaining);
  return chalk.rgb(r, g, b)(text);
}

/**
 * Renders a progress bar that drains down as time passes.
 * Full when fresh, empty when time's up. Each segment colored by position.
 * @param percentRemaining - Value from 1.0 (full) to 0 (empty)
 * @param width - Total width of the progress bar
 * @returns Gradient-colored progress bar string
 */
export function renderGradientProgressBar(percentRemaining: number, width: number = 8): string {
  // Drain down: filled represents time remaining
  const clamped = Math.max(0, Math.min(1, percentRemaining));
  const filled = Math.round(clamped * width);
  const empty = width - filled;

  // Color each filled segment based on current urgency (all same color)
  let bar = '';
  const [r, g, b] = getGradientColor(percentRemaining);
  for (let i = 0; i < filled; i++) {
    bar += chalk.rgb(r, g, b)('\u2588'); // Full block
  }

  // Add empty segments in gray
  bar += chalk.gray('\u2591'.repeat(empty)); // Light shade

  return bar;
}

/**
 * Renders a simple progress bar (non-gradient) with current urgency color.
 * @param percentRemaining - Value from 1.0 (full) to 0 (empty)
 * @param width - Total width of the progress bar
 * @returns Single-color progress bar string
 */
export function renderSimpleProgressBar(percentRemaining: number, width: number = 8): string {
  const progress = Math.max(0, Math.min(1, 1 - percentRemaining));
  const filled = Math.round(progress * width);
  const empty = width - filled;

  const filledBar = '\u2588'.repeat(filled);
  const emptyBar = '\u2591'.repeat(empty);

  return applyGradientColor(filledBar, percentRemaining) + chalk.gray(emptyBar);
}
