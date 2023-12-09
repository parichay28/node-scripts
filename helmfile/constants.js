export const escapeTemplatingSyntaxRegex = / {{(.*?)}}/g;
export const undoEscapeTemplatingSyntaxRegex = /"({{.*}})"/g;

export const helmfilePath = "path/to/kube-manifests/helmfile/helmfile.yaml";

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
