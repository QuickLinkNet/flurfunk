// Zentrale Farb-Tokens (MD3-inspiriert), gespiegelt aus theme-*.css.
// Für reine CSS-Nutzung reichen die CSS-Variablen; dieses Modul ist für
// Fälle gedacht, in denen TS/JS Farben kennen muss (z.B. Chart-Farben).
export const colors = {
  primary: 'var(--md-color-primary)',
  primaryContainer: 'var(--md-color-primary-container)',
  secondary: 'var(--md-color-secondary)',
  secondaryContainer: 'var(--md-color-secondary-container)',
  surface: 'var(--md-color-surface)',
  surfaceVariant: 'var(--md-color-surface-variant)',
  onSurface: 'var(--md-color-on-surface)',
  onSurfaceVariant: 'var(--md-color-on-surface-variant)',
  border: 'var(--md-color-border)'
} as const;
