import { errorHandler } from "./utils.js";

export const escapeTemplatingSyntaxRegex = / {{(.*?)}}/g;
export const unescapeTemplatingSyntaxRegex = /"({{.*}})"/g;

if (!process.env.HELMFILE_PATH) errorHandler.throwForHelmfilePath();
export const helmfilePath = process.env.HELMFILE_PATH;

export const validRepoAndBranchRegex =
  /^[^-][a-zA-Z0-9_-]*([^-][a-zA-Z0-9_-]*)?(:[a-zA-Z0-9\/_-]+)?$/;

// Git commit IDs can be either 40-character or 7-character hexadecimal strings
export const commitIdRegex = /^[0-9a-fA-F]{7,40}$/;

export const defaultImageKeyName = "image";

export const monorepoMap = {
  "frontend-x": "frontend-x",
};

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
    namespace: "dashboard",
    imageKeyName: "admin_image",
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
      jobName: "Docker image - api (ARM64)",
      stepName: "Build and Push to Harbor",
    },
    master: {
      fileName: "ci.yml",
      jobName: "Docker image - api (ARM64)",
      stepName: "Build and Push to Harbor",
    },
  },
  api: {
    branch: {
      fileName: "build_images.yml",
      jobName: "Build Web Native (linux-arm64)",
      stepName: "build",
    },
    master: {
      fileName: "build_images.yml",
      jobName: "Build Web Native (linux-arm64)",
      stepName: "build",
    },
  },
  dashboard: {
    branch: {
      fileName: "build.yml",
      jobName: "Build Dashboard",
      stepName: "Web - PHP Server Build",
    },
    master: {
      fileName: "build.yml",
      jobName: "Build Dashboard",
      stepName: "Web - PHP Server Build",
    },
  },
  "banking-accounts": {
    namespace: "banking-account",
    branch: {
      fileName: "ci.yml",
      jobName: "Build Dashboard",
      stepName: "build",
    },
    master: {
      fileName: "ci.yml",
      jobName: "Build service image for each commit",
      stepName: "Build and push",
    },
  },
  "master-onboarding": {
    branch: {
      fileName: "ci.yaml",
      jobName: "Docker image - api",
      stepName: "Build and push",
    },
    master: {
      fileName: "ci.yaml",
      jobName: "Docker image - api",
      stepName: "Build and push",
    },
  },
  "business-verification-service": {
    namespace: "bvs",
    branch: {
      fileName: "ci.yml",
      jobName: "Build API Docker Image",
      stepName: "Build and push",
    },
    master: {
      fileName: "ci.yml",
      jobName: "Build API Docker Image",
      stepName: "Build and push",
    },
  },
  "business-reporting": {
    branch: {
      fileName: "ci.yml",
      jobName: "Docker image - base",
      stepName: "Build And Push",
    },
    master: {
      fileName: "ci.yml",
      jobName: "Docker image - base",
      stepName: "Build And Push",
    },
  },
  terminals: {
    branch: {
      fileName: "ci.yml",
      jobName: "Api Build",
      stepName: "Post build",
    },
    master: {
      fileName: "ci.yml",
      jobName: "Api Build",
      stepName: "Post build",
    },
  },
  router: {
    branch: {
      fileName: "ci.yml",
      jobName: "Build Image",
      stepName: "Post build and push",
    },
    master: {
      fileName: "ci.yml",
      jobName: "Build Image",
      stepName: "Post build and push",
    },
  },
  mozart: {
    branch: {
      fileName: "CI.yml",
      jobName: "Build Mozart",
      stepName: "Build mozart and push image to Harbor",
    },
    master: {
      fileName: "CI.yml",
      jobName: "Build Mozart",
      stepName: "Build mozart and push image to Harbor",
    },
  },
  onboarding: {
    branch: {
      fileName: "ci.yml",
      jobName: "Build API Docker Image",
      stepName: "build api",
    },
    master: {
      fileName: "ci.yml",
      jobName: "Build API Docker Image",
      stepName: "build api",
    },
  },
  batch: {
    branch: {
      fileName: "ci_batch.yml",
      jobName: "Build Batch",
      stepName: "Post Build and Push",
    },
    master: {
      fileName: "ci_batch.yml",
      jobName: "Build Batch",
      stepName: "Post Build and Push",
    },
  },
  ufh: {
    branch: {
      fileName: "build.yml",
      jobName: "Run Build",
      stepName: "Post build",
    },
    master: {
      fileName: "build.yml",
      jobName: "Run Build",
      stepName: "Post build",
    },
  },
  "vendor-experience": {
    branch: {
      fileName: "ci.yml",
      jobName: "Merge Manifest API",
      stepName: "Build and Push manifest",
    },
    master: {
      fileName: "ci.yml",
      jobName: "Merge Manifest API",
      stepName: "Build and Push manifest",
    },
  },
  "frontend-x": {
    "x-vendor-portal": {
      namespace: "x",
      imageKeyName: "vendor_portal_image",
      branch: {
        fileName: "x-vendor-portal-build.yml",
        jobName: "Beta Build",
        stepName: "Push Artifacts to Stage S3 Cache",
      },
      master: {
        fileName: "x-vendor-portal-build.yml",
        jobName: "Beta Build",
        stepName: "Push Artifacts to Stage S3 Cache",
      },
    },
  },
  "payout-links": {
    branch: {
      fileName: "ci.yaml",
      jobName: "Build image for deployment and push",
      stepName: "Build and push",
    },
    master: {
      fileName: "ci.yaml",
      jobName: "Build image for deployment and push",
      stepName: "Build and push",
    },
  },
  "vendor-payments": {
    branch: {
      fileName: "ci.yml",
      jobName: "Build Image And Push",
      stepName: "Build and Push to Harbor - v2",
    },
    master: {
      fileName: "ci.yml",
      jobName: "Build Image And Push",
      stepName: "Build and Push to Harbor - v2",
    },
  },
};

export const namespaceToRepoNamesMap = {
  "banking-account": ["banking-accounts"],
  dashboard: ["dashboard", "admin-dashboard"],
  bvs: ["business-verification-service"],
  x: ["x", "frontend-x"],
};
