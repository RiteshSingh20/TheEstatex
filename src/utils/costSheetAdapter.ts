// Data adapter to handle both old (v1) and new (v2) cost sheet structures
export interface NormalizedCostSheet {
  id: string;
  projectName: string;
  developerName: string;
  location: string;
  typologies: Array<{
    typology: string;
    totalPackage: string;
    availability: string;
    psfRate: string;
    saleableArea: string;
  }>;
  dataVersion: 'v1' | 'v2';
  collection: string;
  createdAt: any;
  // Add other common fields as needed
}

// Enhanced normalization for edit form population
export const normalizeForEdit = (rawData: any) => {
  const dataVersion = rawData.dataVersion || (rawData.typologies ? 'v2' : 'v1');
  
  if (dataVersion === 'v2') {
    // New structure - return as is with proper data version
    return {
      ...rawData,
      dataVersion: 'v2'
    };
  } else {
    // Old structure - create minimal structure, let currentStepEditTab1 handle RERA fetching
    const enhanced = {
      ...rawData,
      dataVersion: 'v1',
      // Map old field names to new field names
      location: rawData.location || rawData.station || "",
      subLocation: rawData.subLocation || "",
      road: rawData.road || "",
      landmark: rawData.landmark || "",
      // Map amenity arrays from old format
      apartmentAmenities: rawData.apartmentAmenities || [],
      projectAmenities: rawData.projectAmenities || [],
      // Create minimal subTabData - will be populated by currentStepEditTab1
      subTabData: {
        0: {
          wingBuildingNo: rawData.wingBuildingNo || "",
          projectStatus: rawData.projectStatus || "",
          type: rawData.type || "",
          developerPossession: rawData.developerPossession || "",
          reraPossession: rawData.reraPossession || "",
          mahaReraNumber: rawData.mahaReraNumber || "",
          mahaReraLink: rawData.mahaReraLink || "",
          pricingConfigs: [
            {
              typology: rawData.flatType || "",
              saleableArea: rawData.saleableArea || "",
              reraCarpet: rawData.reraCarpet || "",
              psfRate: rawData.psfRate || "",
              avRate: rawData.avRate || "",
              fixedComponent: rawData.fixedComponent || "",
              possessionCharges: rawData.possessionCharges || "",
              totalPackage: rawData.totalPackage || "",
              negotiationScope: rawData.negotiationScope || "",
              availability: rawData.availibility || rawData.availability || "",
              unitPlan: null,
            },
          ],
        },
      },
      floorRiseConfig: rawData.floorRiseConfig || {
        startsFrom: "",
        rate: "",
        fixedRateStartsFrom: "",
        typologyRates: {},
      },
      floorBandConfig: rawData.floorBandConfig || [
        { fromFloor: "", toFloor: "", rates: {} },
      ],
      paymentSchemes: rawData.paymentSchemes || (rawData.paymentScheme ? 
        (Array.isArray(rawData.paymentScheme) 
          ? rawData.paymentScheme.map((scheme: string) => ({
              schemeName: scheme,
              description: "",
              fromDate: "",
              toDate: ""
            }))
          : [{
              schemeName: rawData.paymentScheme,
              description: "",
              fromDate: "",
              toDate: ""
            }]
        ) : [{ schemeName: "", description: "", fromDate: "", toDate: "" }]
      ),
      ladderSections: rawData.ladderSections || [
        {
          id: 1,
          startDate: "",
          endDate: "",
          rows: [{ units: "", ladder: "", additionalIncentive: "" }],
        },
      ],
      siteHeads: rawData.siteHeads || (rawData.siteHeadName || rawData.siteHeadNumber ? 
        [{
          name: rawData.siteHeadName || "",
          contact: rawData.siteHeadNumber || "",
        }] : [{ name: "", contact: "" }]
      ),
      sourcingManagers: rawData.sourcingManagers || (rawData.smName || rawData.smContact ? 
        [{
          name: rawData.smName || "",
          contact: rawData.smContact || "",
        }] : [{ name: "", contact: "" }]
      ),
    };
    
    return enhanced;
  }
};

export const normalizeCostSheet = (rawData: any): NormalizedCostSheet => {
  const { dataVersion, collection, id, createdAt } = rawData;

  if (dataVersion === 'v2') {
    // New structure - already normalized
    return {
      id,
      projectName: rawData.projectName || '',
      developerName: rawData.developerName || '',
      location: rawData.location || '',
      typologies: rawData.typologies || [],
      dataVersion,
      collection,
      createdAt
    };
  } else {
    // Old structure - convert to new format
    const typologies = [];
    
    // Extract typology data from old structure
    if (rawData.flatType && rawData.totalPackage) {
      typologies.push({
        typology: rawData.flatType,
        totalPackage: rawData.totalPackage,
        availability: rawData.availibility || rawData.availability || '',
        psfRate: rawData.psfRate || '',
        saleableArea: rawData.saleableArea || ''
      });
    }

    return {
      id,
      projectName: rawData.projectName || '',
      developerName: rawData.developerName || '',
      location: rawData.location || rawData.station || rawData.roadLocation || '',
      typologies,
      dataVersion: 'v1',
      collection,
      createdAt
    };
  }
};

export const denormalizeCostSheet = (normalizedData: NormalizedCostSheet, targetVersion: 'v1' | 'v2') => {
  if (targetVersion === 'v2') {
    // Convert to new structure
    return {
      projectName: normalizedData.projectName,
      developerName: normalizedData.developerName,
      location: normalizedData.location,
      typologies: normalizedData.typologies
    };
  } else {
    // Convert to old structure (take first typology)
    const firstTypology = normalizedData.typologies[0] || {};
    return {
      projectName: normalizedData.projectName,
      developerName: normalizedData.developerName,
      location: normalizedData.location,
      flatType: firstTypology.typology,
      totalPackage: firstTypology.totalPackage,
      availibility: firstTypology.availability,
      psfRate: firstTypology.psfRate,
      saleableArea: firstTypology.saleableArea
    };
  }
};