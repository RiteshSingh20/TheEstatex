import { User } from "firebase/auth";
import React from "react";
import { FormDataType, stepDefinitions } from "../../pages/CostSheetFormProps";
import { State, City } from "../../types";
import { StampDutyRate } from "../CompareModal";
import Button from "../ui/Button";
import Card from "../ui/Card";
import Tabs from "../ui/Tabs";
import { currentStepTab4 } from "./currentStepTab4";
import { currentStepTab0 } from "./currentStepTab0";
import { currentStepTab1 } from "./currentStepTab1";
import { currentStepTab2 } from "./currentStepTab2";
import { currentStepTabMediaUpload } from "./currentStepTabMediaUpload";
import { currentStepTab3 } from "./currentStepTab3";
import { currentStepTab5 } from "./currentStepTab5";

export function handleNewEntryForm(
  allowedSteps: boolean[],
  currentStep: number,
  formData: FormDataType,
  setFormData: React.Dispatch<React.SetStateAction<FormDataType>>,
  states: State[],
  selectedStateCode: string,
  handleStateChange: (e: React.ChangeEvent<HTMLSelectElement>) => Promise<void>,
  stampRates: StampDutyRate[],
  setShowJurisdictionModal: React.Dispatch<React.SetStateAction<boolean>>,
  cities: City[],
  handleInputChange: (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => void,
  subTabs: { id: number; name: string }[],
  setActiveSubTab: React.Dispatch<React.SetStateAction<number>>,
  activeSubTab: number,
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
  setSubTabData: React.Dispatch<
    React.SetStateAction<{
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
    }>
  >,
  setSubTabs: React.Dispatch<
    React.SetStateAction<{ id: number; name: string }[]>
  >,
  formatIndianCurrency: (value: string | number) => string,
  parseIndianCurrency: (value: string) => string,
  setFloorRiseConfig: React.Dispatch<
    React.SetStateAction<{
      startsFrom: string;
      rate: string;
      fixedRateStartsFrom: string;
      typologyRates: Record<string, string>;
    }>
  >,
  setFloorBandConfig: React.Dispatch<
    React.SetStateAction<
      { fromFloor: string; toFloor: string; rates: Record<string, string> }[]
    >
  >,
  floorRiseConfig: {
    startsFrom: string;
    rate: string;
    fixedRateStartsFrom: string;
    typologyRates: Record<string, string>;
  },
  floorBandConfig: {
    fromFloor: string;
    toFloor: string;
    rates: Record<string, string>;
  }[],
  paymentSchemes: {
    schemeName: string;
    description: string;
    fromDate: string;
    toDate: string;
  }[],
  setPaymentSchemes: React.Dispatch<
    React.SetStateAction<
      {
        schemeName: string;
        description: string;
        fromDate: string;
        toDate: string;
      }[]
    >
  >,
  ladderSections: {
    id: number;
    startDate: string;
    endDate: string;
    rows: { units: string; ladder: string; additionalIncentive: string }[];
  }[],
  setLadderSections: React.Dispatch<
    React.SetStateAction<
      {
        id: number;
        startDate: string;
        endDate: string;
        rows: { units: string; ladder: string; additionalIncentive: string }[];
      }[]
    >
  >,
  activeCategory: { label: string; fields: string[] },
  stationSearchTerm: string,
  setStationSearchTerm: React.Dispatch<React.SetStateAction<string>>,
  setSelectedStationIndex: React.Dispatch<React.SetStateAction<number>>,
  setShowStationDropdown: React.Dispatch<React.SetStateAction<boolean>>,
  stationOptions: { value: string; label: string }[],
  selectedStationIndex: number,
  showStationDropdown: boolean,
  customAmenities: Record<string, string[]>,
  expandedAmenities: Record<string, boolean>,
  setExpandedAmenities: React.Dispatch<
    React.SetStateAction<Record<string, boolean>>
  >,
  addingAmenityFor: string | null,
  customAmenityInput: Record<string, string>,
  setCustomAmenityInput: React.Dispatch<React.SetStateAction<Record<string, string>>>,
  user: User | null,
  setCustomAmenities: React.Dispatch<
    React.SetStateAction<Record<string, string[]>>
  >,
  setAddingAmenityFor: React.Dispatch<React.SetStateAction<string | null>>,
  setCurrentAmenityField: React.Dispatch<React.SetStateAction<string>>,
  setShowAmenityModal: React.Dispatch<React.SetStateAction<boolean>>,
  calculateTotalPackage: () => string,
  numberFields: string[],
  siteHeads: { name: string; contact: string }[],
  setSiteHeads: React.Dispatch<
    React.SetStateAction<{ name: string; contact: string }[]>
  >,
  sourcingManagers: { name: string; contact: string }[],
  setSourcingManagers: React.Dispatch<
    React.SetStateAction<{ name: string; contact: string }[]>
  >,
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
  setCurrentStep: React.Dispatch<React.SetStateAction<number>>,
  totalSteps: number,
  isStepValid: boolean,
  isLoading: boolean,
  handleSubmitForm: (e: React.FormEvent) => Promise<void>,
  showJurisdictionModal: boolean
): React.ReactNode {
  return (
    <Card>
      <Tabs
        tabs={stepDefinitions.map((step, index) => ({
          id: `step-${index}`,
          label: step.label,
          disabled: !allowedSteps[index],
          content: (
            <div className="p-6">
              <form onSubmit={(e) => e.preventDefault()} className="space-y-6">
                {currentStep === 0
                  ? currentStepTab0(
                      formData,
                      setFormData,
                      states,
                      selectedStateCode,
                      handleStateChange,
                      stampRates,
                      setShowJurisdictionModal,
                      cities,
                      handleInputChange
                    )
                  : currentStep === 1
                  ? currentStepTab1(
                      subTabs,
                      setActiveSubTab,
                      activeSubTab,
                      subTabData,
                      setSubTabData,
                      setSubTabs,
                      formatIndianCurrency,
                      parseIndianCurrency,
                      stampRates,
                      formData
                    )
                  : currentStep === 2
                  ? currentStepTab2(
                      formData,
                      handleInputChange,
                      setFloorRiseConfig,
                      setFloorBandConfig,
                      formatIndianCurrency,
                      parseIndianCurrency,
                      setFormData,
                      floorRiseConfig,
                      subTabData,
                      floorBandConfig
                    )
                  : currentStep === 3
                  ? currentStepTab3(
                      activeCategory,
                      formData,
                      stationSearchTerm,
                      setStationSearchTerm,
                      setSelectedStationIndex,
                      setShowStationDropdown,
                      setFormData,
                      stationOptions,
                      selectedStationIndex,
                      showStationDropdown,
                      states,
                      selectedStateCode,
                      handleStateChange,
                      cities,
                      handleInputChange,
                      customAmenities,
                      expandedAmenities,
                      setExpandedAmenities,
                      addingAmenityFor,
                      customAmenityInput,
                      setCustomAmenityInput,
                      user,
                      setCustomAmenities,
                      setAddingAmenityFor,
                      setCurrentAmenityField,
                      setShowAmenityModal,
                      calculateTotalPackage,
                      numberFields,
                      subTabData
                    )
                  : currentStep === 4
                  ? currentStepTab4(
                      paymentSchemes,
                      setPaymentSchemes,
                      ladderSections,
                      setLadderSections
                    )
                  : currentStep === 5
                  ? (
                      <>
                        {currentStepTab5(
                          siteHeads,
                          setSiteHeads,
                          sourcingManagers,
                          setSourcingManagers
                        )}
                        {currentStepTabMediaUpload(
                          setMediaFiles,
                          generatePdfThumbnail,
                          setPdfThumbnail,
                          mediaFiles,
                          pdfThumbnail,
                          subTabData,
                          existingMedia,
                          setExistingMedia
                        )}
                      </>
                    )
                  : null}

                <div className="flex justify-between mt-6">
                  {currentStep > 0 ? (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setCurrentStep((s) => s - 1)}
                    >
                      ← Back
                    </Button>
                  ) : (
                    <div />
                  )}

                  {currentStep < totalSteps - 1 ? (
                    <Button
                      type="button"
                      onClick={() => setCurrentStep((s) => s + 1)}
                      // disabled={!isStepValid}
                      variant={isStepValid ? "primary" : "outline"}
                      className="disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Next →
                    </Button>
                  ) : (
                    <Button
                      type="submit"
                      variant="primary"
                      isLoading={isLoading}
                      onClick={handleSubmitForm}
                    >
                      {formData.id ? "Update" : "Submit"}
                    </Button>
                  )}
                </div>
              </form>
            </div>
          ),
        }))}
        activeTab={`step-${currentStep}`}
        onTabChange={(tabId) => {
          const stepIndex = parseInt(tabId.split("-")[1]);
          if (allowedSteps[stepIndex]) {
            setCurrentStep(stepIndex);
          }
        }}
      />

      {/* Jurisdiction Modal */}
      {showJurisdictionModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white shadow-2xl rounded-2xl p-6 sm:p-8 w-full max-w-md mx-4 animate-in fade-in zoom-in">
            <div className="flex items-center space-x-3 mb-4">
              <div className="flex items-center justify-center w-10 h-10 rounded-full bg-red-100">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-6 h-6 text-red-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L4.34 16c-.77 1.333.192 3 1.732 3z"
                  />
                </svg>
              </div>
              <h3 className="text-lg sm:text-xl font-semibold text-red-600">
                Jurisdiction Not Found
              </h3>
            </div>

            <p className="text-gray-700 mb-3">
              We couldn’t find jurisdiction data required to calculate the Stamp
              Duty for the selected district:
              <span className="font-medium text-gray-900 ml-1">
                {formData.district}
              </span>
              .
            </p>

            <p className="text-gray-600 mb-6">
              Please verify the district selection or contact your administrator
              to update the jurisdiction details.
            </p>

            <div className="flex justify-end">
              <button
                onClick={() => setShowJurisdictionModal(false)}
                className="bg-blue-600 text-white px-5 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                OK
              </button>
            </div>
          </div>
        </div>
      )}
    </Card>
  );
}
