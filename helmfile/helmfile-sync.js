import { execSync, exec as execWithCallback } from "child_process";
import pc from "picocolors";
import { updateHelmfile } from "./modify-yaml.js";
import { errorHandler, getParsedArgs } from "./utils.js";
import { helmfilePath, workflowNameMap } from "./constants.js";

const exec = (...args) => {
  return new Promise((resolve, reject) => {
    execWithCallback(...args, (err, stdout, stderr) => {
      if (err) reject(err);
      else resolve(stdout);
    });
  });
};

const commitsMap = {};
const commitPromises = [];

const argsMap = getParsedArgs();

const getJobData = (jobs, jobName) => {
  return jobs.find((job) => {
    return job.name === jobName;
  });
};

const checkIfStepIsSuccessful = (steps, stepName) => {
  const step = steps.find((step) => step.name === stepName);
  return step.conclusion === "success";
};

const constructHelmfileCommand = () => {
  const nameSpaces = Object.keys(commitsMap).reduce((acc, repoName, index) => {
    const isLastItem = index === Object.keys(commitsMap).length - 1;
    const releaseName = repoName === "admin-dashboard" ? "dashboard" : repoName;
    return acc + `-l namespace=${releaseName}` + (isLastItem ? "" : " ");
  }, "");
  return `helmfile -f ${helmfilePath} ${nameSpaces} delete && helmfile -f ${helmfilePath} ${nameSpaces} sync`;
};

const addCommitIdToMap = async (namespace, attemptCount) => {
  const maxAttemptCount = argsMap.depth;
  const commonBranch = argsMap.branch;
  if (attemptCount > maxAttemptCount) return;

  let [repo, branch = "master"] = namespace.split(":");
  if (commonBranch) branch = commonBranch;

  if (!workflowNameMap[repo]) errorHandler.throwForInvalidRepoName(repo);

  const encodedBranchName = encodeURIComponent(branch);

  const mapPropertyName = branch === "master" ? "master" : "branch";
  const workflowFileName = workflowNameMap[repo][mapPropertyName].fileName;
  const workflowJobName = workflowNameMap[repo][mapPropertyName].jobName;
  const workflowJobStepName = workflowNameMap[repo][mapPropertyName].stepName;

  const workflowIdCommand = `gh api -H "Accept: application/vnd.github+json" -H "X-GitHub-Api-Version: 2022-11-28" "/repos/razorpay/${repo}/actions/workflows/${workflowFileName}/runs?branch=${encodedBranchName}&per_page=1&page=${attemptCount}" -q ".workflow_runs[0].id"`;

  const workflowRunId = (
    await exec(workflowIdCommand, {
      encoding: "utf-8",
    })
  ).trim();

  if (!workflowRunId)
    errorHandler.throwForWorkflowRunId(repo, branch, commonBranch);

  const jobsStatusCommand = `gh api -H "Accept: application/vnd.github+json" -H "X-GitHub-Api-Version: 2022-11-28" repos/razorpay/${repo}/actions/runs/${workflowRunId}/jobs`;

  const workflowJobsData = JSON.parse(
    (await exec(jobsStatusCommand, { encoding: "utf-8" })).trim()
  );

  if (!workflowJobsData || !workflowJobsData.jobs)
    errorHandler.throwForWorkflowJobsFetch(repo, branch);

  let commitId = undefined;
  const jobData = getJobData(workflowJobsData.jobs, workflowJobName);

  if (!jobData)
    errorHandler.throwForWorkflowJobNotFound(repo, branch, workflowJobName);
  else if (jobData.conclusion !== "success") {
    if (attemptCount === maxAttemptCount)
      errorHandler.throwForWorkflowJobNotSuccessful(
        repo,
        workflowJobName,
        workflowRunId
      );
    return addCommitIdsToMap(namespace, attemptCount + 1);
  }

  const isStepSuccessful = checkIfStepIsSuccessful(
    jobData.steps,
    workflowJobStepName
  );
  if (isStepSuccessful) {
    commitId = jobData.head_sha;
  }
  if (commitId) commitsMap[repo] = commitId;
  return commitId;
};

const init = () => {
  for (let namespace of argsMap.namespaces) {
    commitPromises.push(addCommitIdToMap(namespace, 1));
  }

  Promise.all(commitPromises).then((data) => {
    console.log(
      pc.blue("Commit IDs:"),
      commitsMap,
      pc.blue("Adding them to helmfile.yaml")
    );
    updateHelmfile(commitsMap, argsMap.label);
    const command = constructHelmfileCommand();
    console.log(pc.gray(command + "\n"));
    execSync(constructHelmfileCommand(), {
      encoding: "utf-8",
      stdio: "inherit",
    });
  });
};

init();
