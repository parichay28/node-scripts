import { execSync, exec as execWithCallback } from "child_process";
import pc from "picocolors";
import { updateHelmfile } from "./modify-yaml.js";
import { errorHandler, getParsedArgs, isCommitId } from "./utils.js";
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

const checkIfStepIsSuccessful = (steps, stepName, repo) => {
  const step = steps.find((step) => step.name === stepName);
  if (!step?.conclusion) errorHandler.throwForStepNotFound(repo, stepName);
  return step.conclusion === "success";
};

const constructHelmfileCommand = () => {
  const nameSpaces = Object.keys(commitsMap).reduce((acc, repoName, index) => {
    const isLastItem = index === Object.keys(commitsMap).length - 1;
    const namespace = workflowNameMap[repoName]?.namespace || repoName;
    return acc + `-l namespace=${namespace}` + (isLastItem ? "" : " ");
  }, "");
  return `helmfile -f ${helmfilePath} ${nameSpaces} delete && helmfile -f ${helmfilePath} ${nameSpaces} sync`;
};

const addCommitIdToMap = async (namespace, attemptCount) => {
  const maxAttemptCount = argsMap.depth;
  const commonBranch = argsMap.branch;
  if (attemptCount > maxAttemptCount) return;

  let [repo, target] = namespace.split(":");

  let commitId = isCommitId(target) ? target : undefined;
  let branch = !commitId
    ? target
      ? target
      : commonBranch || "master"
    : undefined;

  if (!workflowNameMap[repo]) errorHandler.throwForInvalidRepoName(repo);

  const encodedBranchName = encodeURIComponent(branch);

  const mapPropertyName = branch === "master" ? "master" : "branch";
  const workflowFileName = workflowNameMap[repo][mapPropertyName].fileName;
  const workflowJobName = workflowNameMap[repo][mapPropertyName].jobName;
  const workflowJobStepName = workflowNameMap[repo][mapPropertyName].stepName;

  if (!commitId) {
    const workflowIdCommand = `gh api -H "Accept: application/vnd.github+json" -H "X-GitHub-Api-Version: 2022-11-28" "/repos/razorpay/${repo}/actions/workflows/${workflowFileName}/runs?branch=${encodedBranchName}&per_page=1&page=${attemptCount}" -q ".workflow_runs[0].id"`;

    const workflowRunId = (
      await exec(workflowIdCommand, {
        encoding: "utf-8",
      })
    ).trim();

    if (!workflowRunId)
      errorHandler.throwForWorkflowRunId(repo, branch, commonBranch);

    const jobsDataCommand = `gh api -H "Accept: application/vnd.github+json" -H "X-GitHub-Api-Version: 2022-11-28" repos/razorpay/${repo}/actions/runs/${workflowRunId}/jobs`;

    const workflowJobsData = JSON.parse(
      (await exec(jobsDataCommand, { encoding: "utf-8" })).trim()
    );

    if (!workflowJobsData || !workflowJobsData.jobs)
      errorHandler.throwForWorkflowJobsFetch(repo, branch);

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
      return addCommitIdToMap(namespace, attemptCount + 1);
    }

    const isStepSuccessful = checkIfStepIsSuccessful(
      jobData.steps,
      workflowJobStepName,
      repo
    );
    if (isStepSuccessful) {
      commitId = jobData.head_sha;
    }
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
