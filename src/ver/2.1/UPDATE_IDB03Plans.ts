import { productionDB } from "../../productionDB";

import { Plans as PlansV2_1 } from "spelieve-common/lib/Models/Itinerary/IDB03/Plans";
import { Plans as PlansV2_0 } from "spelieve-common-v2.0/lib/Models/Itinerary/IDB03/Plans";
import { utils } from "../../utils";

const main = async () => {
  const bulkWriter = utils.bulkWriter(productionDB);

  const collectionGroup = productionDB.collectionGroup(PlansV2_0.modelName);
  for await (const partition of collectionGroup.getPartitions(10000)) {
    const partitionedQuery = partition.toQuery();
    const querySnapshot = await partitionedQuery.get();
    querySnapshot.forEach(async (doc) => {
      const data = doc.data() as Partial<PlansV2_0>;

      // change: https://github.com/Ayato-kosaka/spelieve/issues/568
      const textMap = {};
      if (data.title)
        Object.assign(textMap, { [PlansV2_0.Cols.title]: data.title });
      if (data.tags)
        Object.assign(
          textMap,
          data.tags.reduce(
            (prev, val, index) =>
              Object.assign(prev, { ["label_" + index.toString()]: val }),
            {}
          )
        );

      // change: https://github.com/Ayato-kosaka/spelieve/issues/670
      const storeUrlMap = {};
      if (data.imageUrl)
        Object.assign(storeUrlMap, {
          [PlansV2_0.Cols.imageUrl]: data.imageUrl,
        });

      const upd: Partial<PlansV2_1> = {
        storeUrlMap,
        textMap,

        // change: https://github.com/Ayato-kosaka/spelieve/issues/669
        thumbnailID: "v2_0",
      };
      await bulkWriter.update(doc.ref, upd);
    });
  }

  bulkWriter.close().then(() => {
    console.log("Bulk write completed.");
  });
};
main();
