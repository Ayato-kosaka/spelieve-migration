import * as fs from "fs";
import { developmentDB } from "./developmentFirebase";

const EXECUTE_MIGRATION = process.env.EXECUTE_MIGRATION as
  | "migration" // 実際に本番環境に反映する場合は、"migration"を指定する
  | "development" // 開発環境で動作確認する場合は、"development"を指定する
  | undefined; // それ以外の場合は、undefinedを指定することで、ローカルで動作確認できる

const firestore = (firestore: FirebaseFirestore.Firestore) => {
  if (EXECUTE_MIGRATION === "migration") {
    return firestore;
  } else {
    return developmentDB;
  }
};

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
  delete(
    documentRef: FirebaseFirestore.DocumentReference<any>,
    precondition?: FirebaseFirestore.Precondition
  ): Promise<void>;
  close(): Promise<void>;
}
const bulkWriter = (firestore: FirebaseFirestore.Firestore) => {
  console.log("utils.bulkWriter.EXECUTE_MIGRATION", EXECUTE_MIGRATION);
  if (EXECUTE_MIGRATION === "migration") {
    return firestore.bulkWriter();
  } else if (EXECUTE_MIGRATION === "development") {
    return developmentDB.bulkWriter();
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
      delete: (documentRef, precondition) => {
        bulkWriterQue.push({
          documentRef,
          data: {},
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

export const utils = { firestore, bulkWriter };
