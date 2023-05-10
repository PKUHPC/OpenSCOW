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
import { api } from "src/apis";
import { ClickableA } from "src/components/ClickableA";
import { Cluster, publicConfig } from "src/utils/config";
import { openDesktop } from "src/utils/vnc";

export interface Props {
  cluster: Cluster;
  session: AppSession;
}

export const ConnectTopAppLink: React.FC<Props> = ({
  session, cluster,
}) => {

  const { message } = App.useApp();

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
    <ClickableA onClick={onClick}>连接</ClickableA>
  );


};
