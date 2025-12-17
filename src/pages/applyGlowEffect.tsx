import React from "react";
import { useEffect } from "react";
import { City, State } from "../types";
import { FormDataType } from "./CostSheetFormProps";
import { getDocs, collection } from "firebase/firestore";
import { fetchStates, fetchCities } from "../utils/api";
import { db } from "../utils/firebase";
import {
  StampDutyRate,
  CostSheet,
} from "../components/CompareComponents/Compare";

export function applyGlowEffect() {
  useEffect(() => {
    const style = document.createElement("style");
    style.textContent = `
      @keyframes seamless-blink {
        0%, 50% { opacity: 1; }
        51%, 100% { opacity: 0.4; }
      }
      .tab-glow {
        color: #f97316;
        text-shadow: 0 0 8px rgba(249, 115, 22, 0.6);
        font-weight: 600;
        animation: seamless-blink 2s ease-in-out infinite;
      }
    `;
    document.head.appendChild(style);
    return () => document.head.removeChild(style);
  }, []);
}
export function initializeStateCode(
  formData: FormDataType,
  states: State[],
  selectedStateCode: string,
  setSelectedStateCode: React.Dispatch<React.SetStateAction<string>>
) {
  useEffect(() => {
    if (formData.state && states.length > 0 && !selectedStateCode) {
      const stateObj = states.find((state) => state.name === formData.state);
      if (stateObj) {
        setSelectedStateCode(stateObj.iso2);
      } else {
        setSelectedStateCode(formData.state as string);
      }
    }
  }, [formData.state, states, selectedStateCode]);
}
export function updateStationOptions(
  costSheets: unknown[],
  fetchStationOptions: () => Promise<void>
) {
  useEffect(() => {
    if (costSheets.length > 0) {
      fetchStationOptions();
    }
  }, [costSheets]);
}
export function toggleStationDropdown(
  setShowStationDropdown: React.Dispatch<React.SetStateAction<boolean>>,
  setSelectedStationIndex: React.Dispatch<React.SetStateAction<number>>
) {
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest(".station-dropdown")) {
        setShowStationDropdown(false);
        setSelectedStationIndex(-1);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);
}
export function initializeStampRatesAndStates(
  setStampRates: React.Dispatch<React.SetStateAction<StampDutyRate[]>>,
  setStates: React.Dispatch<React.SetStateAction<State[]>>,
  editProperty: any,
  editingProperty: CostSheet | null,
  setSelectedStateCode: React.Dispatch<React.SetStateAction<string>>,
  setCities: React.Dispatch<React.SetStateAction<City[]>>
) {
  useEffect(() => {
    const fetchStampDutyRates = async () => {
      try {
        const snapshot = await getDocs(collection(db, "stampDutyRates"));
        const rates: StampDutyRate[] = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...(doc.data() as Omit<StampDutyRate, "id">),
        }));
        setStampRates(rates);
      } catch (error) {}
    };

    const loadStates = async () => {
      try {
        const statesData = await fetchStates();
        setStates(statesData);

        const propertyToEdit = editProperty || editingProperty;
        if (propertyToEdit?.state && statesData.length > 0) {
          const stateObj = statesData.find(
            (state) => state.name === propertyToEdit.state
          );
          if (stateObj) {
            setSelectedStateCode(stateObj.iso2);
            fetchCities(stateObj.iso2)
              .then(setCities)
              .catch(() => {});
          }
        }
      } catch (error) {}
    };

    fetchStampDutyRates();
    loadStates();
  }, [editProperty, editingProperty]);
}
