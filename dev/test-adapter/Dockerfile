# Copyright (c) 2022 Peking University and Peking University Institute for Computing and Digital Economy
# SCOW is licensed under Mulan PSL v2.
# You can use this software according to the terms and conditions of the Mulan PSL v2.
# You may obtain a copy of Mulan PSL v2 at:
#          http://license.coscl.org.cn/MulanPSL2
# THIS SOFTWARE IS PROVIDED ON AN "AS IS" BASIS, WITHOUT WARRANTIES OF ANY KIND,
# EITHER EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO NON-INFRINGEMENT,
# MERCHANTABILITY OR FIT FOR A PARTICULAR PURPOSE.
# See the Mulan PSL v2 for more details.


FROM node:hydrogen-alpine@sha256:d5b2a7869a4016b1847986ea52098fa404421e44281bb7615a9e3615e07f37fb AS base

RUN apk update && apk add libc6-compat python3 make gcc g++ git

RUN corepack enable

WORKDIR /app
COPY pnpm-lock.yaml .

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







