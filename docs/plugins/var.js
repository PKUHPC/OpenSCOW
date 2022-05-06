// @ts-check

const BASE_PATH = process.env.BASE_PATH || "/";
const ORGANIZATION_NAME = "PKUHPC";
const PROJECT_NAME = "SCOW";
const GIT_PLATFORM = process.env.GIT_PLATFORM || "github.com";
const CR_URL = process.env.CR_URL || "https://ccimage.pku.edu.cn/chenjunda/scow";
const REPO_URL = `https://${GIT_PLATFORM}/${ORGANIZATION_NAME}/${PROJECT_NAME}`;
const REPO_FILE_URL = `${REPO_URL}/blob/master`;
const DOCS_URL = process.env.DOCS_URL;

const variables = {
  BASE_PATH,
  ORGANIZATION_NAME,
  PROJECT_NAME,
  GIT_PLATFORM,
  REPO_URL,
  CR_URL,
  REPO_FILE_URL,
  DOCS_URL,
};

/**
 * Replace %key% to variables[key]
 * @param {string} template template string
 * @returns replaced string
 */
const replace = (template) => {
  return template.replace(/%([a-zA-Z0-9_]+)%/g, (_, p1) => variables[p1] ?? "");
}

const visit = require('unist-util-visit');

const types = [
  { type: "link", property: "url" },
  { type: "code", property: "value" },
]

const plugin = (options) => {
  const transformer = async (ast) => {
    visit(ast, types.map((x) => x.type), (node) => {
      const selected = types.find((x) => x.type === node.type)
      if (selected) {
        node[selected.property] = replace(node[selected.property]);
      }
    });
  };
  return transformer;
};

module.exports = {
  plugin,
  variables,
};
