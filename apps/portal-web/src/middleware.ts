import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import pino from "pino";

const logger = pino();

export function middleware(req: NextRequest) {
  req.log = logger.child({});
  const res = NextResponse.next();
  return res;
}

