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

import { ServiceError } from "@ddadaal/tsgrpc-common";
import { Logger } from "@ddadaal/tsgrpc-server";
import { status } from "@grpc/grpc-js";
import { joinWithUrl } from "@scow/utils";
import { httpStatusToGrpcCode } from "src/utils/httpStatusToGrpcCode";

import { 
  AsyncOperationRequestPath, 
  AsyncOperationRequests, 
  CompleteLongRunningOperationRequest, 
  CompleteLongRunningOperationResponse, 
  CreateLongRunningOperationRequest, 
  GetCompletedLongRunningOperationsRequest, 
  GetCompletedLongRunningOperationsResponse, 
  GetLongRunningOperationsRequest, 
  GetLongRunningOperationsResponse, 
  UpdateLongRunningOperationRequest,
  UpdateLongRunningOperationResponse,
} from "./api";

export const requests = (address: string): AsyncOperationRequests => {
  return {
    getLongRunningOperations: async (req: GetLongRunningOperationsRequest, logger: Logger) => {
      try {
        const operationsRes = await fetch(
          joinWithUrl(address, AsyncOperationRequestPath.GetLongRunningOperations));
    
        if (operationsRes.ok) {
          const operations: GetLongRunningOperationsResponse = await operationsRes.json();
          return operations;
        } else {
          const errorMsg = await operationsRes.text();
    
          logger.error(`Error: HTTP status ${operationsRes.status}, message ${errorMsg}`);
          throw <ServiceError>{
            code: httpStatusToGrpcCode(operationsRes.status), message: errorMsg,
          };
        }
      } catch (err) {
        logger.error(`get long running operations err ${err}`);
        throw <ServiceError>{
          code: status.UNKNOWN, message: `fetch long running operations err ${err}`,
        };
      }
    },

    createLongRunningOperation: async (req: CreateLongRunningOperationRequest, logger: Logger) => {
      try {
        const res = await fetch(
          joinWithUrl(address, AsyncOperationRequestPath.CreateLongRunningOperation),
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              ...req,
            }),
          },
        );
    
        if (res.ok) {
          logger.info("create long running operation success");
    
          return {};
        } else {
          const errorMsg = await res.text();
          logger.error(`Error: HTTP status ${res.status}, message ${errorMsg}`);
          throw <ServiceError>{
            code: httpStatusToGrpcCode(res.status), message: errorMsg,
          };
        }
      } catch (err) {
        logger.error(`create long running operations err ${err}`);
        throw <ServiceError>{
          code: status.UNKNOWN, message: `create long running operations err ${err}`,
        };
      }
    },

    updateLongRunningOperation: async (req: UpdateLongRunningOperationRequest, logger: Logger) => {
      try {
        const res = await fetch(
          joinWithUrl(address, AsyncOperationRequestPath.UpdateLongRunningOperation),
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              ...req,
            }),
          },
        );
    
        if (res.ok) {
          const newOperation: UpdateLongRunningOperationResponse = await res.json();

          logger.info("update long running operation success: ", req);
    
          return newOperation;
        } else {
          const errorMsg = await res.text();
          logger.error(`Error: HTTP status ${res.status}, message ${errorMsg}`);
          throw <ServiceError>{
            code: httpStatusToGrpcCode(res.status), message: errorMsg,
          };
        }
      } catch (err) {
        logger.error(`update long running operations err ${err}`);
        throw <ServiceError>{
          code: status.UNKNOWN, message: `update long running operations err ${err}`,
        };
      }
    },

    completeLongRunningOperation: async (req: CompleteLongRunningOperationRequest, logger: Logger) => {
      try {
        const res = await fetch(
          joinWithUrl(address, AsyncOperationRequestPath.CompleteLongRunningOperation),
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              ...req,
            }),
          },
        );
    
        if (res.ok) {
          const operation: CompleteLongRunningOperationResponse = await res.json();

          logger.info("complete long running operation success: ", req);
    
          return operation;
        } else {
          const errorMsg = await res.text();
          logger.error(`Error: HTTP status ${res.status}, message ${errorMsg}`);
          throw <ServiceError>{
            code: httpStatusToGrpcCode(res.status), message: errorMsg,
          };
        }
      } catch (err) {
        logger.error(`complete long running operations err ${err}`);
        throw <ServiceError>{
          code: status.UNKNOWN, message: `complete long running operations err ${err}`,
        };
      }
    },

    getCompletedLongRunningOperations: async (req: GetCompletedLongRunningOperationsRequest, logger: Logger) => {
      try {
        const operationsRes = await fetch(
          joinWithUrl(address, AsyncOperationRequestPath.GetCompletedLongRunningOperation));
    
        if (operationsRes.ok) {
          const operations: GetCompletedLongRunningOperationsResponse = await operationsRes.json();
          return operations;
        } else {
          const errorMsg = await operationsRes.text();
    
          logger.error(`Error: HTTP status ${operationsRes.status}, message ${errorMsg}`);
          throw <ServiceError>{
            code: httpStatusToGrpcCode(operationsRes.status), message: errorMsg,
          };
        }
      } catch (err) {
        logger.error(`get completed long running operations err ${err}`);
        throw <ServiceError>{
          code: status.UNKNOWN, message: `get completed long running operations err ${err}`,
        };
      }
    },
  };
};