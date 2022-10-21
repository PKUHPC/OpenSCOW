import { Server, Socket } from "net";
import { NextApiResponse } from "next";
import { Server as SocketIOServer } from "socket.io";


export type NextApiResponseServerIO = NextApiResponse & {
  socket: Socket & {
    server: Server & {
      io: SocketIOServer;
    };
  };
};
