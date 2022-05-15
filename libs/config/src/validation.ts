import { Static, TSchema } from "@sinclair/typebox";
import Ajv from "ajv/dist/2019";
import addFormats from "ajv-formats";

export const createAjv = () => addFormats(new Ajv({
  useDefaults: true,
}), [
  "date-time",
  "time",
  "date",
  "email",
  "hostname",
  "ipv4",
  "ipv6",
  "uri",
  "uri-reference",
  "uuid",
  "uri-template",
  "json-pointer",
  "relative-json-pointer",
  "regex",
]).addKeyword("kind")
  .addKeyword("modifier");

export function validateObject<TObj extends TSchema>(
  schema: TObj, object: any,
): Static<TObj> {

  const ajv = createAjv();
  const ok = ajv.validate(schema, object);

  if (!ok) { throw new Error("Invalid json. " + ajv.errorsText()); }

  return object;
}
