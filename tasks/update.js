import util from "util";
import path from "path2/posix";
import config from "../config.json";
import child_process from "child_process";

const exec = util.promisify(child_process.exec);
const updateTask = () => {
  // async function copyPreviousRelease() {
  //     console.log('copy previous release to %s', config.releasePath);
  //     await exec(
  //         util.format(
  //             'cp %s %s/. %s',
  //             '-a',
  //             path.join()
  //         )
  //     )
  // }
  async function createReleasePath() {
    /* eslint-disable no-param-reassign */
    releaseDirname = moment.utc().format("YYYYMMDDHHmmss");
    releasePath = path.join(config.releasesPath, releaseDirname);
    /* eslint-enable no-param-reassign */

    shipit.log('Create release path "%s"', releasePath);
    await exec(`mkdir -p ${releasePath}`);
    console.log("made hsit");
  }
  async function remoteCopy() {
    console.log("copy project to server.");
    let srcDir = "";
  }
};
export default updateTask;
