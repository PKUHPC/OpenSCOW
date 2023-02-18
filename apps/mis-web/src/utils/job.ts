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

import { JobBillingItem } from "@scow/protos/build/server/job";

export const getActiveBillingItems = (data: JobBillingItem[], tenant?: string) => {

  // { [cluster.partition[.qos]]: item }
  const defaultItems: Record<string, JobBillingItem> = {};
  // { tenantName: { [cluster.partition[.qos] ]: item }}
  const tenantSpecificItems: Record<string, Record<string, JobBillingItem>> = {};
  
  data.forEach((item) => {
    if (!item.tenantName) {
      defaultItems[item.path] = item;
    } else {
      const tenantName = item.tenantName;
      if (!(tenantName in tenantSpecificItems)) {
        tenantSpecificItems[tenantName] = {};
      }
      tenantSpecificItems[tenantName][item.path] = item;
    }
  });
  
  const activeItems = tenant
    ? Object.values({ ...defaultItems, ...tenantSpecificItems[tenant] })
    : [
      ...Object.values(defaultItems),
      ...Object.values(tenantSpecificItems).map((x) => Object.values(x)).flat(),
    ];
  
  return {
    activeItems: activeItems,
    historyItems: data.filter((x) => !activeItems.includes(x)),
  };
};