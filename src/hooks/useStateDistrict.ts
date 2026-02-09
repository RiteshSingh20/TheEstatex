import { useState, useEffect, useRef } from 'react';
import axios from 'axios';

interface StateData {
  name: string;
  iso2: string;
}

interface DistrictData {
  name: string;
}

interface UseStateDistrictReturn {
  states: StateData[];
  districts: DistrictData[];
  selectedState: string;
  isLoadingStates: boolean;
  isLoadingDistricts: boolean;
  stateError: string | null;
  districtError: string | null;
  setSelectedState: (state: string) => void;
}

const fetchStates = async (): Promise<StateData[]> => {
  try {
    const response = await axios.get(
      'https://api.countrystatecity.in/v1/countries/IN/states',
      {
        headers: {
          'X-CSCAPI-KEY': 'QXc3MW5lbVNuVTdpWm5sVnZYOFNid0hSUjVNNnRZSVB2czFpaE5FTQ==',
        },
      }
    );
    return response.data;
  } catch (error) {
    return [];
  }
};

const stateCache = new Map<string, DistrictData[]>();
let statesCache: StateData[] | null = null;

export const useStateDistrict = (): UseStateDistrictReturn => {
  const [states, setStates] = useState<StateData[]>([]);
  const [districts, setDistricts] = useState<DistrictData[]>([]);
  const [selectedState, setSelectedState] = useState<string>('');
  const [isLoadingStates, setIsLoadingStates] = useState<boolean>(false);
  const [isLoadingDistricts, setIsLoadingDistricts] = useState<boolean>(false);
  const [stateError, setStateError] = useState<string | null>(null);
  const [districtError, setDistrictError] = useState<string | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  useEffect(() => {
    if (statesCache) {
      setStates(statesCache);
      return;
    }

    const loadStates = async () => {
      setIsLoadingStates(true);
      setStateError(null);
      try {
        const data = await fetchStates();
        statesCache = data;
        setStates(data);
      } catch (error) {
        setStateError(error instanceof Error ? error.message : 'Error fetching states');
        setStates([]);
      } finally {
        setIsLoadingStates(false);
      }
    };

    loadStates();
  }, []);

  useEffect(() => {
    if (!selectedState || selectedState.trim() === '') {
      setDistricts([]);
      return;
    }

    if (stateCache.has(selectedState)) {
      setDistricts(stateCache.get(selectedState) || []);
      return;
    }

    const controller = new AbortController();
    abortControllerRef.current = controller;

    const fetchDistricts = async () => {
      setIsLoadingDistricts(true);
      setDistrictError(null);
      try {
        const response = await fetch('https://countriesnow.space/api/v0.1/countries/state/cities', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ country: 'India', state: selectedState }),
          signal: controller.signal
        });
        
        if (!response.ok) throw new Error('Failed to fetch districts');
        
        const data = await response.json();
        const cityList = data.data || [];
        const districtList = cityList.map((city: string) => ({ name: city }));
        stateCache.set(selectedState, districtList);
        setDistricts(districtList);
      } catch (error) {
        if (error instanceof Error && error.name !== 'AbortError') {
          setDistrictError(error.message);
          setDistricts([]);
        }
      } finally {
        setIsLoadingDistricts(false);
      }
    };

    fetchDistricts();

    return () => controller.abort();
  }, [selectedState]);

  return {
    states,
    districts,
    selectedState,
    isLoadingStates,
    isLoadingDistricts,
    stateError,
    districtError,
    setSelectedState
  };
};
