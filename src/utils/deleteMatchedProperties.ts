import { collection, query, where, getDocs, deleteDoc, doc } from "firebase/firestore";
import { db } from "./firebase";

export const deleteMatchedPropertiesFromOldDB = async (projectName: string) => {
  try {
    const costSheetsRef = collection(db, "costSheets");
    const q = query(costSheetsRef, where("projectName", "==", projectName));
    const querySnapshot = await getDocs(q);
    
    const deletePromises = querySnapshot.docs.map(docSnapshot => 
      deleteDoc(doc(db, "costSheets", docSnapshot.id))
    );
    
    await Promise.all(deletePromises);
  } catch (error) {
    throw error;
  }
};