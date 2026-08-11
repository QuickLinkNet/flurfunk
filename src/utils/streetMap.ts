export interface StreetMapHousehold {
  id: number;
  addressLine: string;
}

export interface StreetMapPlacement<T> {
  household: T;
  number: number;
}

export function parseHouseNumber(addressLine: string): number | null {
  const match = addressLine.match(/(\d+)\s*[a-zA-Z]?\s*$/);
  return match ? parseInt(match[1], 10) : null;
}

export function splitByStreetSide<T extends StreetMapHousehold>(households: T[]): {
  left: StreetMapPlacement<T>[];
  right: StreetMapPlacement<T>[];
  unplaced: T[];
} {
  const placed: StreetMapPlacement<T>[] = [];
  const unplaced: T[] = [];
  for (const household of households) {
    const number = parseHouseNumber(household.addressLine);
    if (number === null) {
      unplaced.push(household);
    } else {
      placed.push({ household, number });
    }
  }
  return {
    left: placed.filter((entry) => entry.number % 2 === 1).sort((a, b) => a.number - b.number),
    right: placed.filter((entry) => entry.number % 2 === 0).sort((a, b) => a.number - b.number),
    unplaced
  };
}
