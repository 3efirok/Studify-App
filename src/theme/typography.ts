export type FontWeight = '400' | '500' | '600' | '700';

export const typography = {
  fontFamily: 'System',
  sizes: {
    xs: 12,
    sm: 14,
    md: 16,
    lg: 20,
    xl: 24,
    display: 32,
  },
  weights: {
    regular: '400' as FontWeight,
    medium: '500' as FontWeight,
    semibold: '600' as FontWeight,
    bold: '700' as FontWeight,
  },
} as const;

export const textVariants = {
  label: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.medium,
  },
  body: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.regular,
  },
  title: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.semibold,
  },
  heading: {
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.bold,
  },
} as const;

export type TextVariant = keyof typeof textVariants;
