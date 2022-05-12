import { route } from "@ddadaal/next-typed-api-routes-runtime";
import { authenticate } from "src/auth/server";

export interface SubmitJobInfo {
  cluster: string;
  command: string;
}

export interface SubmitJobSchema {

  method: "POST";

  body: SubmitJobInfo;

  responses: {
    201: {
      jobId: number;
    }
  }
}

const auth = authenticate(() => true);

export default route<SubmitJobSchema>("SubmitJobSchema", async (req, res) => {

  const info = await auth(req, res);

  if (!info) { return; }

  // STUB
  return { 201: { jobId: 10 } };


});
