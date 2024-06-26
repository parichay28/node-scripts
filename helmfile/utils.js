import pc from "picocolors";
import { exit } from "process";
import yargs from "yargs";
import { commitIdRegex, validRepoAndBranchRegex } from "./constants.js";

export const errorHandler = {
  throwForHelmfilePath: () => {
    console.log(
      pc.red(
        "Please set absolute path of helmfile in HELMFILE_PATH env variable"
      )
    );
    exit(1);
  },
  throwForInvalidRepoName: (repo, repoPackage) => {
    const repoPackageString = repoPackage
      ? ` & REPO_PACKAGE=${repoPackage} `
      : "";
    console.log(
      `\nunable to find ${pc.red(
        `REPO=${repo}${repoPackageString}`
      )} in workflowNameMap. check if the repo name ${
        repoPackageString ? "repo package name" : ""
      } is correct and the mapping exists in workflowNameMap\n`
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
      `Job "${workflowJobName}" is not successful for ${pc.red(
        `REPO=${repo}`
      )}. Please check the logs on ${pc.blue(
        `https://github.com/razorpay/${repo}/actions/runs/${workflowRunId}`
      )} or try adding depth arg to search for older commits.`
    );
    exit(1);
  },
  throwForStepNotFound: (repo, stepName) => {
    console.log(
      `unable to find ${pc.red(`STEP_NAME=${stepName}`)} for ${pc.red(
        `REPO=${repo}`
      )}. Check if stepName is specified correctly in workflowNameMap.`
    );
    exit(1);
  },
};

const deduplicateMultipleValuesForArg = (argValue) =>
  Array.isArray(argValue) ? argValue[argValue.length - 1] : argValue;

export const getParsedArgs = () => {
  const { _, $0, ...args } = yargs(process.argv.slice(2))
    .option("n", {
      alias: "namespaces",
      describe: "Specify namespaces in repo:branch or repo:commit_id format",
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
              )} or ${pc.blue("repo:package:branch")} format`
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
      coerce: deduplicateMultipleValuesForArg,
    })
    .option("b", {
      alias: "branch",
      describe: "Specify a common branch for all namespaces",
      type: "string",
      default: "",
      demandOption: false,
      coerce: deduplicateMultipleValuesForArg,
    })
    .option("l", {
      alias: "label",
      describe: "label to be used for namespaces",
      type: "string",
      default: "",
      demandOption: false,
      coerce: deduplicateMultipleValuesForArg,
    }).argv;
  return args;
};

export const isCommitId = (target) => {
  return commitIdRegex.test(target);
};
