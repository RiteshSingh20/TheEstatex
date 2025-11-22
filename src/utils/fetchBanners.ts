import axios from 'axios';
import { Banner } from '../types';

export const fetchBanners = async (locations: string[]): Promise<Banner[]> => {
  try {
    const locationsParam = locations.join(',');
    const response = await axios.get(
      `https://asia-south1-starzapp.cloudfunctions.net/EstatexD4P/banners?location=${encodeURIComponent(locationsParam)}`
    );

    const responseData = response.data;
    // Debug log to inspect data structure
    // 

    if (responseData && Array.isArray(responseData.data)) {
      return responseData.data.map((imageUrl: string, index: number): Banner => ({
        id: index.toString(),
        title: '',
        imageUrl: imageUrl,
        location: '',
      }));
    } else {
      return [];
    }
  } catch (error) {
    return [];
  }
};
