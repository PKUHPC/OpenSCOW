import { ServiceError } from "@grpc/grpc-js";
import { Status } from "@grpc/grpc-js/build/src/constants";
import { SSHExecCommandResponse } from "node-ssh";

export function handleError(
  { code, stdout, stderr }: SSHExecCommandResponse,
  codeMap: Record<number, Status>,
) {
  if (code !== 0) {
    throw <ServiceError>{
      code: code ? (codeMap[code] ?? Status.INTERNAL) : Status.INTERNAL,
      message: `stdout: ${stdout}; stderr: ${stderr}`,
    };
  }
}
