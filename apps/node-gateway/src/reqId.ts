// https://github.com/fastify/fastify/blob/7efd2540f1/lib/reqIdGenFactory.js
export function createReqIdGen() {
  const maxInt = 2147483647;
  let nextReqId = 0;
  return function genReqId() {
    nextReqId = (nextReqId + 1) & maxInt;
    return nextReqId.toString(36);
  };
}
