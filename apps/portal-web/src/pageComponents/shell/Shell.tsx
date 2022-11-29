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

import { join } from "path";
import { useEffect, useRef } from "react";
import { io } from "socket.io-client";
import { User } from "src/stores/UserStore";
import { debounce } from "src/utils/debounce";
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
        path: join(process.env.NEXT_PUBLIC_BASE_PATH || "", "/api/shell/socketio"),
        query: payload,
        auth: { token: user.token },
      });

      socket.on("connect", () => {
        term.clear();

        term.onData((data) => {
          socket.emit("data", data);
        });

        term.onResize(({ cols, rows }) => {
          socket.emit("resize", { cols, rows });
        });

        socket.on("data", (data: ArrayBuffer) => {
          console.log("received data", typeof data, data, data.toString());
          term.write(Buffer.from(data));
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
