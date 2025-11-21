// src/lib/utils.ts

import { ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

// ShadCN-style className merge utility
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
