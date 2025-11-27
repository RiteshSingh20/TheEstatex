import { useState, useEffect } from "react";
import { User } from "../types";
import { Property, Inventory } from "../types/admin";
import {
  getUsers,
  getResaleProperties,
  getRentalProperties,
} from "../utils/firestoreListings";
import { collection, onSnapshot, getDocs, Timestamp } from "firebase/firestore";
import { db } from "../utils/firebase";
import toast from "react-hot-toast";

export const useAdminData = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [inventory, setInventory] = useState<Inventory>({
    resale: [],
    rental: [],
    newProperties: [],
  });
  const [loading, setLoading] = useState(true);
  const [userDataMap, setUserDataMap] = useState<{ [key: string]: User }>({});
  const [userSubscriptions, setUserSubscriptions] = useState<any[]>([]);
  const [loadingSubscriptions, setLoadingSubscriptions] = useState(false);

  const fetchUserSubscriptions = async (userId: string) => {
    try {
      setLoadingSubscriptions(true);
      const subscriptionsRef = collection(db, `users/${userId}/subscriptions`);
      const querySnapshot = await getDocs(subscriptionsRef);

      const subscriptions = querySnapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          startDate:
            data.startDate instanceof Timestamp
              ? data.startDate
              : Timestamp.fromDate(new Date(data.startDate)),
          endDate:
            data.endDate instanceof Timestamp
              ? data.endDate
              : Timestamp.fromDate(new Date(data.endDate)),
        };
      });

      setUserSubscriptions(subscriptions);
    } catch (error) {
      
      toast.error("Failed to load subscriptions");
    } finally {
      setLoadingSubscriptions(false);
    }
  };

  useEffect(() => {
    let costSheetsUnsubscribe: (() => void) | undefined;

    const fetchData = async () => {
      try {
        setLoading(true);
        const allUsers = await getUsers();

        const usersWithCounts = await Promise.all(
          allUsers.map(async (user: User) => {
            const subscriptionsRef = collection(
              db,
              `users/${user.id}/subscriptions`
            );
            const querySnapshot = await getDocs(subscriptionsRef);
            const subscriptionCount = querySnapshot.size;

            return {
              ...user,
              subscriptionCount,
              role: user.role || "user",
              id: user.id,
              fullName: user.fullName,
              phone: user.phone,
              email: user.email,
              city: user.city,
              state: user.state,
              reraNumber: user.reraNumber,
              isAdmin: user.role === "admin",
              password: "",
              location: { lat: 0, lng: 0 },
            };
          })
        );

        setUsers(usersWithCounts);

        const userMap: { [key: string]: User } = {};
        usersWithCounts.forEach((user) => {
          userMap[user.id] = user;
        });
        setUserDataMap(userMap);

        const resalePromises = usersWithCounts.map((user) =>
          getResaleProperties(user.id)
        );
        const rentalPromises = usersWithCounts.map((user) =>
          getRentalProperties(user.id)
        );

        const allResaleResults = await Promise.all(resalePromises);
        const allRentalResults = await Promise.all(rentalPromises);

        const { getCostSheets } = await import("../utils/firestoreListings");
        const allNewProperties = await getCostSheets();

        costSheetsUnsubscribe = onSnapshot(
          collection(db, "TestCostSheets"),
          (snapshot) => {
            const updatedNewProperties = snapshot.docs.map((doc) => ({
              id: doc.id,
              ...doc.data(),
            }));
            setInventory((prev) => ({
              ...prev,
              newProperties: updatedNewProperties,
            }));
          },
          (error) => {
            
          }
        );

        const allResale = allResaleResults.flat().map((prop: Property) => ({
          ...prop,
          createdAt: prop.createdAt,
        }));

        const allRental = allRentalResults.flat().map((prop: Property) => ({
          ...prop,
          createdAt: prop.createdAt,
        }));

        setInventory({
          resale: allResale,
          rental: allRental,
          newProperties: allNewProperties,
        });
      } catch (error) {
        
        toast.error("Failed to fetch admin data. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();

    return () => {
      if (typeof costSheetsUnsubscribe === "function") {
        costSheetsUnsubscribe();
      }
    };
  }, []);

  return {
    users,
    inventory,
    loading,
    userDataMap,
    fetchUserSubscriptions,
    userSubscriptions,
    loadingSubscriptions,
  };
};
