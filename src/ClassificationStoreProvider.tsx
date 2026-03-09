import { useState, useCallback, ReactNode } from "react";
import {
  ClassificationStoreContext,
  ClassificationRecord,
  SEED_RECORDS,
} from "./classificationStore";

export function ClassificationStoreProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [records, setRecords] = useState<ClassificationRecord[]>(SEED_RECORDS);

  const addRecord = useCallback((record: ClassificationRecord) => {
    setRecords((prev) => [...prev, record]);
  }, []);

  const getRecord = useCallback(
    (id: string) => records.find((r) => r.id === id),
    [records]
  );

  return (
    <ClassificationStoreContext.Provider
      value={{ records, addRecord, getRecord }}
    >
      {children}
    </ClassificationStoreContext.Provider>
  );
}
