import { blur, radii, spacing } from './spacing';
import { colors } from './colors';
import { textVariants, typography } from './typography';

export const theme = {
  colors,
  spacing,
  radii,
  blur,
  typography,
  textVariants,
};

export type Theme = typeof theme;

export * from './colors';
export * from './spacing';
export * from './typography';
