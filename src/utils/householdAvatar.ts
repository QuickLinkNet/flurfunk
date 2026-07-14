export const HOUSEHOLD_AVATARS = [
  { key: 'home', label: 'Haus', emoji: '🏠', background: '#F6D8BE' },
  { key: 'garden', label: 'Garten', emoji: '🌿', background: '#DCE8C8' },
  { key: 'family', label: 'Familie', emoji: '👨‍👩‍👧', background: '#F4D6D6' },
  { key: 'bike', label: 'Fahrrad', emoji: '🚲', background: '#D8E6EC' },
  { key: 'coffee', label: 'Kaffee', emoji: '☕', background: '#E8DDC9' },
  { key: 'star', label: 'Stern', emoji: '⭐', background: '#F8E8AE' },
  { key: 'heart', label: 'Herz', emoji: '❤️', background: '#F6D5CE' },
  { key: 'tree', label: 'Baum', emoji: '🌳', background: '#D6E6D1' }
];

export function householdAvatar(key: string | null | undefined) {
  return HOUSEHOLD_AVATARS.find((avatar) => avatar.key === key) ?? HOUSEHOLD_AVATARS[0];
}
