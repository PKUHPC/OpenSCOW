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

import { useCallback } from "react";
import { useAsync } from "react-async";
import { fetchExtensionManifests } from "src/extensions/manifests";

export const UiExtensionStore = (extensionUrl?: string) => {

  const { data: config, isLoading: configLoading } = useAsync({
    promiseFn: useCallback(async () => {

      if (!extensionUrl) { return undefined; }

      return await fetchExtensionManifests(extensionUrl)
        .then((x) => ({
          url: extensionUrl,
          manifests: x,
        }))
        .catch((e) => {
          console.error(`Error fetching extension manifests. ${e}`);
          return undefined;
        });
    }, []),
  });

  return { config, configLoading };
};
