const { CI_COMMIT_MESSAGE, DEPLOY_AGENT_KEY, DEPLOY_AGENT_URL } = process.env;

if (!CI_COMMIT_MESSAGE || !DEPLOY_AGENT_KEY || !DEPLOY_AGENT_URL) {
  throw new Error("CI_COMMIT_MESSAGE, DEPLOY_AGENT_KEY, DEPLOY_AGENT_URL are required");
}

console.log("Configuration: ", { CI_COMMIT_MESSAGE, DEPLOY_AGENT_KEY, DEPLOY_AGENT_URL });

const NO_DEPLOY_SYMBOL = "[no deploy]";

if (!CI_COMMIT_MESSAGE.includes(NO_DEPLOY_SYMBOL)) {
  const response = await fetch(DEPLOY_AGENT_URL, {
    method: "POST",
    headers: {
      "x-deploy-agent-key": DEPLOY_AGENT_KEY,
      "content-type": "text/plain",
    },
  });
  console.log(await response.text());
} else {
  console.log(`commit message contains ${NO_DEPLOY_SYMBOL}. Deployment is skipped.`);
}

