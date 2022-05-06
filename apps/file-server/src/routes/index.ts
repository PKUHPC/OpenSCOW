import { copyRoute } from "src/routes/copy";
import { createFileRoute } from "src/routes/createFile";
import { deleteRoute } from "src/routes/delete";
import { getFileRoute } from "src/routes/getFile";
import { getHomeDirRoute } from "src/routes/home";
import { listRoute } from "src/routes/list";
import { mkdirRoute } from "src/routes/mkdir";
import { mvRoute } from "src/routes/mv";
import { uploadRoute } from "src/routes/upload";

export const routes = [
  listRoute,
  getFileRoute,
  mvRoute,
  deleteRoute,
  getHomeDirRoute,
  createFileRoute,
  mkdirRoute,
  uploadRoute,
  copyRoute,
];

