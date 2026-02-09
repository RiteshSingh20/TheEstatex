import { useState, useRef, useCallback } from 'react';

interface PinData {
  state: string;
  district: string;
}

interface UsePinCodeReturn {
  pinCode: string;
  setPinCode: (pin: string) => void;
  state: string;
  district: string;
  isLoading: boolean;
  error: string | null;
  isValid: boolean;
}

const pinCache = new Map<string, PinData>();

export const usePinCode = (): UsePinCodeReturn => {
  const [pinCode, setPinCodeState] = useState<string>('');
  const [state, setState] = useState<string>('');
  const [district, setDistrict] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isValid, setIsValid] = useState<boolean>(false);
  const abortControllerRef = useRef<AbortController | null>(null);

  const setPinCode = useCallback((pin: string) => {
    const numericPin = pin.replace(/\D/g, '');
    setPinCodeState(numericPin);
    setError(null);

    if (numericPin.length === 0) {
      setState('');
      setDistrict('');
      setIsValid(false);
      return;
    }

    if (numericPin.length !== 6) {
      setError(`PIN must be exactly 6 digits (${numericPin.length}/6)`);
      setState('');
      setDistrict('');
      setIsValid(false);
      return;
    }

    // Check cache first
    if (pinCache.has(numericPin)) {
      const cached = pinCache.get(numericPin)!;
      setState(cached.state);
      setDistrict(cached.district);
      setIsValid(true);
      setError(null);
      return;
    }

    // Abort previous request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    const controller = new AbortController();
    abortControllerRef.current = controller;

    const fetchPinData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await fetch(`https://api.postalpincode.in/pincode/${numericPin}`, {
          signal: controller.signal
        });
        const data = await response.json();

        if (data[0]?.Status === 'Success' && data[0]?.PostOffice?.length > 0) {
          const postOffice = data[0].PostOffice[0];
          const fetchedState = postOffice.State || '';
          const fetchedDistrict = postOffice.District || '';
          
          setState(fetchedState);
          setDistrict(fetchedDistrict);
          setIsValid(true);
          pinCache.set(numericPin, { state: fetchedState, district: fetchedDistrict });
        } else {
          setError('Invalid PIN Code');
          setState('');
          setDistrict('');
          setIsValid(false);
        }
      } catch (err) {
        if (err instanceof Error && err.name !== 'AbortError') {
          setError('Failed to fetch PIN details');
          setState('');
          setDistrict('');
          setIsValid(false);
        }
      } finally {
        setIsLoading(false);
      }
    };

    setIsLoading(true);
    fetchPinData();
  }, []);

  return {
    pinCode,
    setPinCode,
    state,
    district,
    isLoading,
    error,
    isValid
  };
};
