import { useQuery } from "@tanstack/react-query";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { SystemSettings } from "@shared/schema";

const fetchSystemSettings = async (): Promise<SystemSettings | null> => {
    const settingsDocRef = doc(db, "systemSettings", "default");
    const docSnap = await getDoc(settingsDocRef);

    if (docSnap.exists()) {
        const data = docSnap.data();
        return {
            id: docSnap.id,
            ...data,
            createdAt: data.createdAt.toDate(),
            updatedAt: data.updatedAt.toDate(),
        } as SystemSettings;
    }
    return null;
};


export function useSystemSettings() {
  const { data: settings, isLoading } = useQuery({
    queryKey: ["systemSettings"],
    queryFn: fetchSystemSettings
  });

  return { settings, isLoading };
}
