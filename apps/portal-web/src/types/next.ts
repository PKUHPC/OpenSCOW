import { Server, Socket } from "net";
import { NextApiResponse } from "next";
import { Server as SocketIOServer } from "socket.io";


export type AugmentedNextApiResponse = NextApiResponse & {
  socket: Socket & {
    server: Server & {
      io: SocketIOServer;
      upgrade: boolean;
    };
  };
};
