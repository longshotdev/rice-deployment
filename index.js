const path = require("path");
require("dotenv").config({ path: path.join(__dirname, ".env") });

const express = require("express");

const { Octokit } = require("@octokit/rest");

const octokit = new Octokit({
  auth: process.env.GH_ACCESS_TOKEN,
  userAgent: "Longshot Dev Services/1.0",
  timeZone: "America/Los_Angeles",
});
let server = express();

/*
Using the same layout as github's sinatra
*/
server.use(express.json());
server.use(express.urlencoded({ extended: true }));

server.get("/", (r, rs) => {
  rs.send("deployment main page.");
});
let fuckyou;
server.post("/deploy", async (req, res) => {
  let { payload } = req.body;
  console.log(payload);
  payload = JSON.parse(payload);
  const action = req.header("X-GitHub-Event");
  console.log(action);
  switch (action) {
    case "pull_request":
      if (payload["action"] == "closed" && payload["pull_request"]["merged"]) {
        await start_deployment(payload["pull_request"]);
        console.log("YES YES WE ARE FUCKING HERE");
      }
      break;
    case "deployment":
      process_deployment(payload);
      break;
    case "deployment_status":
      update_deployment_status(payload);
      break;
    default:
      console.log("ok");
      break;
  }

  res.sendStatus(200);
});
async function start_deployment(pr) {
  user = pr["user"]["login"];
  payload = {
    environment: "production",
    deploy_user: user,
  };
  await octokit.repos.createDeployment({
    owner: pr["head"]["repo"]["owner"]["login"],
    repo: pr["head"]["repo"]["name"],
    ref: pr["head"]["sha"],
    auto_merge: false,
  });
}
function process_deployment(payload) {
  console.log("processing");
  let { deployment, repository } = payload;
  console.log("processing deploymets");
  //console.log(`Processing ${deployment['description']} for ${fuckyou['de                                                                                                                                                             ploy_user']} to ${fuckyou['environment']}`)
  // PROCESS ENABLE
  setTimeout(async () => {
    await octokit.repos.createDeploymentStatus({
      owner: repository["owner"]["login"],
      repo: repository["name"],
      deployment_id: deployment["id"],
      state: "pending",
    });
  }, 1000);
  console.log("pending state");

  setTimeout(async () => {
    octokit.repos.createDeploymentStatus({
      owner: repository["owner"]["login"],
      repo: repository["name"],
      deployment_id: deployment["id"],
      state: "success",
    });
  }, 10000);
}
function update_deployment_status(payload) {
  //      console.log(`Deployment status for ${fuckyou['id']} is ${payload['state'                                                                                                                                                             ]}`);
  console.log(
    `Status: ${payload["deployment"]["environment"]} | ${payload["deployment_status"]["state"]}`
  );
}
server.listen(3000, () => {
  console.log("🚀 Rice Deployment listening on port 3000!");
});
