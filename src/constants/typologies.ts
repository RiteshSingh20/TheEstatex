export const TYPOLOGIES = [
  "1 RK",
  "1 BHK",
  "1.5 BHK",
  "2 BHK",
  "2.5 BHK",
  "3 BHK",
  "3.5 BHK",
  "4 BHK",
  "4.5 BHK",
  "5 BHK",
  "1 + 1 Jodi",
  "1 + 2 Jodi",
  "2 + 2 Jodi",
  "2 + 3 Jodi",
  "3 + 3 Jodi",
  "Penthouse / Duplex",
  "Row House",
  "Bungalow",
  "Villa",
] as const;

export type Typology = typeof TYPOLOGIES[number];