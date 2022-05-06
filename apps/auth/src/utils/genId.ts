import { customAlphabet,nanoid } from "nanoid";

// https://zelark.github.io/nano-id-cc/ says at a gen rate of 1 per second,
// such alphabet and length will need 255 years to have a 1% probability of at least one collision.
const shortNanoid = customAlphabet(
  "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz",
  12,
);

/** A simple number id generator. */
export function genId(): string {
  return shortNanoid();
}

export function genToken(): string {
  return shortNanoid();
}

export function genNormalId(): string {
  return nanoid();
}
