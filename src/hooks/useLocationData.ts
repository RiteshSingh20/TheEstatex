import { useState, useCallback } from 'react';
import { fetchLocationSuggestions } from '../utils/api';

export interface LocationData {
  location: string;
  subLocation: string;
  road: string;
  landmark: string;
}

export const useLocationData = () => {
  const [locationSuggestions, setLocationSuggestions] = useState<string[]>([]);
  const [subLocationSuggestions, setSubLocationSuggestions] = useState<string[]>([]);
  const [roadSuggestions, setRoadSuggestions] = useState<string[]>([]);
  const [landmarkSuggestions, setLandmarkSuggestions] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchSuggestions = useCallback(async (searchTerm: string, field: keyof LocationData) => {
    if (!searchTerm || searchTerm.length < 1) {
      return [];
    }

    setIsLoading(true);
    try {
      const suggestions = await fetchLocationSuggestions(searchTerm, field);
      return suggestions;
    } catch (error) {
      console.error('Error fetching location suggestions:', error);
      return [];
    } finally {
      setIsLoading(false);
    }
  }, []);

  const searchLocations = useCallback(async (searchTerm: string) => {
    const suggestions = await fetchSuggestions(searchTerm, 'location');
    setLocationSuggestions(suggestions);
  }, [fetchSuggestions]);

  const searchSubLocations = useCallback(async (searchTerm: string) => {
    const suggestions = await fetchSuggestions(searchTerm, 'subLocation');
    setSubLocationSuggestions(suggestions);
  }, [fetchSuggestions]);

  const searchRoads = useCallback(async (searchTerm: string) => {
    const suggestions = await fetchSuggestions(searchTerm, 'road');
    setRoadSuggestions(suggestions);
  }, [fetchSuggestions]);

  const searchLandmarks = useCallback(async (searchTerm: string) => {
    const suggestions = await fetchSuggestions(searchTerm, 'landmark');
    setLandmarkSuggestions(suggestions);
  }, [fetchSuggestions]);

  return {
    locationSuggestions,
    subLocationSuggestions,
    roadSuggestions,
    landmarkSuggestions,
    isLoading,
    searchLocations,
    searchSubLocations,
    searchRoads,
    searchLandmarks,
  };
};