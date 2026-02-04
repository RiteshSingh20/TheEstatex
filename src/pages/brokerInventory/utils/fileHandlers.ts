// File validation utilities
export const validateImageFile = (file: File): boolean => {
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
  const maxSize = 5 * 1024 * 1024; // 5MB
  
  return allowedTypes.includes(file.type) && file.size <= maxSize;
};

export const validateVideoFile = (file: File): boolean => {
  const allowedTypes = ['video/mp4', 'video/avi', 'video/mov', 'video/wmv'];
  const maxSize = 50 * 1024 * 1024; // 50MB
  
  return allowedTypes.includes(file.type) && file.size <= maxSize;
};

// File preview utilities
export const createImagePreview = (file: File): Promise<string> => {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => resolve(e.target?.result as string);
    reader.readAsDataURL(file);
  });
};

export const createVideoThumbnail = (file: File): Promise<string> => {
  return new Promise((resolve) => {
    const video = document.createElement('video');
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    video.onloadedmetadata = () => {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      video.currentTime = 1; // Get frame at 1 second
    };
    
    video.onseeked = () => {
      ctx?.drawImage(video, 0, 0);
      resolve(canvas.toDataURL());
    };
    
    video.src = URL.createObjectURL(file);
  });
};

// File list management
export const removeFileFromList = (fileList: FileList, index: number): File[] => {
  const files = Array.from(fileList);
  files.splice(index, 1);
  return files;
};

export const addFileToList = (existingFiles: File[], newFile: File): File[] => {
  return [...existingFiles, newFile];
};