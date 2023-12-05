import { execSync, exec as execWithCallback } from "child_process";
import { addCommitIdsToHelmfile } from "./modify-yaml.js";
import { helmfilePath, workflowNameMap } from "./constants.js";
import pc from "picocolors";
import { errorHandler } from "./utils.js";

const exec = (...args) => {
  return new Promise((resolve, reject) => {
    execWithCallback(...args, (err, stdout, stderr) => {
      if (err) reject(err);
      else resolve(stdout);
    });
  });
};

const args = [...process.argv].filter((arg, index) => index > 1);

const commitsMap = {};
const commitPromises = [];

const getJobData = (jobs, jobName) => {
  return jobs.find((job) => {
    return job.name === jobName;
  });
};

const checkIfStepIsSuccessful = (steps, stepName) => {
  const step = steps.find((step) => step.name === stepName);
  return step.conclusion === "success";
};

const addCommitIdsToMap = async (arg) => {
  const [repo, branch = "master"] = arg.split(":");

  if (!workflowNameMap[repo]) errorHandler.throwForInvalidRepoName(repo);

  const encodedBranchName = encodeURIComponent(branch);

  const mapPropertyName = branch === "master" ? "master" : "branch";
  const workflowFileName = workflowNameMap[repo][mapPropertyName].fileName;
  const workflowJobName = workflowNameMap[repo][mapPropertyName].jobName;
  const workflowJobStepName = workflowNameMap[repo][mapPropertyName].stepName;

  const workflowIdCommand = `gh api -H "Accept: application/vnd.github+json" -H "X-GitHub-Api-Version: 2022-11-28" "/repos/razorpay/${repo}/actions/workflows/${workflowFileName}/runs?branch=${encodedBranchName}&per_page=1" -q ".workflow_runs[0].id"`;

  const workflowRunId = (
    await exec(workflowIdCommand, {
      encoding: "utf-8",
    })
  ).trim();

  if (!workflowRunId) errorHandler.throwForWorkflowRunId(repo, branch);

  const jobsStatusCommand = `gh api -H "Accept: application/vnd.github+json" -H "X-GitHub-Api-Version: 2022-11-28" repos/razorpay/${repo}/actions/runs/${workflowRunId}/jobs`;

  const workflowJobsData = JSON.parse(
    (await exec(jobsStatusCommand, { encoding: "utf-8" })).trim()
  );

  if (!workflowJobsData || !workflowJobsData.jobs)
    errorHandler.throwForWorkflowJobs(repo, branch);

  let commitId = undefined;
  const jobData = getJobData(workflowJobsData.jobs, workflowJobName);

  if (!jobData)
    errorHandler.throwForWorkflowJobNotFound(repo, branch, workflowJobName);
  else if (jobData.conclusion !== "success")
    errorHandler.throwForWorkflowJobNotSuccessful(
      repo,
      branch,
      workflowJobName
    );

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

const constructHelmfileCommand = () => {
  const nameSpaces = Object.keys(commitsMap).reduce((acc, repoName, index) => {
    const isLastItem = index === Object.keys(commitsMap).length - 1;
    const releaseName = repoName === "admin-dashboard" ? "dashboard" : repoName;
    return acc + `-l namespace=${releaseName}` + (isLastItem ? "" : " ");
  }, "");
  return `helmfile -f ${helmfilePath} ${nameSpaces} delete && helmfile -f ${helmfilePath} ${nameSpaces} sync`;
};

const init = () => {
  for (let arg of args) {
    commitPromises.push(addCommitIdsToMap(arg));
  }

  Promise.all(commitPromises).then((data) => {
    console.log(
      pc.blue("Commit IDs:"),
      commitsMap,
      pc.blue("Adding them to helmfile.yaml")
    );
    addCommitIdsToHelmfile(commitsMap);
    const command = constructHelmfileCommand();
    console.log(pc.gray(command + "\n"));
    execSync(constructHelmfileCommand(), {
      encoding: "utf-8",
      stdio: "inherit",
    });
  });
};

init();
