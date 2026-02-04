import { 
  ref, 
  uploadBytes, 
  getDownloadURL, 
  deleteObject 
} from 'firebase/storage';
import { storage } from '../../../utils/firebase';

export class FileUploadService {
  private basePath = 'properties';

  async uploadImages(images: FileList): Promise<string[]> {
    try {
      const uploadPromises = Array.from(images).map(async (image, index) => {
        const fileName = `${Date.now()}_${index}_${image.name}`;
        const imagePath = `${this.basePath}/images/${fileName}`;
        const imageRef = ref(storage, imagePath);
        
        await uploadBytes(imageRef, image);
        return await getDownloadURL(imageRef);
      });

      return await Promise.all(uploadPromises);
    } catch (error) {
      console.error('Error uploading images:', error);
      throw new Error('Failed to upload images');
    }
  }

  async uploadVideo(video: File): Promise<string> {
    try {
      const fileName = `${Date.now()}_${video.name}`;
      const videoPath = `${this.basePath}/videos/${fileName}`;
      const videoRef = ref(storage, videoPath);
      
      await uploadBytes(videoRef, video);
      return await getDownloadURL(videoRef);
    } catch (error) {
      console.error('Error uploading video:', error);
      throw new Error('Failed to upload video');
    }
  }

  async deleteFiles(urls: string[]): Promise<void> {
    try {
      const deletePromises = urls.map(async (url) => {
        if (url) {
          const fileRef = ref(storage, url);
          await deleteObject(fileRef);
        }
      });

      await Promise.all(deletePromises);
    } catch (error) {
      console.error('Error deleting files:', error);
      throw new Error('Failed to delete files');
    }
  }

  validateImageFile(file: File): boolean {
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
    const maxSize = 5 * 1024 * 1024; // 5MB
    
    return allowedTypes.includes(file.type) && file.size <= maxSize;
  }

  validateVideoFile(file: File): boolean {
    const allowedTypes = ['video/mp4', 'video/avi', 'video/mov', 'video/wmv'];
    const maxSize = 50 * 1024 * 1024; // 50MB
    
    return allowedTypes.includes(file.type) && file.size <= maxSize;
  }

  validateFiles(images?: FileList, video?: File): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (images) {
      if (images.length > 20) {
        errors.push('Maximum 20 images allowed');
      }

      Array.from(images).forEach((image, index) => {
        if (!this.validateImageFile(image)) {
          errors.push(`Image ${index + 1}: Invalid type or size too large (max 5MB)`);
        }
      });
    }

    if (video && !this.validateVideoFile(video)) {
      errors.push('Video: Invalid type or size too large (max 50MB)');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }
}