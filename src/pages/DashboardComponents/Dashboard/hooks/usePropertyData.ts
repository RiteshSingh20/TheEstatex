import { useState, useEffect, useMemo } from "react";
import { useAuth } from "../../../../utils/authContext";
import {
  getUsers,
  getResaleProperties,
  getRentalProperties,
  getCostSheets,
  getUserActiveSubscriptions,
} from "../../../../utils/firestoreListings";
import { normalizeForEdit } from "../../../../utils/costSheetAdapter";
import { processSubscriptionLocations } from "../utils/subscriptionUtils";
import { CostSheet } from "../../../../components/CompareComponents/Compare";

interface ResaleProperty {
  id: string;
  docId: string;
  isApproved?: boolean;
  userListingState?: string;
  listingState?: string;
  userId?: string;
  society?: string | number;
  sublocation?: string;
  roadLocation?: string;
  expectedPrice?: number;
  floorNo?: string | number;
  flatNo?: string | number;
  contactName?: string;
  ownerName?: string;
  userFullName?: string;
  ownerNumber?: string;
  keyAvailable?: boolean | string;
  userMarketingPhoneNumber?: string;
  contactNumber?: string;
  type?: string;
  station?: string;
  cosmo?: boolean;
  rent?: number;
  deposit?: number;
  possession?: string;
  terrace?: boolean;
  directBroker?: string;
}

interface RentalProperty {
  id: string;
  userId?: string;
  createdAt: string;
  isApproved?: boolean;
  society?: string;
  roadLocation?: string;
  station?: string;
  zone?: string;
  landmark?: string;
  propertyId?: string;
  type?: string;
  terrace?: boolean;
  wing?: string;
  buildingNo?: string | number;
  floorNo?: string | number;
  totalFloors?: string | number;
  flatNo?: string | number;
  cosmo?: boolean;
  masterBed?: boolean;
  furnishing?: string;
  amenities?: string[];
  parking?: string;
  ownership?: string;
  propertyAge?: string | number;
  availableFrom?: string;
  rent?: number;
  deposit?: number;
  connectedPerson?: string;
  keyAvailable?: boolean | string;
  contactName?: string;
  contactNumber?: string;
  contact?: string;
  directBroker?: string;
  listingState?: string;
  userListingState?: string;
  status?: string;
  approvalStatus?: string;
  approvalWorkflow?: { status?: string };
}

export const usePropertyData = () => {
  const { user } = useAuth();
  const [inventory, setInventory] = useState<{
    resale: ResaleProperty[];
    rental: ResaleProperty[];
  }>({
    resale: [],
    rental: [],
  });
  const [inventoryLoaded, setInventoryLoaded] = useState(false);
  const [costSheets, setCostSheets] = useState<CostSheet[]>([]);
  const [rrStationNames, setRRStationNames] = useState<string[]>([]);
  const [ndStationNames, setNDStationNames] = useState<string[]>([]);

  // Load subscriptions
  useEffect(() => {
    if (!user) return;
    let isMounted = true;

    const fetchSubscriptions = async () => {
      try {
        if (user.role === "admin") {
          setRRStationNames([]);
          setNDStationNames([]);
          return;
        }

        const { rrLocations, ndLocations } = await getUserActiveSubscriptions(user.id);

        const rrNames = processSubscriptionLocations(rrLocations);
        const ndNames = processSubscriptionLocations(ndLocations);

        if (isMounted) {
          setRRStationNames(rrNames);
          setNDStationNames(ndNames);
        }
      } catch (error) {
        if (isMounted) {
          setRRStationNames([]);
          setNDStationNames([]);
        }
      }
    };

    fetchSubscriptions();

    return () => {
      isMounted = false;
    };
  }, [user]);

  // Load inventory data
  useEffect(() => {
    if (!user) return;
    let isMounted = true;

    setInventoryLoaded(true);

    const fetchInventoryData = async () => {
      try {
        const isApprovedProperty = (property: any) =>
          property?.isApproved === true ||
          property?.status === "approved" ||
          property?.approvalStatus === "approved" ||
          property?.approvalWorkflow?.status === "approved";

        const allUsers = await getUsers();

        const propertyPromises = allUsers.map(async (u) => {
          const [resale, rental] = await Promise.all([
            getResaleProperties(u.id),
            getRentalProperties(u.id),
          ]);
          return { resale, rental };
        });

        const results = await Promise.all(propertyPromises);

        const allResale: ResaleProperty[] = [];
        const allRental: RentalProperty[] = [];

        results.forEach(({ resale, rental }) => {
          allResale.push(...resale.filter((p) => isApprovedProperty(p)));
          allRental.push(...rental.filter((p) => isApprovedProperty(p)));
        });

        if (isMounted) {
          setInventory({
            resale: allResale,
            rental: allRental as unknown as ResaleProperty[],
          });
        }
      } catch (error) {
        console.error("Error fetching inventory:", error);
      }
    };

    fetchInventoryData();

    return () => {
      isMounted = false;
    };
  }, [user]);

  // Load cost sheets
  useEffect(() => {
    if (!user) return;

    const fetchCostSheets = async () => {
      try {
        const allSheets = await getCostSheets();
        const approvedSheets = allSheets
          .filter((sheet) => {
            return (
              sheet.isApproved === true || sheet.approvalStatus === "approved"
            );
          })
          .map((sheet) => {
            const normalized = normalizeForEdit(sheet);

            if (normalized.dataVersion === "v1") {
              return {
                ...normalized,
                station: normalized.station || normalized.location,
                subLocation: normalized.subLocation || normalized.location,
                possession: normalized.possession || normalized.reraPossession,
                availability:
                  normalized.availibility ||
                  normalized.availability ||
                  "Available",
                brochureUrl:
                  normalized.brochureUrl || normalized.mediaFiles?.brochure,
                imageUrl:
                  normalized.imageUrl ||
                  normalized.mediaFiles?.elevationImages?.[0],
                videoUrl:
                  normalized.videoUrl ||
                  normalized.mediaFiles?.projectWalkthrough?.[0],
                isApproved: true,
              };
            } else {
              return {
                ...normalized,
                station: normalized.location,
                subLocation: normalized.subLocation || normalized.road,
                possession:
                  normalized.possession ||
                  normalized.typologies?.[0]?.developerPossession,
                availability:
                  normalized.typologies?.[0]?.availability || "Available",
                brochureUrl: normalized.mediaFiles?.brochure,
                imageUrl: normalized.mediaFiles?.elevationImages?.[0],
                videoUrl: normalized.mediaFiles?.projectWalkthrough?.[0],
                totalPackage:
                  normalized.totalPackage ||
                  normalized.typologies?.[0]?.totalPackage,
                flatType: normalized.typologies?.[0]?.typology,
                isApproved: true,
              };
            }
          });

        if (
          user &&
          (user.role === "admin" ||
            user.role === "manager" ||
            user.role === "executive" ||
            user.freeTrialActivated)
        ) {
          setCostSheets(approvedSheets);
        } else if (user) {
          const subscriptionLocs = ndStationNames.map((name) =>
            name.toLowerCase()
          );

          setCostSheets(
            approvedSheets.filter((sheet) => {
              const stationToCheck = sheet.station || sheet.location;
              if (!stationToCheck) return false;

              const propertyStation = stationToCheck.toLowerCase().trim();
              const hasMatch = subscriptionLocs.some((subLoc) => {
                const normalizedSubLoc = subLoc.toLowerCase().trim();
                const baseSubLoc = normalizedSubLoc.replace(
                  /\s+(east|west)$/i,
                  ""
                );
                const basePropStation = propertyStation.replace(
                  /\s+(east|west)$/i,
                  ""
                );

                return (
                  normalizedSubLoc === propertyStation ||
                  baseSubLoc === basePropStation ||
                  propertyStation.includes(baseSubLoc) ||
                  normalizedSubLoc.includes(basePropStation)
                );
              });

              return hasMatch;
            })
          );
        }
      } catch (error) {
        console.error("Error fetching cost sheets:", error);
      }
    };

    if (
      user &&
      (user.role === "admin" ||
        user.role === "manager" ||
        user.role === "executive" ||
        user.freeTrialActivated ||
        ndStationNames.length > 0)
    ) {
      fetchCostSheets();
    }
  }, [user, ndStationNames]);

  // Filter inventory based on subscriptions
  const subscriptionFilteredProperties = useMemo(() => {
    if (!inventoryLoaded) {
      return { resale: [], rental: [] };
    }

    if (
      user?.role === "admin" ||
      user?.role === "manager" ||
      user?.role === "executive" ||
      user?.freeTrialActivated
    ) {
      return inventory;
    }

    const subscriptionLocs = rrStationNames.map((name) => name.toLowerCase());

    const filterBySubscription = (properties: any[]) => {
      return properties.filter((property) => {
        if (!property.station) return false;

        const propertyStation = property.station.toLowerCase().trim();
        const hasMatch = subscriptionLocs.some((subLoc) => {
          const normalizedSubLoc = subLoc.toLowerCase().trim();
          const baseSubLoc = normalizedSubLoc.replace(/\s+(east|west)$/i, "");
          const basePropStation = propertyStation.replace(
            /\s+(east|west)$/i,
            ""
          );

          return (
            normalizedSubLoc === propertyStation ||
            baseSubLoc === basePropStation ||
            propertyStation.includes(baseSubLoc) ||
            normalizedSubLoc.includes(basePropStation)
          );
        });

        return hasMatch;
      });
    };

    return {
      resale: filterBySubscription(inventory.resale),
      rental: filterBySubscription(inventory.rental),
    };
  }, [inventory, inventoryLoaded, user, rrStationNames]);

  return {
    inventory,
    inventoryLoaded,
    costSheets,
    rrStationNames,
    ndStationNames,
    subscriptionFilteredProperties,
  };
};
