import { MockApi, mockApi } from "src/apis/api.mock";
import { USE_MOCK } from "src/apis/useMock";
import { delay } from "src/utils/delay";

import { api as realApi } from "./api";

function logApiCall(api: MockApi<typeof realApi>): typeof realApi {
  const rec = (obj) => {
    return Object
      .entries(obj)
      .reduce((prev, [key, val]) => {
        if (typeof val === "function") {
          prev[key] = (...args: any) => {
            const promise = new Promise((res) => {
              if (process.env.NODE_ENV === "development") {
              // eslint-disable-next-line max-len
                console.log(`Calling API ${val.name}, args ${JSON.stringify(args)}`);
              }
              delay(500).then(() => {
                res(val(...args));
              });
            });
            // @ts-ignore
            promise.httpError = () => { return promise;};
            return promise;
          };

        } else {
          prev[key] = rec(val);
        }
        return prev;
      }, {});
  };

  return rec(api) as typeof realApi;
}

// changing this line during development to set USE_MOCK dynamically

// judge whether USE_MOCK here can help reduce the size of bundle
// by tree shaking mock modules at production build
export const api = USE_MOCK ? logApiCall(mockApi) : realApi;
