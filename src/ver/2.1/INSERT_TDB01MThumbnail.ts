import { productionDB } from "../../productionFirebase";

import { MThumbnail } from "spelieve-common/lib/Models/Thumbnail/TDB01/MThumbnail";
import { Decorations } from "spelieve-common/lib/Models/Thumbnail/TDB02/Decorations";
import { utils } from "../../utils";
import { developmentDB } from "../../developmentFirebase";

const main = async () => {
  const insFirestore = utils.firestore(productionDB);
  const bulkWriter = utils.bulkWriter(insFirestore);
  const insCollection = insFirestore.collection(MThumbnail.modelName);

  const docIDList = [
    "5mN7OLhDg49mQt4WcWrG",
    "P8YiC4nbkK159ho8EHv6",
    "fFhn6l5NyXYZekhgsqKy",
    "fjKgRio90ca5xepVyxgz",
    "hEs5FUY5npyNuafldrlf",
    "qN34QMWHwFzOVQTxZqMC",
  ];

  await Promise.all(
    docIDList.map(async (docID) => {
      const readCollection = developmentDB.collection(MThumbnail.modelName);
      const readDocument = readCollection.doc(docID);

      const readThumbnail = await readDocument.get();
      const readSubCollection = readDocument.collection(Decorations.modelName);
      const readSubCollectionSnapshot = await readSubCollection.get();

      [
        [1, 1],
        [16, 9],
      ].forEach((aspectRatio) => {
        if (readThumbnail.data() === undefined) {
          return;
        }

        const thumbnailID = `${readThumbnail.data()?.ID}-${aspectRatio[0]}_${
          aspectRatio[1]
        }`;

        // readDocument の内容を再帰的に insCollection にコピーする
        const insThumbnail = insCollection.doc(thumbnailID);
        const thumbnail = {
          ...readThumbnail.data(),
        };
        thumbnail.aspectRatio = aspectRatio[0] / aspectRatio[1];
        // createAt に 100年後の日付を設定する
        thumbnail.createdAt = new Date(
          thumbnail.createdAt.toDate().getTime() +
            100 * 365 * 24 * 60 * 60 * 1000
        );
        bulkWriter.create(insThumbnail, thumbnail);

        // Decorations をコピーする
        readSubCollectionSnapshot.forEach((readSubDocument) => {
          const insSubCollection = insThumbnail.collection(
            Decorations.modelName
          );
          const insDecoration = insSubCollection.doc(readSubDocument.id);
          bulkWriter.create(insDecoration, readSubDocument.data());
        });
      });
    })
  );

  bulkWriter.close().then(() => {
    console.log("Bulk write completed.");
  });
};
main();
