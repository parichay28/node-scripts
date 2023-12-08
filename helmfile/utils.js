import pc from "picocolors";
import { exit } from "process";
import yargs from "yargs";
import { validRepoAndBranchRegex } from "./constants.js";

export const errorHandler = {
  throwForInvalidRepoName: (repo) => {
    console.log(
      `\nunable to find ${pc.red(
        `REPO=${repo}`
      )} in workflowNameMap. check if the repo name if correct or the mapping exists in workflowNameMap\n`
    );
    exit(1);
  },
  throwForWorkflowRunId: (repo, branch, commonBranch) => {
    const reason = commonBranch
      ? `Make sure repo(s), workflowFileName(s) are valid and ${pc.red(
          `BRANCH=${commonBranch}`
        )} exists for all repos specified`
      : `Make sure that repo, branch and workflowFileName in workflowNameMap are correct.`;
    console.log(
      `\nunable to find workflowRunId for ${pc.red(`REPO=${repo}`)} ${pc.red(
        `BRANCH=${branch}`
      )}. ${reason}\n`
    );
    exit(1);
  },
  throwForWorkflowJobsFetch: (repo, branch) => {
    console.log(
      `unable to find workflowRunId for ${pc.red(`REPO=${repo}`)} ${pc.red(
        `BRANCH=${branch}`
      )}`
    );
    exit(1);
  },
  throwForWorkflowJobNotFound: (repo, branch, workflowJobName) => {
    console.log(
      `unable to find job data for workflowJobName=${workflowJobName}. Check if jobName is specified correctly in workflowNameMap for ${pc.red(
        `REPO=${repo}`
      )} ${pc.red(`BRANCH=${branch}`)}`
    );
    exit(1);
  },
  throwForWorkflowJobNotSuccessful: (repo, workflowJobName, workflowRunId) => {
    console.log(
      pc.red(
        `Job "${workflowJobName}" is not successful for ${pc.red(
          `REPO=${repo}`
        )}. Please check the logs on ${pc.blue(
          `https://github.com/razorpay/${repo}/actions/runs/${workflowRunId}`
        )} or try adding --depth to search for older commits.`
      )
    );
    exit(1);
  },
};

export const getParsedArgs = () => {
  const { _, $0, ...args } = yargs(process.argv.slice(2))
    .option("n", {
      alias: "namespaces",
      describe: "Specify namespaces in repo:branch format",
      type: "array",
      demandOption: true,
      coerce: (namespaces) => {
        for (let namespace of namespaces) {
          if (!validRepoAndBranchRegex.test(namespace)) {
            console.log(
              `Invalid namespace ${pc.red(
                namespace
              )}. The namespace should be in ${pc.blue("repo")} or ${pc.blue(
                "repo:branch"
              )} format`
            );
            exit(1);
          }
        }
        return namespaces;
      },
    })
    .option("d", {
      alias: "depth",
      describe: "Specify the depth for the commit search",
      type: "number",
      default: 1,
      demandOption: false,
      coerce: (depth) =>
        Array.isArray(depth) ? depth[depth.length - 1] : depth,
    })
    .option("b", {
      alias: "branch",
      describe: "Specify a common branch for all namespaces",
      type: "string",
      default: "",
      demandOption: false,
      coerce: (branch) =>
        Array.isArray(branch) ? branch[branch.length - 1] : branch,
    }).argv;
  return args;
};
