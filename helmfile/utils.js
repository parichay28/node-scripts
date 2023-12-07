import pc from "picocolors";
import { exit } from "process";
import { optionsMetaDataMap, validRepoAndBranchRegex } from "./constants.js";

export const errorHandler = {
  throwForInvalidRepoName: (repo) => {
    console.log(
      pc.red(
        `\nunable to find REPO=${repo} in workflowNameMap. check if the repo name if correct or the mapping exists in workflowNameMap\n`
      )
    );
    exit(1);
  },
  throwForWorkflowRunId: (repo, branch) => {
    console.log(
      pc.red(
        `\nunable to find workflowRunId for REPO=${repo} BRANCH=${branch}. Make sure that repo, branch and workflowFileName in workflowNameMap are correct.\n`
      )
    );
    exit(1);
  },
  throwForWorkflowJobsFetch: (repo, branch) => {
    console.log(
      pc.red(`unable to find workflowRunId for REPO=${repo} BRANCH=${branch}`)
    );
    exit(1);
  },
  throwForWorkflowJobNotFound: (repo, branch, workflowJobName) => {
    console.log(
      pc.red(
        `unable to find job data for workflowJobName=${workflowJobName}. Check if jobName is specified correctly in workflowNameMap for REPO=${repo} BRANCH=${branch}`
      )
    );
    exit(1);
  },
  throwForWorkflowJobNotSuccessful: (repo, workflowJobName, workflowRunId) => {
    console.log(
      pc.red(
        `Job "${workflowJobName}" is not successful for REPO=${repo}. Please check the logs on ${pc.blue(
          `https://github.com/razorpay/${repo}/actions/runs/${workflowRunId}`
        )}`
      )
    );
    exit(1);
  },
};

export const convertArgsArrayToMap = (args) => {
  const argsMap = {};

  for (let arg of args) {
    if (validRepoAndBranchRegex.test(arg)) {
      argsMap.namespaces = argsMap.namespaces
        ? argsMap.namespaces.concat(arg)
        : [arg];
    } else {
      const [argWithPrefix, value] = arg.split("=");
      const argName = argWithPrefix.slice(2);
      if (optionsMetaDataMap[argName].dataType === "number") {
        const valueInNumberType = Number(value);
        if (!Number.isNaN(valueInNumberType)) {
          argsMap[argName] = valueInNumberType;
        }
      } else {
        argsMap[argName] = value;
      }
    }
  }
  return argsMap;
};
