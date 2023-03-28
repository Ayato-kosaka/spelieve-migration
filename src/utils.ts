import * as fs from "fs";

const bulkWriterQue: {
  documentRef: FirebaseFirestore.DocumentReference<any>;
  data: FirebaseFirestore.UpdateData<any>;
  precondition?: FirebaseFirestore.Precondition;
}[] = [];
const bulkWriter = (firestore: FirebaseFirestore.Firestore) => {
  if (process.env.EXECUTE_MIGRATION) {
    return firestore.bulkWriter();
  } else {
    return {
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
    } as {
      update<T>(
        documentRef: FirebaseFirestore.DocumentReference<T>,
        data: FirebaseFirestore.UpdateData<T>,
        precondition?: FirebaseFirestore.Precondition
      ): Promise<void>;
      close(): Promise<void>;
    };
  }
};

export const utils = { bulkWriter };
