import { DEFAULT_CONFIG_BASE_PATH } from "@scow/config/build/constants";
import fs from "fs";
import { contentType } from "mime-types";
import path from "path";
import { getHostname } from "src/utils/host";
import { route } from "src/utils/route";

export interface GetLogoSchema {

  method: "GET";

  responses: {
    200: any;
  }
}


const CUSTOM_LOGO_DIR = path.join(DEFAULT_CONFIG_BASE_PATH, "logo");

const CUSTOM_DEFAULT_DIR = path.join(CUSTOM_LOGO_DIR, "default");
const BUILTIN_DEFAULT_DIR = "assets/logo";

const DEFAULT_DIR = fs.existsSync(CUSTOM_DEFAULT_DIR) ? CUSTOM_DEFAULT_DIR : BUILTIN_DEFAULT_DIR;

export default /* #__PURE__*/route<GetLogoSchema>("GetLogoSchema", async (req, res) => {

  const hostname = getHostname(req);

  let dir = hostname ? path.join(CUSTOM_LOGO_DIR, hostname) : DEFAULT_DIR;

  if (!fs.existsSync(dir)) {
    dir = DEFAULT_DIR;

  }

  let imagePath = path.join(dir, "logo.png");

  if (!fs.existsSync(imagePath)) {
    imagePath = path.join(DEFAULT_DIR, "logo.png");

  }

  const stat = await fs.promises.stat(imagePath);

  res.writeHead(200, {
    "Content-Type": contentType(path.extname(imagePath)) || "application/octet-stream",
    "Content-Length": stat.size,
  });

  const readStream = fs.createReadStream(imagePath);
  await new Promise(function(resolve) {
    readStream.pipe(res);
    readStream.on("end", resolve);
  });

  res.end();

});
