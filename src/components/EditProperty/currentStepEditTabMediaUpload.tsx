import React from "react";
import ContactsCollaterals from "../ContactsCollaterals";

interface Contact {
  name: string;
  phone: string;
}

export function currentStepEditTabMediaUpload(
  setMediaFiles: React.Dispatch<
    React.SetStateAction<{
      brochure: File | string | null;
      elevationImages: (File | string)[];
      amenitiesImages: (File | string)[];
      floorPlanImages: (File | string)[];
      projectWalkthrough: (File | string)[];
      typologyImages: Record<string, (File | string)[]>;
      typologyVideos: Record<string, File | string | null>;
    }>
  >,
  generatePdfThumbnail: (file: File) => Promise<string | null>,
  setPdfThumbnail: React.Dispatch<React.SetStateAction<string | null>>,
  mediaFiles: {
    brochure: File | string | null;
    elevationImages: (File | string)[];
    amenitiesImages: (File | string)[];
    floorPlanImages: (File | string)[];
    projectWalkthrough: (File | string)[];
    typologyImages: Record<string, (File | string)[]>;
    typologyVideos: Record<string, File | string | null>;
  },
  pdfThumbnail: string | null,
  subTabData: {
    0: {
      wingBuildingNo: string;
      projectStatus: string;
      type: string;
      developerPossession: string;
      reraPossession: string;
      mahaReraNumber: string;
      mahaReraLink: string;
      pricingConfigs: {
        typology: string;
        saleableArea: string;
        reraCarpet: string;
        psfRate: string;
        avRate: string;
        fixedComponent: string;
        possessionCharges: string;
        totalPackage: string;
        negotiationScope: string;
        availability: string;
        unitPlan: null;
      }[];
    };
  },
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
  setSourcingManagers?: React.Dispatch<React.SetStateAction<Contact[]>>,
  projectMessage?: string,
  setProjectMessage?: React.Dispatch<React.SetStateAction<string>>
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