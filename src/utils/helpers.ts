import { Timestamp } from "firebase/firestore";

export const toDate = (timestamp: any): Date => {
  if (timestamp?.toDate) {
    return timestamp.toDate();
  }
  if (timestamp instanceof Date) {
    return timestamp;
  }
  if (typeof timestamp === "number" || typeof timestamp === "string") {
    const date = new Date(timestamp);
    if (!isNaN(date.getTime())) return date;
  }
  return new Date();
};

export const toTitleCase = (str: string): string => {
  return str.replace(
    /\w\S*/g,
    (txt) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
  );
};

export const normalizeStationName = (name: string) => {
  return name.replace(/\s+(East|West)$/i, "").trim();
};
