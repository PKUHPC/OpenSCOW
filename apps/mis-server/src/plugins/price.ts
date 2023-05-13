/**
 * Copyright (c) 2022 Peking University and Peking University Institute for Computing and Digital Economy
 * SCOW is licensed under Mulan PSL v2.
 * You can use this software according to the terms and conditions of the Mulan PSL v2.
 * You may obtain a copy of Mulan PSL v2 at:
 *          http://license.coscl.org.cn/MulanPSL2
 * THIS SOFTWARE IS PROVIDED ON AN "AS IS" BASIS, WITHOUT WARRANTIES OF ANY KIND,
 * EITHER EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO NON-INFRINGEMENT,
 * MERCHANTABILITY OR FIT FOR A PARTICULAR PURPOSE.
 * See the Mulan PSL v2 for more details.
 */

import { plugin } from "@ddadaal/tsgrpc-server";
import { createPriceMap, PriceMap } from "src/bl/PriceMap";

export interface PricePlugin {
  price: {
    createPriceMap: () => Promise<PriceMap>;
  }
}


export const pricePlugin = plugin(async (s) => {

  const logger = s.logger.child({ plugin: "price" });

  // check price item completeness
  const priceMap = await createPriceMap(s.ext.orm.em.fork(), s.ext.clusters, logger);
  const missingItems = priceMap.getMissingDefaultPriceItems();
  if (missingItems.length > 0) {
    logger.warn(`
      The following price items are missing in platform scope: %o.
      An error will be thrown when such a job is fetched.
    `, missingItems);
  } else {
    logger.info("Platform price items are complete. ");
  }

  s.addExtension("price", <PricePlugin["price"]>{
    createPriceMap: () => createPriceMap(s.ext.orm.em.fork(), s.ext.clusters, logger),
  });

});
