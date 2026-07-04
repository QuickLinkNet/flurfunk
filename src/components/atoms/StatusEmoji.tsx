interface Props {
  emoji: string;
  size?: number;
}

// Reines Anzeige-Atom für einen Haushaltsstatus (siehe PRD Kapitel 6).
export function StatusEmoji({ emoji, size = 24 }: Props) {
  return <span style={{ fontSize: size, lineHeight: 1 }}>{emoji}</span>;
}
