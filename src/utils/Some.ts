export const Some = <T>(value: T | undefined | null): value is T =>
  value != null;
