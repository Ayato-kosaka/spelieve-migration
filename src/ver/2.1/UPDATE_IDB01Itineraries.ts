import { productionDB } from "../../productionFirebase";

import { Itineraries as ItinerariesV2_1 } from "spelieve-common/lib/Models/Itinerary/IDB01/Itineraries";
import { Itineraries as ItinerariesV2_0 } from "spelieve-common-v2.0/lib/Models/Itinerary/IDB01/Itineraries";
import { utils } from "../../utils";

const main = async () => {
  const bulkWriter = utils.bulkWriter(productionDB);

  const collection = productionDB.collection(ItinerariesV2_0.modelName);
  const querySnapshot = await collection.get();
  querySnapshot.forEach(async (doc) => {
    const data = doc.data() as Partial<ItinerariesV2_0>;

    // change: https://github.com/Ayato-kosaka/spelieve/issues/599
    const textMap = {};
    if (data.title)
      Object.assign(textMap, { [ItinerariesV2_0.Cols.title]: data.title });
    if (data.subTitle)
      Object.assign(textMap, {
        [ItinerariesV2_0.Cols.subTitle]: data.subTitle,
      });
    if (data.tags)
      Object.assign(
        textMap,
        data.tags.reduce(
          (prev, val, index) =>
            Object.assign(prev, { ["label_" + index.toString()]: val }),
          {}
        )
      );

    // change: https://github.com/Ayato-kosaka/spelieve/issues/601
    const storeUrlMap = {};
    if (data.imageUrl)
      Object.assign(storeUrlMap, {
        [ItinerariesV2_0.Cols.imageUrl]: data.imageUrl,
      });

    const upd: Partial<ItinerariesV2_1> = {
      storeUrlMap,
      textMap,

      // change: https://github.com/Ayato-kosaka/spelieve/issues/598
      thumbnailID: "v2_0",
    };
    await bulkWriter.update(doc.ref, upd);
  });

  bulkWriter.close().then(() => {
    console.log("Bulk write completed.");
  });
};
main();
