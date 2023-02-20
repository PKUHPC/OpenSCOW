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

import { debounce } from "@scow/lib-web/build/utils/debounce";
import Router from "next/router";
import { join } from "path";
import { useEffect, useRef } from "react";
import { io } from "socket.io-client";
import { urlToDownload } from "src/pageComponents/filemanager/api";
import { User } from "src/stores/UserStore";
import { publicConfig } from "src/utils/config";
import styled from "styled-components";
import { Terminal } from "xterm";
import { FitAddon } from "xterm-addon-fit";

const TerminalContainer = styled.div`
  background-color: black;
  flex: 1;

  width: 100%;
`;

interface Props {
  user: User;
  cluster: string;
  path: string;
}


export const Shell: React.FC<Props> = ({ user, cluster, path }) => {

  const container = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (container.current) {

      const term = new Terminal({
        cursorBlink: true,
      });

      const payload = {
        cluster,
        path,
        cols: term.cols + "",
        rows: term.rows + "",
      };

      const fitAddon = new FitAddon();
      term.loadAddon(fitAddon);
      term.open(container.current);

      term.write(
        `\r\n*** Connecting to cluster ${payload.cluster} as ${user.identityId} to ` +
        `${path ? "path " + path : "home path"} ***\r\n`,
      );

      const resizeObserver = new ResizeObserver(debounce(() => {
        fitAddon.fit();
        socket.emit("resize", { cols: term.cols, rows: term.rows });
      }));

      resizeObserver.observe(container.current);

      const socket = io({
        path: join(publicConfig.BASE_PATH, "/api/shell/socketio"),
        query: payload,
        auth: { token: user.token },
      });

      let stack: string = "";
      let datapath: string = "/";

      socket.on("connect", () => {
        term.clear();

        term.onData((data) => {

          if (data.length === 1 && (data === "r" || data === "z")) {
            stack += data;
            socket.emit("data", data);
          }
          else {
            if ((data === "\r") && stack === "rz") {
              // todo 获取要下载的路径 or 解析 rz后面的文件名
              socket.emit("data", "rz || pwd");
            } else {
              stack = "";
            }
            socket.emit("data", data);
          }
        });

        term.onResize(({ cols, rows }) => {
          socket.emit("resize", { cols, rows });
        });

        socket.on("data", (data: ArrayBuffer) => {
          console.log("++++++++++++++", Buffer.from(data).toString());
          if (Buffer.from(data).toString().search("rz: not found") >= 0) {
            console.log(Buffer.from(data).toString().split("\r\n"));
            datapath = Buffer.from(data).toString().trim().split("\r\n")[1];
            openPreviewLink(join("/files", cluster, datapath));

            term.write(Buffer.from(data).toString().split("\r\n")[2]);
          }
          else {
            if (Buffer.from(data).toString().search("rz") >= 0) {
            }

            else {
              term.write(Buffer.from(data));
            }
          }
        });

        socket.on("exit", (e: { exitCode: number, signal?: number }) => {
          socket.disconnect();
          term.write(`Process exited with code ${e.exitCode}.`);
        });

        socket.on("disconnect", () => {
          term.write("\r\n*** Disconnected.***\r\n");
        });
      });

      return () => {
        socket.disconnect();
        if (container.current) {
          resizeObserver.unobserve(container.current);
        }
      };
    }
  }, [container.current]);

  return (
    <TerminalContainer ref={container} />
  );
};

function openPreviewLink(href: string) {
  window.open(href, "ViewFile", "location=yes,resizable=yes,scrollbars=yes,status=yes");
}

