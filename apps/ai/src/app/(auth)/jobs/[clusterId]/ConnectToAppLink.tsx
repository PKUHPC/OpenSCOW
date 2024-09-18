/**
 * Copyright (c) 2022 Peking University and Peking University Institute for Computing and Digital Economy
 * OpenSCOW is licensed under Mulan PSL v2.
 * You can use this software according to the terms and conditions of the Mulan PSL v2.
 * You may obtain a copy of Mulan PSL v2 at:
 *          http://license.coscl.org.cn/MulanPSL2
 * THIS SOFTWARE IS PROVIDED ON AN "AS IS" BASIS, WITHOUT WARRANTIES OF ANY KIND,
 * EITHER EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO NON-INFRINGEMENT,
 * MERCHANTABILITY OR FIT FOR A PARTICULAR PURPOSE.
 * See the Mulan PSL v2 for more details.
 */

"use client";

import { parsePlaceholder } from "@scow/lib-config/build/parse";
import { App } from "antd";
import { join } from "path";
import { useEffect } from "react";
import { DisabledA } from "src/components/DisabledA";
import { AppSession } from "src/server/trpc/route/jobs/apps";
import { trpc } from "src/utils/trpc";
import { openDesktop } from "src/utils/vnc";

import { usePublicConfig } from "../../context";

export interface Props {
  session: AppSession;
  cluster: string;
  refreshToken: boolean;
}

export const ConnectTopAppLink: React.FC<Props> = ({
  session, cluster, refreshToken,
}) => {
  const { publicConfig: { BASE_PATH, NOVNC_CLIENT_URL } } = usePublicConfig();
  const { message } = App.useApp();

  const { data, refetch } = trpc.jobs.checkAppConnectivity.useQuery({ clusterId: cluster, jobId: session.jobId }, {
    enabled: !!session.jobId,
  });

  const connectMutation = trpc.jobs.connectToApp.useMutation(
    {
      onError(e) {
        message.error(`连接应用失败: ${e.message}`);
      },
    },
  );

  useEffect(() => {
    refetch();
  }, [refreshToken]);


  const onClick = async () => {

    const reply = await connectMutation.mutateAsync({
      cluster,
      sessionId: session.sessionId,
    });

    if (reply.type === "web") {
      const { connect, host, password, port, proxyType } = reply;
      const interpolatedValues = { HOST: host, PASSWORD: password, PORT: port };
      const path = parsePlaceholder(connect.path, interpolatedValues);

      const interpolateValues = (obj: Record<string, string>): Record<string, string> => {
        return Object.keys(obj).reduce<Record<string, string>>((prev, curr) => {
          prev[curr] = parsePlaceholder(obj[curr], interpolatedValues);
          return prev;
        }, {});
      };

      const query = connect.query ? interpolateValues(connect.query) : {};
      const formData = connect.formData ? interpolateValues(connect.formData) : undefined;

      const pathname = join(BASE_PATH, "/api/proxy", cluster, proxyType, host, String(port), path);

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
      openDesktop(BASE_PATH, NOVNC_CLIENT_URL, cluster, host, port, password);
      return;
    }

  };

  return (
    <DisabledA disabled={!data} onClick={onClick} message="应用还未准备好">连接</DisabledA>
  );
};
