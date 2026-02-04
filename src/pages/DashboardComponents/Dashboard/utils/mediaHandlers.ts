export const getMediaSections = (mediaFiles: any, costSheet?: any) => {
  const sections = [];

  if (mediaFiles?.brochure) {
    sections.push({
      name: "Brochure",
      files: [mediaFiles.brochure],
      type: "pdf",
    });
  }
  if (mediaFiles?.elevationImages?.length > 0) {
    sections.push({
      name: "Elevation Images",
      files: mediaFiles.elevationImages,
      type: "image",
    });
  }
  if (mediaFiles?.floorPlanImages?.length > 0) {
    const floorPlanFiles = [...mediaFiles.floorPlanImages];
    
    // Add Unit Plans from typologies to Floor Plan Images
    if (costSheet?.typologies?.length > 0) {
      const unitPlans = costSheet.typologies
        .filter((typology: any) => typology.unitPlanUrl)
        .map((typology: any) => ({
          url: typology.unitPlanUrl,
          name: `${typology.typology || ''} - ${typology.saleableArea || ''} sq.ft.`,
          isUnitPlan: true
        }));
      
      floorPlanFiles.push(...unitPlans);
    }
    
    sections.push({
      name: "Floor Plan Images",
      files: floorPlanFiles,
      type: "image",
    });
  }
  
  if (mediaFiles?.amenitiesImages?.length > 0) {
    sections.push({
      name: "Amenities Images",
      files: mediaFiles.amenitiesImages,
      type: "image",
    });
  }
  if (mediaFiles?.typologyImages) {
    Object.entries(mediaFiles.typologyImages).forEach(
      ([typology, images]: [string, any]) => {
        if (Array.isArray(images) && images.length > 0) {
          sections.push({
            name: `${typology} Images`,
            files: images,
            type: "image",
          });
        }
      }
    );
  }
  if (mediaFiles?.projectWalkthrough?.length > 0) {
    sections.push({
      name: "Project Walkthrough",
      files: mediaFiles.projectWalkthrough,
      type: "video",
    });
  }
  if (mediaFiles?.typologyVideos) {
    Object.entries(mediaFiles.typologyVideos).forEach(
      ([typology, video]: [string, any]) => {
        if (video) {
          sections.push({
            name: `${typology} Video`,
            files: [video],
            type: "video",
          });
        }
      }
    );
  }

  return sections;
};