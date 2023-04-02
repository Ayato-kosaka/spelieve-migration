import { productionDB, productionStorage } from "../../productionFirebase";

import { MMaskShape } from "spelieve-common/lib/Models/Thumbnail/TDB03/MMaskShape";
import { Itineraries as ItinerariesV2_1 } from "spelieve-common/lib/Models/Itinerary/IDB01/Itineraries";
import { Itineraries as ItinerariesV2_0 } from "spelieve-common-v2.0/lib/Models/Itinerary/IDB01/Itineraries";
import { utils } from "../../utils";
import { developmentDB, developmentStorage } from "../../developmentFirebase";

const main = async () => {
  //   const bulkWriter = utils.bulkWriter(productionDB);
  const bulkWriter = utils.bulkWriter(developmentDB);

  const bucket = productionStorage.bucket();
  const filePaths = [
    "MMaskShape/circle.jpg",
    "MMaskShape/rectangle.jpeg",
    "MMaskShape/roundedRectangle.webp",
    "MMaskShape/triangle.png",
  ];

  const collection = productionDB.collection(MMaskShape.modelName);
  await Promise.all(
    filePaths.map(async (filePath) => {
      const file = bucket.file(filePath);

      const url = await file.getSignedUrl({
        action: "read",
        expires: "03-01-2500", // 永久的な値を設定
      });
      const documentRef = collection.doc();
      bulkWriter.create(documentRef, { [MMaskShape.Cols.storageUrl]: url[0] });
    })
  );

  bulkWriter.close().then(() => {
    console.log("Bulk write completed.");
  });
};
main();
