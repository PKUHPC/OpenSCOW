import { ServiceError } from "@grpc/grpc-js";
import { Status } from "@grpc/grpc-js/build/src/constants";
import { NextApiRequest } from "next";

type ValueOf<T> = T[keyof T];

export const handlegRPCError = <THandlers extends Partial<Record<Status, (e: ServiceError) => unknown>>>(
  handlers: THandlers,
  // @ts-ignore
) => (e: ServiceError): ReturnType<ValueOf<THandlers>>  => {
    const handler = handlers[e.code];
    if (handler) {
      // @ts-ignore
      return handler(e) as ReturnType<ValueOf<THandlers>>;
    } else {
      throw e;
    }
  };

export const parseIp = (req: NextApiRequest): string | undefined => {

  let forwardedFor = req.headers["x-forwarded-for"];

  if (Array.isArray(forwardedFor)) {
    forwardedFor = forwardedFor.shift();
  }

  if (typeof forwardedFor === "string") {
    forwardedFor = forwardedFor.split(",").shift();
  }


  return forwardedFor ?? req.socket?.remoteAddress;
};

