import { useState, useEffect } from "react";
import Card from "../../components/ui/Card";
import Input from "../../components/ui/Input";
import Button from "../../components/ui/Button";
import { getStampDutyRates } from "../../utils/firestoreListings";
import {
  collection,
  onSnapshot,
  doc,
  setDoc,
  updateDoc,
  deleteDoc,
} from "firebase/firestore";
import { db } from "../../utils/firebase";
import toast from "react-hot-toast";
import { StampDutyRate } from "../CompareComponents/Compare";

export const StampDutyTab = () => {
  const [rates, setRates] = useState<StampDutyRate[]>([]);
  const [newRate, setNewRate] = useState({
    jurisdiction: "",
    rate: "",
  });

  useEffect(() => {
    const unsubscribe = onSnapshot(
      collection(db, "stampDutyRates"),
      (snapshot) => {
        const liveRates: StampDutyRate[] = snapshot.docs.map((doc) => {
          const data = doc.data() as Omit<StampDutyRate, "id">;
          return {
            id: doc.id,
            ...data,
          };
        });
        setRates(liveRates);
      }
    );

    return () => unsubscribe();
  }, []);

  const toTitleCase = (str: string): string => {
    return str.replace(
      /\w\S*/g,
      (txt) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
    );
  };

  const handleAddRate = async () => {
    if (!newRate.jurisdiction || !newRate.rate) {
      toast.error("All fields are required");
      return;
    }

    try {
      const allDocs = await getStampDutyRates();
      const inputJurisdiction = newRate.jurisdiction.trim().toLowerCase();
      const inputRate = newRate.rate.trim();

      const existingDoc = allDocs.docs.find((doc) => {
        const data = doc.data();
        const existingJurisdiction = data.jurisdiction?.toLowerCase().trim();
        return existingJurisdiction === inputJurisdiction;
      });

      const formattedJurisdiction = toTitleCase(newRate.jurisdiction.trim());

      if (existingDoc) {
        const existingData = existingDoc.data();
        const existingRate = existingData.rate?.toString().trim();

        if (existingRate === inputRate) {
          toast.error("Jurisdiction already exists with the same rate.");
          return;
        }

        await updateDoc(doc(db, "stampDutyRates", existingDoc.id), {
          jurisdiction: formattedJurisdiction,
          rate: newRate.rate,
        });
        toast.success("Stamp Duty rate updated!");
      } else {
        const ref = doc(collection(db, "stampDutyRates"));
        await setDoc(ref, {
          jurisdiction: formattedJurisdiction,
          rate: newRate.rate,
        });
        toast.success("Stamp Duty rate added!");
      }

      setNewRate({ jurisdiction: "", rate: "" });
      const updatedRates = await getStampDutyRates();
      setRates(updatedRates);
    } catch (err) {
      toast.error("Failed to save rate");
    }
  };

  const handleDeleteRate = async (id: string) => {
    try {
      await deleteDoc(doc(db, "stampDutyRates", id));
      toast.success("Stamp Duty rate deleted!");
      const updatedRates = await getStampDutyRates();
      setRates(updatedRates);
    } catch (error) {
      toast.error("Failed to delete stamp duty rate");
    }
  };

  return (
    <Card className="p-6 rounded-2xl shadow-md border border-neutral-200 bg-white">
      <div className="mb-6">
        <h3 className="text-2xl font-semibold text-neutral-800">
          🏛️ Manage Stamp Duty Rates
        </h3>
        <p className="text-sm text-neutral-500 mt-1">
          Add or update stamp duty rates based on station-wise jurisdiction.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Input
          id="stampDutyJurisdiction"
          label="Jurisdiction"
          placeholder="e.g., Thane"
          value={newRate.jurisdiction}
          onChange={(e) =>
            setNewRate({ ...newRate, jurisdiction: e.target.value })
          }
        />
        <Input
          id="stampDutyRate"
          type="text"
          inputMode="numeric"
          label="Stamp Duty Rate (%)"
          placeholder="e.g., 6"
          value={newRate.rate}
          onChange={(e) => setNewRate({ ...newRate, rate: e.target.value })}
        />
      </div>

      <div className="flex justify-end">
        <Button
          onClick={handleAddRate}
          className="px-6 py-2 text-sm font-medium rounded-lg"
        >
          ➕ Add / Update Rate
        </Button>
      </div>

      {rates.length > 0 && (
        <div className="mt-8">
          <h4 className="text-lg font-semibold text-neutral-700 mb-3">
            📍 Existing Rates
          </h4>
          <ul className="space-y-2">
            {rates.map((rate) => (
              <li
                key={rate.id}
                className="flex items-center justify-between px-4 py-2 bg-neutral-50 border border-neutral-200 rounded-md text-sm text-neutral-700"
              >
                <div className="flex flex-col sm:flex-row sm:items-center sm:gap-4">
                  <span className="font-medium">{rate.jurisdiction}</span>
                  <span className="text-primary font-semibold">
                    {rate.rate}%
                  </span>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() =>
                      setNewRate({
                        jurisdiction: rate.jurisdiction,
                        rate: String(rate.rate),
                      })
                    }
                    className="text-blue-500 hover:underline text-xs"
                  >
                    ✏️ Edit
                  </button>
                  <button
                    onClick={() => handleDeleteRate(rate.id)}
                    className="text-red-500 hover:underline text-xs"
                  >
                    🗑️ Delete
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </Card>
  );
};
