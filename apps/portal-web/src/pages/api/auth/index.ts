import { NextApiRequest, NextApiResponse } from "next";
import { join } from "path";
import { runtimeConfig } from "src/utils/config";

export default (req: NextApiRequest, res: NextApiResponse) => {

  const callbackUrl = `${process.env.NEXT_PUBLIC_BASE_PATH || ""}/api/auth/callback`;

  res.redirect(join(
    runtimeConfig.BASE_PATH,
    `/auth/public/auth?callbackUrl=${callbackUrl}`,
  ));
};
