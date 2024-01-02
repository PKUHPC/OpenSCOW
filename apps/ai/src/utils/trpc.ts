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

// import { httpBatchLink, loggerLink } from "@trpc/client";
// import { createTRPCNext } from "@trpc/next";
// import { inferRouterInputs, inferRouterOutputs } from "@trpc/server";
// import { NextPageContext } from "next";
// // ℹ️ Type-only import:
// // https://www.typescriptlang.org/docs/handbook/release-notes/typescript-3-8.html#type-only-imports-and-export
// import type { Router } from "src/server/trpc/router";
// import superjson from "superjson";


// function getBaseUrl() {
//   if (typeof window !== "undefined") {
//     return "";
//   }
//   // reference for vercel.com
//   if (process.env.VERCEL_URL) {
//     return `https://${process.env.VERCEL_URL}`;
//   }

//   // // reference for render.com
//   if (process.env.RENDER_INTERNAL_HOSTNAME) {
//     return `http://${process.env.RENDER_INTERNAL_HOSTNAME}:${process.env.PORT}`;
//   }

//   // assume localhost
//   return `http://127.0.0.1:${process.env.PORT ?? 3000}`;
// }

// /**
//  * Extend `NextPageContext` with meta data that can be picked up by `responseMeta()` when server-side rendering
//  */
// export interface SSRContext extends NextPageContext {
//   /**
//    * Set HTTP Status code
//    * @example
//    * const utils = trpc.useUtils();
//    * if (utils.ssrContext) {
//    *   utils.ssrContext.status = 404;
//    * }
//    */
//   status?: number;
// }

// /**
//  * A set of strongly-typed React hooks from your `Router` type signature with `createReactQueryHooks`.
//  * @link https://trpc.io/docs/react#3-create-trpc-hooks
//  */
// export const trpc = createTRPCNext<Router, SSRContext>({
//   config({ ctx }) {
//     /**
//      * If you want to use SSR, you need to use the server's full URL
//      * @link https://trpc.io/docs/ssr
//      */
//     return {
//       /**
//        * @link https://trpc.io/docs/data-transformers
//        */
//       transformer: superjson,
//       /**
//        * @link https://trpc.io/docs/client/links
//        */
//       links: [
//         // adds pretty logs to your console in development and logs errors in production
//         loggerLink({
//           enabled: (opts) =>
//             process.env.NODE_ENV === "development" ||
//             (opts.direction === "down" && opts.result instanceof Error),
//         }),
//         httpBatchLink({
//           url: `${getBaseUrl()}/api/trpc`,
//           /**
//            * Set custom request headers on every request from tRPC
//            * @link https://trpc.io/docs/ssr
//            */
//           headers() {
//             if (!ctx?.req?.headers) {
//               return {};
//             }
//             // To use SSR properly, you need to forward the client's headers to the server
//             // This is so you can pass through things like cookies when we're server-side rendering

//             const {
//               // If you're using Node 18 before 18.15.0, omit the "connection" header
//               connection: _connection,
//               ...headers
//             } = ctx.req.headers;
//             return headers;
//           },
//         }),
//       ],
//       /**
//        * @link https://tanstack.com/query/v4/docs/react/reference/QueryClient
//        */
//       // queryClientConfig: { defaultOptions: { queries: { staleTime: 60 } } },
//     };
//   },
//   /**
//    * @link https://trpc.io/docs/ssr
//    */
//   ssr: true,
//   /**
//    * Set headers or status code when doing SSR
//    */
//   responseMeta(opts) {
//     const ctx = opts.ctx as SSRContext;

//     if (ctx.status) {
//       // If HTTP status set, propagate that
//       return {
//         status: ctx.status,
//       };
//     }

//     const error = opts.clientErrors[0];
//     if (error) {
//       // Propagate http first error from API calls
//       return {
//         status: error.data?.httpStatus ?? 500,
//       };
//     }

//     // for app caching with SSR see https://trpc.io/docs/caching

//     return {};
//   },
// });

// export type RouterInput = inferRouterInputs<Router>;
// export type RouterOutput = inferRouterOutputs<Router>;

// url: `${getBasePath()}/api/trpc`,

// unstable_overrides: {
//   useMutation: {
//     async onSuccess(opts) {
//       await opts.originalFn();
//       await opts.queryClient.invalidateQueries();
//     },
//   },
// },

import { createTRPCReact } from "@trpc/react-query";
import type { AppRouter } from "src/server/trpc/router";

export const trpc = createTRPCReact<AppRouter>({
  

});
