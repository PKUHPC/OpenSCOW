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

import { parsePlaceholder } from "@scow/lib-config/build/parse";
import type { AppSession } from "@scow/protos/build/portal/app";
import { App } from "antd";
import { join } from "path";
import { useCallback } from "react";
import { useAsync } from "react-async";
import { api } from "src/apis";
import { DisabledA } from "src/components/DisabledA";
import { Cluster, publicConfig } from "src/utils/config";
import { openDesktop } from "src/utils/vnc";

export interface Props {
  cluster: Cluster;
  session: AppSession;
  refreshToken: boolean;
}

export const ConnectTopAppLink: React.FC<Props> = ({
  session, cluster, refreshToken,
}) => {

  const { message } = App.useApp();

  const checkConnectivityPromiseFn = useCallback(async () => {
    if (!session.host || !session.port) { return false; }
    return api.checkAppConnectivity({ query: { cluster: cluster.id, host: session.host, port: session.port } })
      .then((x) => x.ok);
  }, [session.host, session.port, cluster.id]);

  const { data } = useAsync({ promiseFn: checkConnectivityPromiseFn, watch: refreshToken });

  const onClick = async () => {
    const reply = await api.connectToApp({ body: { cluster: cluster.id, sessionId: session.sessionId } })
      .httpError(404, () => { message.error("此应用会话不存在"); })
      .httpError(409, () => { message.error("此应用目前无法连接"); });

    if (reply.type === "web") {
      const { connect, host, password, port, proxyType, customFormData } = reply;
      const interpolatedValues = { HOST: host, PASSWORD: password, PORT: port, ...customFormData };
      const path = parsePlaceholder(connect.path, interpolatedValues);

      const interpolateValues = (obj: Record<string, string>) => {
        return Object.keys(obj).reduce((prev, curr) => {
          prev[curr] = parsePlaceholder(obj[curr], interpolatedValues);
          return prev;
        }, {});
      };

      const query = connect.query ? interpolateValues(connect.query) : {};
      const formData = connect.formData ? interpolateValues(connect.formData) : undefined;

      const pathname = join(publicConfig.BASE_PATH, "/api/proxy", cluster.id, proxyType, host, String(port), path);

      const url = pathname + "?" + new URLSearchParams(query).toString();

      if (connect.method === "GET") {
        window.open(url, "_blank");
      } else {
        const form = document.createElement("form");
        form.style.display = "none";
        form.action = url;
        form.method = "POST";
        form.target = "_blank";
        if (formData) {
          Object.keys(formData).forEach((k) => {
            const input = document.createElement("input");
            input.type = "hidden";
            input.name = k;
            input.value = formData[k];
            form.appendChild(input);
          });
        }
        document.body.appendChild(form);
        form.submit();
        document.body.removeChild(form);
      }

    } else {
      const { host, port, password } = reply;
      openDesktop(cluster.id, host, port, password);
    }

  };

  return (
    <DisabledA disabled={data} onClick={onClick} message="应用还未准备好">连接</DisabledA>
  );


};
