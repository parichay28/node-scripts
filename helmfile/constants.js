export const escapeTemplatingSyntaxRegex = / {{(.*?)}}/g;
export const unescapeTemplatingSyntaxRegex = /"({{.*}})"/g;

export const helmfilePath = "path/to/kube-manifests/helmfile/helmfile.yaml";

export const optionsMetaDataMap = {
  depth: {
    dataType: "number",
    defaultValue: 1,
    isRequired: false,
    regex: /--depth=/,
  },
};
export const validRepoAndBranchRegex = /^[^-][a-z0-9_-]*(:[a-z0-9_-]+)?$/;
export const validOptionRegexes = Object.values(optionsMetaDataMap).map(
  (metaData) => metaData.regex
);

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
