import { NextApiRequest, NextApiResponse } from "next";
import { applyMiddleware } from "src/applyMiddleware";

const handler = (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method === "GET") {
    res.status(200).json({
      mis: {
        rewriteNavigations: true,
      },
    });
  } else {
    res.status(405).json({ message: "Method Not Allowed" });
  }
};

export default applyMiddleware(handler);
