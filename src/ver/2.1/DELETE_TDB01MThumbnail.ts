import { productionDB } from "../../productionFirebase";

import { MThumbnail } from "spelieve-common/lib/Models/Thumbnail/TDB01/MThumbnail";
import { Decorations } from "spelieve-common/lib/Models/Thumbnail/TDB02/Decorations";
import { utils } from "../../utils";
import { developmentDB } from "../../developmentFirebase";

const main = async () => {
  const delFirestore = utils.firestore(productionDB);
  const bulkWriter = utils.bulkWriter(delFirestore);
  const delCollection = delFirestore.collection(MThumbnail.modelName);

  const docIDList = [
    "5mN7OLhDg49mQt4WcWrG",
    "P8YiC4nbkK159ho8EHv6",
    "fFhn6l5NyXYZekhgsqKy",
    "fjKgRio90ca5xepVyxgz",
    "hEs5FUY5npyNuafldrlf",
    "qN34QMWHwFzOVQTxZqMC",
  ];

  const snapshot = await delCollection.get();
  await Promise.all(
    snapshot.docs.map(async (doc) => {
      if (docIDList.includes(doc.id)) {
        return;
      }
      const decorationSnapshot = await doc.ref
        .collection(Decorations.modelName)
        .get();
      decorationSnapshot.forEach((decorationDoc) => {
        bulkWriter.delete(decorationDoc.ref);
      });
      bulkWriter.delete(doc.ref);
    })
  );
  bulkWriter.close().then(() => {
    console.log("Bulk write completed.");
  });
};
main();
