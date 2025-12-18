type PercentInputs = {
  progressPercent?: unknown;
  correct?: unknown;
  total?: unknown;
};

const toFiniteNumber = (value: unknown): number | null => {
  if (typeof value === 'number') return Number.isFinite(value) ? value : null;
  if (typeof value === 'string' && value.trim().length > 0) {
    const n = Number(value);
    return Number.isFinite(n) ? n : null;
  }
  return null;
};

const clampPercent = (value: number) => Math.min(100, Math.max(0, value));

/**
 * Produces a stable percent for UI.
 * Some backends return `progressPercent` in range 0..1, or a value inconsistent with counts.
 */
export const computeProgressPercent = ({ progressPercent, correct, total }: PercentInputs): number => {
  const correctNum = toFiniteNumber(correct);
  const totalNum = toFiniteNumber(total);

  const hasCounts = correctNum !== null && totalNum !== null && totalNum > 0;
  const percentFromCounts = hasCounts ? Math.round((correctNum / totalNum) * 100) : null;

  const raw = toFiniteNumber(progressPercent);
  if (raw === null) return clampPercent(percentFromCounts ?? 0);

  const scaled = raw >= 0 && raw <= 1 ? raw * 100 : raw;
  const rounded = Math.round(scaled);

  if (percentFromCounts !== null && Math.abs(percentFromCounts - rounded) >= 2) {
    return clampPercent(percentFromCounts);
  }

  return clampPercent(rounded);
};

