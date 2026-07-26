interface PageHeaderContent {
  eyebrow?: string;
  title: string;
  subtitle?: string;
}

export const PAGE_HEADERS = {
  admin: {
    title: 'Verwaltung',
    subtitle: 'Haushalte, Einladungen, Inhalte und Systemfunktionen steuern.'
  },
  calendar: {
    title: 'Kalender',
    subtitle: 'Termine, Events und wichtige Tage deiner Straße.'
  },
  events: {
    title: 'Events',
    subtitle: 'Plane Treffen und sammle Rückmeldungen aus der Nachbarschaft.'
  },
  household: {
    title: 'Mein Haushalt',
    subtitle: 'Profil, Status, Familie und Sichtbarkeit für deine Straße.'
  },
  help: {
    title: 'Schwarzes Brett',
    subtitle: 'Suchen, anbieten, verleihen und kleine Hilfe in deiner Nachbarschaft organisieren.'
  },
  neighbors: {
    title: 'Nachbarn',
    subtitle: 'Wer sichtbar ist, welchen Status die Haushalte setzen und wie du sie schnell wiedererkennst.'
  },
  onboarding: {
    title: 'Willkommen bei Flurfunk',
    subtitle: 'Richtet euren Haushalt kurz ein. Ihr könnt alles später ändern.'
  },
  settings: {
    title: 'Einstellungen',
    subtitle: 'Darstellung, Benachrichtigungen und Account verwalten.'
  },
  street: {
    title: 'Straße',
    subtitle: 'Kurzmeldungen, Hilfe und Hinweise aus deiner direkten Nachbarschaft.'
  }
} satisfies Record<string, PageHeaderContent>;
