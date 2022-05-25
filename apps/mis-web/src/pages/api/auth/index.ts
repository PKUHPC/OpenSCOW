import { NextApiRequest, NextApiResponse } from "next";
import { runtimeConfig } from "src/utils/config";

export default (req: NextApiRequest, res: NextApiResponse) => {

  const callbackUrl = `${process.env.NEXT_PUBLIC_BASE_PATH || ""}/api/auth/callback`;

  res.redirect(`${runtimeConfig.AUTH_EXTERNAL_URL}/public/auth?callbackUrl=${callbackUrl}`);
};
