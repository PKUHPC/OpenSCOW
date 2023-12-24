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

import { NextRequest, NextResponse } from "next/server";
import { getUserInfo } from "src/server/auth/server";
import { getAsyncIterableFor } from "src/utils/stream.js";
import { z } from "zod";

const queryZod = z.object({
  clusterId: z.string(),
  path: z.string(),
});

export type UploadQuery = z.infer<typeof queryZod>;

export async function POST(request: NextRequest, { params: { resourceId } }: { params: {
  resourceId: number;
} }) {

  const user = await getUserInfo(request);

  if (!user) {
    return NextResponse.json({ code: "UNAUTHORIZED" }, { status: 401 });
  }


  const { clusterId, path } = queryZod.parse(Object.fromEntries(new URL(request.url).searchParams));

  // const client = getClient(FileServiceClient);

  const formData = await request.formData();

  const uploadedFile = formData.get("file");

  // // File is only an interface. Blob is class
  // if (!uploadedFile || !(uploadedFile instanceof Blob)) {
  //   return NextResponse.json({ code: "INVALID_FILE" }, { status: 400 });
  // }

  // const resp = await asyncRequestStreamCall(client, "upload", async ({ writeAsync }) => {
  //   await writeAsync({ message: { $case: "info", info: {
  //     resourceId, clusterId, path,
  //   } } });

  //   for await (const chunk of getAsyncIterableFor(uploadedFile.stream())) {
  //     await writeAsync({ message: { $case: "chunk", chunk } });
  //   }
  // }, { metadata: setTokenMetadata(user.token), options: undefined }).catch((e) => {
  //   throw new Error("Error when writing stream", { cause: e });
  // });

  // return NextResponse.json({ writtenBytes: resp.writtenBytes }, { status: 200 });
}
