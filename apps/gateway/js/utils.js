const fileServers = process.env["FILE_SERVERS"];

const map = fileServers.split(",").reduce((prev, curr) => {
  const result = curr.split("=").map((x) => x.trim());
  if (result[0]) {
    prev[result[0]] = result[1] ?? "";
  }
  return prev;
}, {});

function getIp(r) {
  const ip = map[r.variables.file_server_host];
  if (ip === undefined) {
    r.return(400, "Invalid host");
  }
  return ip;
}

export default { getIp };
