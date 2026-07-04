export type Visibility = 'public' | 'neighbors' | 'private';

// Clientseitige Hilfsfunktion nur für UI-Hinweise – die echte
// Durchsetzung passiert immer serverseitig (siehe PRD Kapitel 5).
export function visibilityLabel(v: Visibility): string {
  switch (v) {
    case 'public':
      return 'Öffentlich';
    case 'neighbors':
      return 'Nur Nachbarn';
    case 'private':
      return 'Privat';
  }
}
