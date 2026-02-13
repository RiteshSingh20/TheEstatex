import { 
  collection, 
  doc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  getDocs, 
  getDoc, 
  query, 
  where, 
  orderBy, 
  Timestamp 
} from 'firebase/firestore';
import { db } from '../../../utils/firebase';
import { Property } from '../bloc/propertyState';

export class PropertyService {
  private collectionName = 'properties';

  async addProperty(formData: any, user: any): Promise<Property> {
    try {
      if (!user) throw new Error('User not authenticated');

      // Convert new form structure to old structure with field mapping
      const propertyData = this.convertToOldStructure(formData, user);

      const docRef = await addDoc(collection(db, this.collectionName), propertyData);
      
      return {
        id: docRef.id,
        ...propertyData
      } as Property;
    } catch (error) {
      console.error('Error adding property:', error);
      throw error;
    }
  }

  async updateProperty(propertyId: string, formData: any, user: any): Promise<Property> {
    try {
      if (!user) throw new Error('User not authenticated');

      // Check if property exists in old source first
      const isOldSource = await this.isFromOldSource(propertyId, user.id, formData.transactionType);
      
      if (isOldSource) {
        return await this.updateOldSourceProperty(propertyId, formData, user);
      } else {
        return await this.updateNewSourceProperty(propertyId, formData, user);
      }
    } catch (error) {
      console.error('Error updating property:', error);
      throw error;
    }
  }

  private async isFromOldSource(propertyId: string, userId: string, transactionType: string): Promise<boolean> {
    try {
      const collectionName = transactionType === 'Rental' ? 'rentalProperties' : 'resaleProperties';
      const oldDocRef = doc(db, 'users', userId, collectionName, propertyId);
      const oldDoc = await getDoc(oldDocRef);
      return oldDoc.exists();
    } catch (error) {
      return false;
    }
  }

  private async updateOldSourceProperty(propertyId: string, formData: any, user: any): Promise<Property> {
    const collectionName = formData.transactionType === 'Rental' ? 'rentalProperties' : 'resaleProperties';
    const propertyData = this.convertToOldStructure(formData, user);
    propertyData.updatedAt = new Date().toISOString();
    
    // Reset approval status when updating
    propertyData.isApproved = false;
    propertyData.status = 'Pending Approval';

    const docRef = doc(db, 'users', user.id, collectionName, propertyId);
    await updateDoc(docRef, propertyData);

    return {
      id: propertyId,
      ...propertyData
    } as Property;
  }

  private async updateNewSourceProperty(propertyId: string, formData: any, user: any): Promise<Property> {
    const propertyData = this.convertToOldStructure(formData, user);
    propertyData.updatedAt = new Date().toISOString();
    
    // Reset approval status when updating
    propertyData.isApproved = false;
    propertyData.status = 'Pending Approval';

    const docRef = doc(db, this.collectionName, propertyId);
    await updateDoc(docRef, propertyData);

    return {
      id: propertyId,
      ...propertyData
    } as Property;
  }

  async getProperties(filters?: any): Promise<Property[]> {
    try {
      let q = query(collection(db, this.collectionName));

      // Apply filters
      if (filters?.propertyType) {
        q = query(q, where('propertyType', '==', filters.propertyType));
      }
      if (filters?.transactionType) {
        q = query(q, where('transactionType', '==', filters.transactionType));
      }
      if (filters?.userId) {
        q = query(q, where('userId', '==', filters.userId));
      }
      if (filters?.status) {
        q = query(q, where('status', '==', filters.status));
      }

      // Order by creation date
      q = query(q, orderBy('createdAt', 'desc'));

      const querySnapshot = await getDocs(q);
      const properties: Property[] = [];

      querySnapshot.forEach((doc) => {
        properties.push({
          id: doc.id,
          ...doc.data()
        } as Property);
      });

      return properties;
    } catch (error) {
      console.error('Error getting properties:', error);
      throw error;
    }
  }

  async getProperty(propertyId: string): Promise<Property | null> {
    try {
      const docRef = doc(db, this.collectionName, propertyId);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        return {
          id: docSnap.id,
          ...docSnap.data()
        } as Property;
      }
      return null;
    } catch (error) {
      console.error('Error getting property:', error);
      throw error;
    }
  }

  async deleteProperty(propertyId: string): Promise<void> {
    try {
      const docRef = doc(db, this.collectionName, propertyId);
      await deleteDoc(docRef);
    } catch (error) {
      console.error('Error deleting property:', error);
      throw error;
    }
  }

  private convertToOldStructure(formData: any, user: any): any {
    const now = new Date().toISOString();
    
    // Helper function to safely convert to number
    const safeNumber = (value: any): number | null => {
      if (value === null || value === undefined || value === '') return null;
      const num = Number(value);
      return isNaN(num) ? null : num;
    };
    
    return {
      // Field mapping: new → old
      society: formData.buildingSocietyName || formData.society || '',
      sublocation: formData.sublocation || '',
      landmark: formData.landmark || '',
      pincode: formData.pinCode || formData.pincode || '',
      station: formData.locationStation || formData.station || '',
      district: formData.district || '',
      state: formData.state || '',
      
      type: formData.configuration || formData.type || '',
      masterBed: formData.masterBed === 'Yes' || formData.masterBed === true,
      buildingNo: formData.buildingNoWing || formData.buildingNo || '',
      flatNo: safeNumber(formData.flatNo),
      floorNo: safeNumber(formData.floorNo),
      totalFloors: safeNumber(formData.totalFloors),
      carpetArea: safeNumber(formData.carpetArea),
      builtUpArea: safeNumber(formData.builtUpArea),
      propertyAge: safeNumber(formData.propertyAge),
      
      // Resale specific
      ocAvailable: formData.ocAvailable === 'Yes' || formData.ocAvailable === true,
      expectedPrice: safeNumber(formData.expectedPrice),
      maintenance: safeNumber(formData.maintenancePerMonth) || safeNumber(formData.maintenance),
      
      // Rental specific
      expectedRent: safeNumber(formData.expectedRent),
      securityDeposit: safeNumber(formData.securityDeposit),
      petFriendly: formData.petFriendly === 'Yes' || formData.petFriendly === true,
      
      // Commercial specific fields
      commercialType: formData.commercialType || '',
      washroom: formData.washroom || '',
      additionalInformation: formData.additionalInformation || '',
      
      // Common fields
      amenities: formData.amenities || [],
      furnishing: formData.furnishing || '',
      parking: formData.parking || '',
      terraceGallery: formData.terraceGallery || '',
      cosmoSociety: formData.cosmoSociety === 'Yes' || formData.cosmoSociety === true,
      negotiable: formData.negotiable === 'Yes' || formData.negotiable === true,
      
      // Contact fields
      ownerName: formData.ownerName || '',
      ownerNumber: formData.ownerNumber || '',
      keyAvailable: formData.keyAvailable === 'Yes' || formData.keyAvailable === true,
      connectedPerson: formData.connectedPerson || '',
      
      // Media fields (will be set by file upload service)
      imageUrl: formData.imageUrl || '',
      videoUrl: formData.videoUrl || '',
      
      // New fields
      parkingType: formData.parkingType || '',
      exitDirection: formData.exitDirection || '',
      plusProperty: formData.plusProperty || '',
      plusPropertyType: formData.plusPropertyType || '',
      
      // System fields
      userId: user.id,
      userFullName: user.fullName,
      userMarketingPhoneNumber: user.marketingPhoneNumber || user.phone,
      createdAt: formData.createdAt || now,
      updatedAt: now,
      status: 'Pending Approval',
      isApproved: false,
      listingState: 'Available',
      
      // Property classification
      propertyType: formData.propertyType,
      transactionType: formData.transactionType
    };
  }
}
