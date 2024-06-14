# Copyright (c) 2022 Peking University and Peking University Institute for Computing and Digital Economy
# SCOW is licensed under Mulan PSL v2.
# You can use this software according to the terms and conditions of the Mulan PSL v2.
# You may obtain a copy of Mulan PSL v2 at:
#          http://license.coscl.org.cn/MulanPSL2
# THIS SOFTWARE IS PROVIDED ON AN "AS IS" BASIS, WITHOUT WARRANTIES OF ANY KIND,
# EITHER EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO NON-INFRINGEMENT,
# MERCHANTABILITY OR FIT FOR A PARTICULAR PURPOSE.
# See the Mulan PSL v2 for more details.


FROM node:iron-alpine@sha256:f3d945e503328d76a54533ce1cbe8d6de03df16b00002f2ec1a890a28d1d6bd6 AS base

RUN apk update && apk add libc6-compat python3 make gcc g++ git

RUN corepack enable

WORKDIR /app

COPY package.json .
COPY pnpm-lock.yaml .

COPY patches ./patches

RUN pnpm fetch

FROM base as pruner

WORKDIR /app

COPY . .
RUN pnpm dlx turbo prune --scope="@scow/test-adapter" --docker

FROM base AS builder

WORKDIR /app
COPY --from=pruner /app/out/json/ .

RUN pnpm i --offline --frozen-lockfile

COPY --from=pruner /app/out/full/ .
COPY tsconfig.json .eslintrc.js turbo.json ./
COPY libs/tsconfig.json ./libs/
COPY protos ./protos
COPY scripts/ ./scripts

RUN pnpm build

RUN node scripts/copyDist.mjs dev/test-adapter

WORKDIR /app/dist

RUN pnpm i --offline --prod --frozen-lockfile

FROM base AS runner

WORKDIR /app

COPY --from=builder /app/dist .

EXPOSE 6000

WORKDIR /app/dev/test-adapter

ENTRYPOINT [ "npm", "run", "serve" ]







