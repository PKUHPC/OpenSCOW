import { parsePlaceholder } from "@scow/lib-config";
import { message } from "antd";
import { join } from "path";
import { api } from "src/apis";
import { ClickableA } from "src/components/ClickableA";
import type { AppSession } from "src/generated/portal/app";
import { Cluster, publicConfig } from "src/utils/config";
import { openDesktop } from "src/utils/vnc";

export interface Props {
  cluster: Cluster;
  session: AppSession;
}

export const ConnectTopAppLink: React.FC<Props> = ({
  session, cluster,
}) => {

  const onClick = async () => {
    const reply = await api.connectToApp({ body: { cluster: cluster.id, sessionId: session.sessionId } })
      .httpError(404, () => { message.error("此应用会话不存在"); })
      .httpError(409, () => { message.error("此应用目前无法连接"); });

    if (reply.type === "web") {
      const { connect, host, password, port } = reply;
      const interpolatedValues = { HOST: host, PASSWORD: password, PORT: port };
      const path = parsePlaceholder(connect.path, interpolatedValues);

      const interpolateValues = (obj: Record<string, string>) => {
        return Object.keys(obj).reduce((prev, curr) => {
          prev[curr] = parsePlaceholder(obj[curr], interpolatedValues);
          return prev;
        }, {});
      };

      const query = connect.query ? interpolateValues(connect.query) : {};
      const formData = connect.formData ? interpolateValues(connect.formData) : undefined;

      const pathname = join(publicConfig.PROXY_BASE_PATH, host, String(port), path);

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
      openDesktop(host, port, password);
    }

  };

  return (
    <ClickableA onClick={onClick}>连接</ClickableA>
  );


};
