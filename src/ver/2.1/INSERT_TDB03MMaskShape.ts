import { productionDB, productionStorage } from "../../productionFirebase";

import { MMaskShape } from "spelieve-common/lib/Models/Thumbnail/TDB03/MMaskShape";
import { utils } from "../../utils";

const main = async () => {
  const truncateFirestore = utils.firestore(productionDB);
  const collection = truncateFirestore.collection(MMaskShape.modelName);

  const bulkWriter = utils.bulkWriter(truncateFirestore);

  const bucket = productionStorage.bucket();
  const filePaths = [
    "MMaskShape/circle.png",
    "MMaskShape/rectangle.png",
    "MMaskShape/triangle.png",
  ];

  await Promise.all(
    filePaths.map(async (filePath) => {
      const file = bucket.file(filePath);

      const url = await file.getSignedUrl({
        action: "read",
        expires: "03-01-2500", // 永久的な値を設定
      });
      const documentRef = collection.doc(filePath.split("/").slice(-1)[0]);
      const ins: MMaskShape = {
        storageUrl: url[0],
        attachedCount: 100,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      bulkWriter.create(documentRef, ins);
    })
  );

  bulkWriter.close().then(() => {
    console.log("Bulk write completed.");
  });
};
main();
