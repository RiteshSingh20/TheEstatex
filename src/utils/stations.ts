export const stations = [
  { id: "1", name: "Churchgate", price: 1500 },
  { id: "2", name: "Marine Lines", price: 1500 },
  { id: "3", name: "Charni Road", price: 1500 },
  { id: "4", name: "Grant Road", price: 1500 },
  { id: "5", name: "Mumbai Central", price: 1500 },
  { id: "6", name: "Mahalaxmi", price: 1500 },
  { id: "7", name: "Lower Parel", price: 1500 },
  { id: "8", name: "Prabhadevi", price: 1500 },
  { id: "9", name: "Dadar", price: 1500 },
  { id: "10", name: "Matunga Road", price: 1500 },
  { id: "11", name: "Mahim Junction", price: 1500 },
  { id: "12", name: "Bandra", price: 1500 },
  { id: "13", name: "Khar Road", price: 1500 },
  { id: "14", name: "Santacruz", price: 1500 },
  { id: "15", name: "Vile Parle", price: 1500 },
  { id: "16", name: "Andheri", price: 1500 },
  { id: "17", name: "Jogeshwari", price: 1500 },
  { id: "18", name: "Ram Mandir", price: 1500 },
  { id: "19", name: "Goregaon", price: 1500 },
  { id: "20", name: "Malad", price: 1500 },
  { id: "21", name: "Kandivali", price: 1500 },
  { id: "22", name: "Borivali", price: 1500 },
  { id: "23", name: "Dahisar", price: 1500 },
  { id: "24", name: "Mira Road", price: 1500 },
  { id: "25", name: "Bhayandar", price: 1500 },
  { id: "26", name: "Naigaon", price: 1500 },
  { id: "27", name: "Vasai Road", price: 1500 },
  { id: "28", name: "Nallasopara", price: 1500 },
  { id: "29", name: "Virar", price: 1500 },
];

export const getMergedStations = (
  pricingNewPropertyPrices: Record<string, any>,
  newPropertyStationNames?: Record<string, string>
) => {
  const customStations = Object.entries(pricingNewPropertyPrices)
    .filter(([id]) => id.startsWith("custom-") && newPropertyStationNames?.[id])
    .map(([id, pricing]) => ({
      id,
      name:
        newPropertyStationNames?.[id] || `Custom Station ${id.substring(7)}`,
      price: typeof pricing === "object" ? pricing.offer : pricing,
    }));

  const merged = [...stations];

  customStations.forEach((customStation) => {
    if (!merged.find((station) => station.id === customStation.id)) {
      merged.push(customStation);
    }
  });

  return merged;
};

export const getMergedStationsWithLatestCustom = (
  pricingNewPropertyPrices: Record<string, number>,
  newPropertyStationNames?: Record<string, string>
) => {
  const customStations = Object.entries(pricingNewPropertyPrices)
    .filter(([id]) => id.startsWith("custom-"))
    .sort((a, b) => Number(b[0].substring(7)) - Number(a[0].substring(7))); // sort descending by timestamp in id

  const latestCustomStationEntry =
    customStations.length > 0 ? [customStations[0]] : [];

  const latestCustomStations = latestCustomStationEntry.map(
    ([id, discountedPrice]) => ({
      id,
      name:
        newPropertyStationNames && newPropertyStationNames[id]
          ? newPropertyStationNames[id]
          : `Custom Station ${id.substring(7)}`,
      price: discountedPrice,
    })
  );

  const merged = [...stations];

  latestCustomStations.forEach((customStation) => {
    if (!merged.find((station) => station.id === customStation.id)) {
      merged.push(customStation);
    }
  });

  return merged;
};
