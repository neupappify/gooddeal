export interface PropertyCardDetails {
  bedrooms?: string;
  bathrooms?: string;
  area?: string;
}

// Read a listing value from the first record that contains it.
function getDetailValue(records: Record<string, unknown>[], keys: string[]): unknown {
  for (const record of records) {
    for (const key of keys) {
      const value = record[key];
      if (value !== undefined && value !== null && value !== "") return value;
    }
  }

  return undefined;
}

// Convert numeric listing measurements into card-ready text.
function formatMeasurement(value: unknown): string | undefined {
  const numericValue = typeof value === "number" ? value : typeof value === "string" ? Number(value) : NaN;
  return Number.isFinite(numericValue) && numericValue > 0
    ? numericValue.toLocaleString("en-US")
    : undefined;
}

// Convert supported area units to total Aana using the estate detail view's unit basis.
function convertAreaToAana(value: number, unit: string): number {
  const normalizedUnit = unit.toLowerCase().replace(/²/g, "2").replace(/[.\s^_-]/g, "");
  const squareMetersPerAana = 16 * 1.98885;
  const squareFeetPerAana = squareMetersPerAana / 0.09290304;

  if (["m", "meter", "meters", "m2", "sqm", "squaremeter", "squaremeters"].includes(normalizedUnit)) {
    return value / squareMetersPerAana;
  }
  if (["aana", "ana"].includes(normalizedUnit)) return value;
  if (normalizedUnit === "ropani") return value * 16;
  if (normalizedUnit === "paisa") return value / 4;
  if (["dam", "daam"].includes(normalizedUnit)) return value / 16;
  if (normalizedUnit === "kattha") return value * 3645 / squareFeetPerAana;
  if (normalizedUnit === "dhur") return value * 3645 / 20 / squareFeetPerAana;
  if (normalizedUnit === "acre") return value * 43560 / squareFeetPerAana;
  if (["hectare", "ha"].includes(normalizedUnit)) return value * 10000 / squareMetersPerAana;
  return value / squareFeetPerAana;
}

// Format converted property area as Aana for display on listing cards.
function formatAreaInAana(value: unknown, unit: string): string | undefined {
  const numericValue = typeof value === "number" ? value : typeof value === "string" ? Number(value) : NaN;
  if (!Number.isFinite(numericValue) || numericValue <= 0) return undefined;

  const areaInAana = convertAreaToAana(numericValue, unit);
  return `${areaInAana.toLocaleString("en-US", { maximumFractionDigits: 2 })} Aana`;
}

// Select the details shown for land, houses, and apartments.
export function getPropertyCardDetails(property: Record<string, unknown>): PropertyCardDetails {
  const rawCategory = Array.isArray(property.category) ? property.category[0] : property.category;
  const category = typeof rawCategory === "string" ? rawCategory.trim().toLowerCase() : "";
  const isLand = category === "land";
  const isHouseOrApartment = ["house", "apartment", "flat"].includes(category);
  if (!isLand && !isHouseOrApartment) return {};

  const details = property.details && typeof property.details === "object" && !Array.isArray(property.details)
    ? property.details as Record<string, unknown>
    : {};
  const spacing = property.spacing && typeof property.spacing === "object" && !Array.isArray(property.spacing)
    ? property.spacing as Record<string, unknown>
    : {};
  const specifics = details.specifics && typeof details.specifics === "object" && !Array.isArray(details.specifics)
    ? details.specifics as Record<string, unknown>
    : {};
  const rooms = specifics.rooms && typeof specifics.rooms === "object" && !Array.isArray(specifics.rooms)
    ? specifics.rooms as Record<string, unknown>
    : {};
  const space = specifics.space && typeof specifics.space === "object" && !Array.isArray(specifics.space)
    ? specifics.space as Record<string, unknown>
    : {};
  const nestedRecords = Object.values(details).filter(
    (value): value is Record<string, unknown> => value !== null && typeof value === "object" && !Array.isArray(value),
  );
  const bedroomRecords = [spacing, rooms, details, ...nestedRecords];
  const areaRecords = [property, space, details, ...nestedRecords];
  const rawArea = getDetailValue(areaRecords, ["area", "totalArea", "landArea"]);
  const rawAreaUnit = getDetailValue([property, space, details, ...nestedRecords], ["areaUnit", "unit"]);
  const areaUnit = typeof rawAreaUnit === "string" && rawAreaUnit.trim() ? rawAreaUnit.trim() : "m2";
  const areaValue = formatAreaInAana(rawArea, areaUnit);

  if (isLand) return { area: areaValue };

  const bedrooms = formatMeasurement(getDetailValue(bedroomRecords, ["bedrooms", "bedroomCount"]));
  const bathrooms = formatMeasurement(getDetailValue(bedroomRecords, ["bathrooms", "bathroomCount"]));
  return {
    bedrooms,
    bathrooms,
    area: areaValue,
  };
}
