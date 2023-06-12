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

import { loggedExec, sftpWriteFile } from "@scow/lib-ssh";
import { dirname } from "path";
import { clusters } from "src/config/clusters";
import { config } from "src/config/env";
import { sshConnect } from "src/utils/ssh";
import { Logger } from "ts-log";

export const setupProxyGateway = async (logger: Logger) => {

  let portalBasePath = config.PORTAL_BASE_PATH;
  if (!portalBasePath.endsWith("/")) { portalBasePath += "/"; }

  for (const id of Object.keys(clusters)) {

    const proxyGatewayConfig = clusters[id].proxyGateway;

    if (!proxyGatewayConfig?.autoSetupNginx) { continue; }

    const url = new URL(proxyGatewayConfig.url);

    const content = `
server {
  listen ${url.port};

  proxy_set_header Host   $http_host;
  proxy_set_header X-Real-IP      $remote_addr;
  proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;

  proxy_http_version 1.1;
  proxy_set_header Upgrade $http_upgrade;
  proxy_set_header Connection "upgrade";

  location ~ ^${portalBasePath}api/proxy/(?<clusterId>.*)/relative/(?<node>[\\d|\\.]*)/(?<port>\\d+)(?<rest>.*)$ {
    proxy_pass http://$node:$port$rest$is_args$args;
  }

  location ~ ^${portalBasePath}api/proxy/(?<clusterId>.*)/absolute/(?<node>[\\d|\\.]*)/(?<port>\\d+)(?<rest>.*)$ {
      proxy_pass http://$node:$port$request_uri;
  }
}
    `;

    const nginxConfigPath = "/etc/nginx/conf.d/scow-portal-proxy-gateway.conf";

    await sshConnect(url.hostname, "root", logger, async (ssh) => {

      // check if nginx is installed
      const resp = await loggedExec(ssh, logger, false, "nginx", ["-v"]);

      if (resp.code !== 0) {
        logger.error("nginx -v returned code %d. nginx might not be installed on %s", resp.code, url.host);
        return;
      }

      const sftp = await ssh.requestSFTP();
      await ssh.mkdir(dirname(nginxConfigPath), "exec", sftp);
      await sftpWriteFile(sftp)(nginxConfigPath, content);

      await loggedExec(ssh, logger, true, "nginx", ["-s", "reload"]);

      logger.info("Successfully setup proxy gateway for cluster %s", id);
    }).catch((e) => {
      logger.error(e, "Error occurred during setup proxy gateway for cluster %s", id);
    });
  }



};

interface Hosts {
  [key: string]: string;
}

// TODO: if no proxyGateway
export const getHostsFromGateway
  = async (clusterId: string, logger: Logger): Promise<Hosts | undefined> => {

    const proxyGatewayConfig = Object.keys(clusters)[clusterId];
    if (!proxyGatewayConfig) return;
    const url = new URL(proxyGatewayConfig.url);

    return await sshConnect(url.host, "root", logger, async (ssh) => {
      // get file /etc/hosts
      const resp = await loggedExec(ssh, logger, false, "cat", ["/etc/hosts"]);
      if (resp.code !== 0) {
        logger.error("cat /etc/hosts returned code %d. /etc/hosts might not exist on %s", resp.code, url.host);
        return;
      }

      return resp.stdout.split("\n").reduce((acc, item) => {
        const [ip, value] = item.split(" ");
        if (value && ip) {
          acc[value] = ip;
        }
        return acc;
      }, {}) as Hosts;
    }).catch((e) => {
      logger.error(e, "Error occurred during get hosts from gateway for cluster %s", clusterId);
      return undefined;
    });
  };
