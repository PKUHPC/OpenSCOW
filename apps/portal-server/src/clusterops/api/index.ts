import { AppOps } from "src/clusterops/api/app";
import { JobOps } from "src/clusterops/api/job";

export interface ClusterOps {
  app: AppOps;
  job: JobOps;
}