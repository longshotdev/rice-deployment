const path = require("path");
require("dotenv").config({ path: path.join(__dirname, ".env") });

const express = require("express");

const { Octokit } = require("@octokit/rest");
const _exec = require("child_process").exec;
const util = require("util");
const shell = require("shelljs");
const colors = require("chalk");
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
server.get("/fuck", async (req, res) => {
  res.send(200);
  await deploy();
});
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
      await process_deployment(payload);
      break;
    case "deployment_status":
      update_deployment_status(payload);
      break;
    default:
      console.log(`Recived ${action} action. `);
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
async function process_deployment(payload) {
  let { deployment, repository } = payload;
  console.log("Processing Deployments.");
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
  await deploy();
  setTimeout(async () => {
    octokit.repos.createDeploymentStatus({
      owner: repository["owner"]["login"],
      repo: repository["name"],
      deployment_id: deployment["id"],
      state: "success",
    });
  }, 30000);
}
function update_deployment_status(payload) {
  //      console.log(`Deployment status for ${fuckyou['id']} is ${payload['state'                                                                                                                                                             ]}`);
  console.log(
    `🚧 Deployment Status: ${payload["deployment"]["environment"]} | ${payload["deployment_status"]["state"]}`
  );
}
// rice bot dir is /home/pi/.microservices/rice-bot
async function deploy() {
  // const DIR = process.cwd() + "/NiggaBonkHead";
  // const repoURL = "https://github.com/longshotdev/rice-bot.git";
  // const version = "v0.1";
  // console.log(DIR);
  // console.log(colors.green("Initalizing Local Repo"));
  // await exec(`git init`, { cwd: DIR });
  // console.log(colors.green("Add Remote"));
  // try {
  //   await exec(`git remote add ship ${repoURL}`, { cwd: DIR });
  //   console.log(colors.green("Fetch"));
  //   await exec(`git fetch ship --prune "refs/tags/*:refs/tags/*"`, {
  //     cwd: DIR,
  //   });
  // } catch (e) {}
  // console.log(colors.green("Checking out"));
  // await exec(`git checkout ${version}`, { cwd: DIR });
  // console.log(colors.green("Resetting"));
  // await exec(`git reset --hard`, { cwd: DIR }, execCB);
  // console.log(colors.green("Cleaning"));
  // await exec(`git clean -df`, { cwd: DIR }, execCB);
  // console.log(colors.green("Pulling."));
  // await exec(`git pull -f ship ${version}`, { cwd: DIR }, execCB);

  // await exec(`yarn --production`, { cwd: DIR }, execCB);

  // function execCB(err, stdout, stderr) {
  //   if (stdout) console.log(stdout);
  //   if (stderr) console.log(stderr);
  //   if (err) console.log(err);
  // }
  shell.cd("..");
  await shell.exec("~/scripts/deploy_stage", { async: true });
}

server.listen(3000, () => {
  console.log("🚀 Rice Deployment listening on port 3000!");
});
