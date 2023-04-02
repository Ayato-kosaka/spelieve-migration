import * as fs from "fs";

const bulkWriterQue: {
  documentRef: FirebaseFirestore.DocumentReference<any>;
  data: FirebaseFirestore.UpdateData<any>;
  precondition?: FirebaseFirestore.Precondition;
}[] = [];
interface BulkWriter {
  create<T>(
    documentRef: FirebaseFirestore.DocumentReference<T>,
    data: FirebaseFirestore.WithFieldValue<T>
  ): Promise<void>;
  update<T>(
    documentRef: FirebaseFirestore.DocumentReference<T>,
    data: FirebaseFirestore.UpdateData<T>,
    precondition?: FirebaseFirestore.Precondition
  ): Promise<void>;
  close(): Promise<void>;
}
const bulkWriter = (firestore: FirebaseFirestore.Firestore) => {
  if (process.env.EXECUTE_MIGRATION) {
    return firestore.bulkWriter();
  } else {
    return {
      create: (documentRef, data) => {
        bulkWriterQue.push({
          documentRef,
          data,
        });
      },
      update: (documentRef, data, precondition) => {
        bulkWriterQue.push({
          documentRef,
          data,
          precondition,
        });
      },
      close: () => {
        fs.writeFileSync(
          "./bulkWriterOutput.json",
          JSON.stringify(bulkWriterQue, null, "\t")
        );
        return Promise.resolve();
      },
    } as BulkWriter;
  }
};

export const utils = { bulkWriter };
