import React from "react";
import ContactsCollaterals from "../ContactsCollaterals";

interface Contact {
  name: string;
  phone: string;
}

export function currentStepTabMediaUpload(
  setMediaFiles: React.Dispatch<
    React.SetStateAction<{
      brochure: File | null;
      elevationImages: File[];
      amenitiesImages: File[];
      floorPlanImages: File[];
      projectWalkthrough: File[];
      typologyImages: Record<string, File[]>;
      typologyVideos: Record<string, File | null>;
    }>
  >,
  generatePdfThumbnail: (file: File) => Promise<string | null>,
  setPdfThumbnail: React.Dispatch<React.SetStateAction<string | null>>,
  mediaFiles: {
    brochure: File | null;
    elevationImages: File[];
    amenitiesImages: File[];
    floorPlanImages: File[];
    projectWalkthrough: File[];
    typologyImages: Record<string, File[]>;
    typologyVideos: Record<string, File | null>;
  },
  pdfThumbnail: string | null,
  subTabData: Record<string, any>,
  existingMedia: {
    brochure: string | null;
    elevationImages: string[];
    amenitiesImages: string[];
    floorPlanImages: string[];
    projectWalkthrough: string[];
    typologyImages: Record<string, string[]>;
    typologyVideos: Record<string, string | null>;
  },
  setExistingMedia: React.Dispatch<
    React.SetStateAction<{
      brochure: string | null;
      elevationImages: string[];
      amenitiesImages: string[];
      floorPlanImages: string[];
      projectWalkthrough: string[];
      typologyImages: Record<string, string[]>;
      typologyVideos: Record<string, string | null>;
    }>
  >,
  siteHeads?: Contact[],
  setSiteHeads?: React.Dispatch<React.SetStateAction<Contact[]>>,
  sourcingManagers?: Contact[],
  setSourcingManagers?: React.Dispatch<React.SetStateAction<Contact[]>>
): React.ReactNode {
  // Extract typologies from subTabData
  const typologies = Object.values(subTabData).flatMap(tabData => 
    tabData.pricingConfigs?.map(config => config.typology).filter(Boolean) || []
  );
  const uniqueTypologies = [...new Set(typologies)];

  return (
    <ContactsCollaterals
      siteHeads={siteHeads || [{ name: '', phone: '' }]}
      setSiteHeads={setSiteHeads || (() => {})}
      sourcingManagers={sourcingManagers || [{ name: '', phone: '' }]}
      setSourcingManagers={setSourcingManagers || (() => {})}
      mediaFiles={mediaFiles}
      setMediaFiles={setMediaFiles}
      existingMedia={existingMedia}
      typologies={uniqueTypologies}
    />
  );
}
