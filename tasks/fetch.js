import path from "path";
import fs from "fs";
import tmp from "tmp-promise";
import child_process from "child_process";
import util from "util";
import config from "../config.json";
const exec = util.promisify(child_process.exec);

const REPO_URL = config.repoURL;
const WORKSPACE = "";

const fetchTask = () => {
  async function setupWorkspace() {
    console.log("setting up work space.");
    const tempDir = await tmp.dir({ mode: "0755" });
    WORKSPACE = tempDir.path;
    console.log("temp workspace ready.");
  }
  /**
   * Init repo
   */
  async function initRepository() {
    console.log(`Initalizing Repo in ${WORKSPACE}`);
    await exec("git init", { cwd: WORKSPACE });
    console.log("repo initalized");
  }
  async function addRemote() {
    console.log("adding remotes to git " + WORKSPACE);
    await exec(`git remote add ship ${REPO_URL}`, { cwd: WORKSPACE });
    console.log("remotes updated.");
  }
  async function fetch() {
    let fetchCommand = "git fetch ship --prune";
    const fetchDepth = shipit.config.shallowClone ? " --depth=1" : "";
    // fetch branches and tags separate to be compatible with git versions < 1.9
    fetchCommand += `${fetchDepth} && ${fetchCommand} "refs/tags/*:refs/tags/*"`;
    console.log('fetching repo '+ REPO_URL);
    await exec(fetchCommand, { cwd: WORKSPACE });
    console.log('repo fetched.');
  }
  async function checkout() {
      console.log('checking out master branch');
      await exec(`git checkout master`, { cwd: WORKSPACE });
      console.log('checked out');
  }
  async function reset() {
      console.log('restarting the tree');
      await exec('git reset --hard HEAD', { cwd: WORKSPACE });
      console.log('done resetting');
  }
  async function merge() {
    console.log('merging shit');  
    await exec('git merge ship/master', { cwd: WORKSPACE });
    console.log('branch merged from master to ship/master');
  }
  await setupWorkspace()
  if(WORKSPACE) {
      await initRepository()
      await setGitConfig()
      await addRemote()
      await fetch()
      await checkout()
      await reset()
      await merge()
  }
};

export default fetchTask;
