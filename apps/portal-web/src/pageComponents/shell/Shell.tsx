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
import { join } from "path";
import { useEffect, useRef } from "react";
import { ShellInputData, ShellOutputData } from "src/pages/api/shell";
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

      const fitAddon = new FitAddon();
      term.loadAddon(fitAddon);
      term.open(container.current);

      const payload = {
        cluster,
        path,
        cols: term.cols + "",
        rows: term.rows + "",
      };

      term.write(
        `\r\n*** Connecting to cluster ${payload.cluster} as ${user.identityId} to ` +
        `${path ? "path " + path : "home path"} ***\r\n`,
      );


      const socket = new WebSocket(
        (location.protocol === "http:" ? "ws" : "wss") + "://" + location.host +
        join(publicConfig.BASE_PATH, "/api/shell") + "?" + new URLSearchParams(payload).toString(),
      );

      socket.onopen = () => {

        let stack: string = "";

        term.clear();

        const send = (data: ShellInputData) => {
          socket.send(JSON.stringify(data));
        };

        const resizeObserver = new ResizeObserver(debounce(() => {
          fitAddon.fit();
          send({ $case: "resize", resize: { cols: term.cols, rows: term.rows } });
        }));

        resizeObserver.observe(container.current!);

        term.onData((data) => {
          if (data.length === 1 && (data === "r" || data === "z")) {
            stack += data;
            send({ $case: "data", data: { data } });
          }
          else {
            if ((data === "\r") && stack === "rz") {
              // todo 获取要下载的路径 or 解析 rz后面的文件名
              const cmd = "rz || pwd";
              send({ $case: "data", data: { data: cmd } });
            } else {
              stack = "";
            }
            send({ $case: "data", data: { data } });
          }
        });

        term.onResize(({ cols, rows }) => {
          send({ $case: "resize", resize: { cols, rows } });
        });
      };

      socket.onmessage = (e) => {
        const message = JSON.parse(e.data) as ShellOutputData;
        switch (message.$case) {
        case "data":
          if (Buffer.from(message.data.data).toString().search("rz: not found") >= 0) {
            console.log(Buffer.from(message.data.data).toString().split("\r\n"));
            const datapath = Buffer.from(message.data.data).toString().trim().split("\r\n")[1];
            openPreviewLink(join("/files", cluster, datapath));

            term.write(Buffer.from(message.data.data).toString().split("\r\n")[2]);
          }
          else {
            if (Buffer.from(message.data.data).toString().search("rz") >= 0) {
            }

            else {
              term.write(Buffer.from(message.data.data));
            }
          }
          break;
        case "exit":
          term.write(`Process exited with code ${message.exit.code} and signal ${message.exit.signal}.`);
          break;
        }

      };

      return () => {
        socket.close();
      };
    }
  }, [container.current]);

  return (
    <TerminalContainer ref={container} />
  );
};

// todo
function openPreviewLink(href: string) {
  window.open(href, "ViewFile", "location=yes,resizable=yes,scrollbars=yes,status=yes");
}

