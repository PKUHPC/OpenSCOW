import { route } from "@ddadaal/next-typed-api-routes-runtime";
import fs from "fs";
import { contentType } from "mime-types";
import path from "path";
import { CONFIG_PATH } from "src/utils/config";
import { getHostname } from "src/utils/host";

export interface GetIconSchema {

  method: "GET";

  query: {
    type: "favicon" | "192" | "512";
  };

  responses: {
    200: any;
  }
}


const CUSTOM_ICONS_DIR = path.join(CONFIG_PATH, "icons");

const BUILTIN_DEFAULT_DIR = "assets/icons";

const FILE_NAMES = {
  "favicon": "favicon.ico",
  "192": "192.png",
  "512": "512.png",
};

export default /*#__PURE__*/route<GetIconSchema>("GetIconSchema", async (req, res) => {

  const hostname = getHostname(req);

  let dir = hostname ? path.join(CUSTOM_ICONS_DIR, hostname) : BUILTIN_DEFAULT_DIR;

  if (!fs.existsSync(dir)) {
    dir = BUILTIN_DEFAULT_DIR;
  }

  let imagePath = path.join(dir, FILE_NAMES[req.query.type]);

  if (!fs.existsSync(imagePath)) {
    imagePath = path.join(dir, FILE_NAMES.favicon);
  }

  const stat = await fs.promises.stat(imagePath);

  res.writeHead(200, {
    "Content-Type": contentType(path.extname(imagePath)) || "application/octet-stream",
    "Content-Length": stat.size,
  });

  const readStream = fs.createReadStream(imagePath);
  await new Promise(function (resolve) {
    readStream.pipe(res);
    readStream.on("end", resolve);
  });

  res.end();

});
