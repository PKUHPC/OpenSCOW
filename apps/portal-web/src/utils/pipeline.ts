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

import { createWriterExtensions } from "@ddadaal/tsgrpc-common";
import { ObjectWritable } from "@grpc/grpc-js/build/src/object-stream";

export async function pipeline<TSource, TTarget>(
  source: AsyncIterable<TSource>,
  transform: (source: TSource) => TTarget | undefined | Promise<TTarget | undefined>,
  target: ObjectWritable<TTarget>,
  options?: { signal: AbortSignal },
) {
  const { writeAsync } = createWriterExtensions(target);

  if (options?.signal.aborted) { return; }

  for await (const s of source) {
    if (options?.signal.aborted) { break; }
    const object = await transform(s);
    if (object) {
      await writeAsync(object);
    }
  }


}

