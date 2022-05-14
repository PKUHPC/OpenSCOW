import { customCleanEnv, EnvError, makeValidator, Spec,
  strictProxyMiddleware, ValidatorSpec  } from "envalid";
import * as envalid from "envalid";
import os from "os";

/**
 * Replace ${a} to valueObj[a]. If valueObj[a] is undefined, replace with ""
 * @param str the original string
 * @param valueObj the object containing keys and values
 * @returns replaced string
 */
export function parsePlaceholder(str: string, valueObj: object) {
  return str.replace(/\$\{([a-zA-Z0-9_]+)\}/g, (_, p1: string) => valueObj[p1] ?? "");
}

type Validator<T> = readonly [((spec?: Spec<T>) => ValidatorSpec<T>), Spec<T>] ;

function parsePlaceholders(env: Record<string, any>, rawEnv: any) {
  for (const k in env) {
    if (typeof env[k] === "string") {
      env[k] = parsePlaceholder(env[k], rawEnv);
    }
  }
  return env;
}

const docNames = {};

/** Separate function and params */
function make<T>(validator: Validator<T>[0], docName: string) {
  docNames[validator.name] = docName;
  return (spec: Spec<T>) => [validator, spec] as const;
}

export const str = make(envalid.str, "字符串");
export const host = make(envalid.host, "主机名");
export const port = make(envalid.port, "端口号");
export const url = make(envalid.url, "URL");
export const num = make(envalid.num, "数字");
export const bool = make(envalid.bool, "布尔值");

export function getDocFromSpec(spec: Record<string, Validator<any>>) {

  let docs = `
| 名字 | 类型 | 描述 | 默认值 |
| -- | -- | -- | -- |
`;

  Object.entries(spec).forEach(([key, [func, spec]]) => {
    docs += "|";
    docs +=
  [
    `\`${key}\``,
    docNames[func.name],
    // eslint-disable-next-line max-len
    `${spec.desc ? spec.desc.replaceAll("\n", "<br/>"): ""}${spec.choices ? "<br/>可选项："+spec.choices.join(",") :""}${spec.example ? "<br/>示例：" + spec.example : ""}`,
    "default" in spec ?
      (spec.default === undefined
        ? "不设置"
        : (typeof spec.default === "string"
          ? spec.default.replace(os.homedir(), "~")
          : spec.default))
      : "**必填**",
  ].join("|");
    docs += "|\n";
  });

  return docs;
}

export const envConfig = <T extends object>(
  specs: { [K in keyof T]: Validator<T[K]> },
  envObject = process.env,
) => {

  const envalidSpecs = {} as { [ K in keyof T]: ValidatorSpec<T[K]> };

  for (const k in specs) {
    const [func, spec] = specs[k];
    envalidSpecs[k] = func(spec);
  }

  return {
    ...customCleanEnv(
      envObject, envalidSpecs,
      (env, rawEnv) =>
        strictProxyMiddleware(parsePlaceholders(env, rawEnv) as T, rawEnv),
    ),
    _specs: specs,
  };
};

/** Custom validators */

function makeCustomValidator<T>(
  parseFn: (input: string) => T,
  name: string,
  docName: string,
) {
  const validator = makeValidator(parseFn);
  Object.defineProperty(validator, "name", { value: name });
  return make(validator, docName);
}

export const portOrZero = makeCustomValidator((x) => {
  const coerced = +x;
  if (
    Number.isNaN(coerced) ||
        `${coerced}` !== `${x}` ||
        coerced % 1 !== 0 ||
        coerced < 0 ||
        coerced > 65535
  ) {
    throw new EnvError(`Invalid port input: "${x}"`);
  }
  return coerced;
}, "portOrZero", "端口号");

export const regex = makeCustomValidator((x) => {
  if (!x) { return x; }
  new RegExp(x);
  return x;
}, "regex", "正则表达式");
