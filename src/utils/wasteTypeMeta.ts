export interface WasteTypeMeta {
  label: string;
  icon: string;
  color: string;
}

const FALLBACK: WasteTypeMeta = {
  label: 'Mülltermin',
  icon: '🗑️',
  color: '#8A7A6A'
};

const TYPES: Array<{ match: RegExp; meta: WasteTypeMeta }> = [
  { match: /bio|grün/i, meta: { label: 'Bioabfall', icon: '🟤', color: '#8A5A34' } },
  { match: /gelb|sack|wertstoff/i, meta: { label: 'Gelber Sack', icon: '🟡', color: '#D39A2D' } },
  { match: /papier|pappe|altpapier/i, meta: { label: 'Altpapier', icon: '🔵', color: '#5D8AA8' } },
  { match: /rest/i, meta: { label: 'Restmüll', icon: '⚫', color: '#6B7280' } },
  { match: /glas/i, meta: { label: 'Altglas', icon: '🟢', color: '#7A9E7E' } }
];

export function wasteMeta(title: string): WasteTypeMeta {
  return TYPES.find((type) => type.match.test(title))?.meta ?? FALLBACK;
}
