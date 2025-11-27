import { Timestamp } from "firebase/firestore";
import { pdfjsLib } from "../components/Admin Components/CostSheetForm";
import React from "react";
import {
  getUsers,
  getResaleProperties,
  getRentalProperties,
} from "../utils/firestoreListings";

export interface CostSheetFormProps {
  editProperty?: any;
  onSave?: (updatedProperty: any) => void;
}
export interface FormDataType {
  [key: string]:
    | string[]
    | string
    | number
    | undefined
    | { [key: string]: string };
  locationHighlightTimes: { [key: string]: string };
}
export const stepDefinitions = [
  { label: "Basic Information", subtitle: "Step 1" },
  { label: "Pricing & Buildings", subtitle: "Step 2" },
  { label: "Floor rise & Charges", subtitle: "Step 3" },
  { label: "Amenities", subtitle: "Step 4" },
  { label: "Ladder & Scheme", subtitle: "Step 5" },
  { label: "Contacts & Collaterals", subtitle: "Step 6" },
];
export const months = [
  "Ready to move",
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];
export const years = Array.from(
  { length: 7 },
  (_, i) => new Date().getFullYear() + i
);
export const categories = [
  {
    label: "Basic Information",
    fields: [
      "dateUpdateCostSheet",
      "projectName",
      "developerName",
      "location",
      "subLocation",
      "road",
      "landmark",
      "state",
      "district",
      "pinCode",
      "landParcel",
      "towers",
      "storey",
      "flatsPerFloor",
      "isCosmo",
    ],
  },
  {
    label: "Pricing Details",
    fields: [
      "wingBuildingNo",
      "projectStatus",
      "flatType",
      "saleableArea",
      "reraCarpet",
      "psfRate",
      "avRate",
      "floorRise",
      "registration",
    ],
  },
  {
    label: "Floor rise & Charges",
    fields: ["floorRise", "registration", "parkingCharge", "description"],
  },
  {
    label: "Amenities",
    fields: ["apartmentAmenities", "projectAmenities", "locationHighlights"],
  },
  {
    label: "Ladder & Scheme",
    fields: [],
  },
  {
    label: "Contacts & Collaterals",
    fields: ["siteHeadName", "siteHeadNumber"],
  },
];
export const requiredPerStep: Record<number, string[]> = {
  0: [
    "dateUpdateCostSheet",
    "projectName",
    "developerName",
    "location",
    "state",
    "district",
    "pinCode",
    "landParcel",
    "towers",
    "storey",
    "isCosmo",
  ],
  1: ["flatType", "saleableArea", "reraCarpet", "psfRate", "avRate"],
  2: ["floorRise", "registration", "parkingCharge"],
  3: [],
  4: [],
  5: [],
};
export const toTitleCase = (str: string): string => {
  return str.replace(
    /\w\S*/g,
    (txt) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
  );
};
export const needsUpdate = (property: any): boolean => {
  const lastUpdated =
    property.updatedAt || property.createdAt || property.dateUpdateCostSheet;
  if (!lastUpdated) return false;

  const lastUpdateDate =
    lastUpdated instanceof Timestamp
      ? lastUpdated.toDate()
      : new Date(lastUpdated);
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  return lastUpdateDate < thirtyDaysAgo;
};
export function generatePdfThumbnailFromFile() {
  return async (file: File) => {
    if (!pdfjsLib || file.type !== "application/pdf") return null;

    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      const page = await pdf.getPage(1);
      const viewport = page.getViewport({ scale: 0.5 });

      const canvas = document.createElement("canvas");
      const context = canvas.getContext("2d");
      canvas.height = viewport.height;
      canvas.width = viewport.width;

      await page.render({ canvasContext: context, viewport }).promise;
      return canvas.toDataURL();
    } catch (error) {
      return null;
    }
  };
}
export function fetchCostSheetStations(
  costSheets: unknown[],
  setStationOptions: React.Dispatch<
    React.SetStateAction<{ value: string; label: string }[]>
  >
) {
  return async () => {
    try {
      const { stations } = await import("../utils/stations");

      const stationNames = stations.map((s) => s.name);
      const defaultLocationOptions = stationNames.flatMap((name) => [
        { value: `${name} East`, label: `${name} East` },
        { value: `${name} West`, label: `${name} West` },
      ]);

      const additionalLocations = new Set<string>();

      costSheets.forEach((sheet: any) => {
        if (sheet.station) {
          const stationName = sheet.station.trim();
          if (
            stationName &&
            !defaultLocationOptions.some(
              (opt) => opt.value.toLowerCase() === stationName.toLowerCase()
            )
          ) {
            additionalLocations.add(stationName);
          }
        }
      });

      try {
        const users = await getUsers();

        for (const user of users) {
          try {
            const resaleProperties = await getResaleProperties(user.id);
            resaleProperties.forEach((property: any) => {
              if (property.station) {
                const stationName = property.station.trim();
                if (
                  stationName &&
                  !defaultLocationOptions.some(
                    (opt) =>
                      opt.value.toLowerCase() === stationName.toLowerCase()
                  )
                ) {
                  additionalLocations.add(stationName);
                }
              }
            });
          } catch (error) {}

          try {
            const rentalProperties = await getRentalProperties(user.id);
            rentalProperties.forEach((property: any) => {
              if (property.station) {
                const stationName = property.station.trim();
                if (
                  stationName &&
                  !defaultLocationOptions.some(
                    (opt) =>
                      opt.value.toLowerCase() === stationName.toLowerCase()
                  )
                ) {
                  additionalLocations.add(stationName);
                }
              }
            });
          } catch (error) {}
        }
      } catch (error) {}

      const additionalLocationOptions = Array.from(additionalLocations)
        .sort()
        .map((location) => ({ value: location, label: location }));

      const allLocationOptions = [
        ...defaultLocationOptions,
        ...additionalLocationOptions,
      ];

      setStationOptions(allLocationOptions);
    } catch (error) {}
  };
}
export function getApprovedFlatTypes(costSheets: unknown[]) {
  return [
    ...new Set(
      (costSheets as any[])
        .filter((sheet: any) => sheet.isApproved)
        .map((sheet: any) => sheet.flatType)
        .filter(Boolean)
    ),
  ].sort();
}
