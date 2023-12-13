import { errorHandler } from "./utils.js";

export const escapeTemplatingSyntaxRegex = / {{(.*?)}}/g;
export const unescapeTemplatingSyntaxRegex = /"({{.*}})"/g;

if (!process.env.HELMFILE_PATH) errorHandler.throwForHelmfilePath();
export const helmfilePath = process.env.HELMFILE_PATH;

export const validRepoAndBranchRegex = /^[^-][a-z0-9_-]*(:[a-z0-9_-]+)?$/;

// Git commit IDs can be either 40-character or 7-character hexadecimal strings
export const commitIdRegex = /^[0-9a-fA-F]{7,40}$/;

export const workflowNameMap = {
  x: {
    branch: {
      fileName: "build-branch.yml",
      jobName: "build",
      stepName:
        "Configure AWS credentials For saving the artifacts to stage bucket",
    },
    master: {
      fileName: "run-e2e-on-master.yml",
      jobName: "e2e-on-master-merge",
      stepName:
        "Configure AWS credentials For saving the artifacts to stage bucket",
    },
  },
  "admin-dashboard": {
    branch: {
      fileName: "build.yml",
      jobName: "Beta Build",
      stepName: "Push build to devstack consumption",
    },

    master: {
      fileName: "build.yml",
      jobName: "Beta Build",
      stepName: "Push build to devstack consumption",
    },
  },
  workflows: {
    branch: {
      fileName: "ci.yaml",
      jobName: "Build: api",
      stepName: "build",
    },
    master: {
      fileName: "ci.yaml",
      jobName: "Build: api",
      stepName: "build",
    },
  },
  xperience: {
    branch: {
      fileName: "ci.yml",
      jobName: "Docker image - api",
      stepName: "build",
    },
    master: {
      fileName: "ci.yml",
      jobName: "Docker image - api",
      stepName: "build",
    },
  },
  api: {
    branch: {
      fileName: "build_images.yml",
      jobName: "Build Web Native (linux-amd64)",
      stepName: "build",
    },
    master: {
      fileName: "build_images.yml",
      jobName: "Build Web Native (linux-amd64)",
      stepName: "build",
    },
  },
};
