import { readFileSync, writeFileSync } from "fs";
import pc from "picocolors";
import { parse, stringify } from "yaml";
import {
  helmfilePath,
  escapeTemplatingSyntaxRegex,
  unescapeTemplatingSyntaxRegex,
  namespaceToRepoNamesMap,
  workflowNameMap,
  defaultImageKeyName,
} from "./constants.js";

const escapeTemplatingSyntax = (fileContent) => {
  return fileContent.replace(escapeTemplatingSyntaxRegex, ' "{{$1}}"');
};

const unescapeTemplatingSyntax = (fileContent) => {
  return fileContent.replace(unescapeTemplatingSyntaxRegex, "$1");
};

const readYaml = () => {
  try {
    const fileContent = readFileSync(helmfilePath, "utf8");
    const escapedFileContent = escapeTemplatingSyntax(fileContent);

    return parse(escapedFileContent);
  } catch (e) {
    console.log(e);
  }
};

const writeYaml = (data) => {
  try {
    const yamlData = stringify(data);
    const unescapedYamlData = unescapeTemplatingSyntax(yamlData);
    writeFileSync(helmfilePath, unescapedYamlData, "utf8");
  } catch (e) {
    console.log(e);
  }
};

const updateLabel = (data, label) => {
  const { values } = data.environments.default;
  values.forEach((value) => {
    if ("devstack_label" in value) {
      value["devstack_label"] = label;
    }
  });
  return data;
};

const updateCommitIds = (data, commitsMap) => {
  const { releases } = data;
  const updatedReleases = releases.map((release) => {
    const namespace = release.namespace;
    let repoNames = namespaceToRepoNamesMap[namespace];
    repoNames = repoNames?.length > 0 ? repoNames : [namespace];

    repoNames.forEach((repoName) => {
      if (repoName in commitsMap) {
        const { values } = release;
        for (let keyValuePair of values) {
          const imageKeyName =
            workflowNameMap[repoName]?.imageKeyName || defaultImageKeyName;
          if (imageKeyName in keyValuePair) {
            keyValuePair[imageKeyName] = commitsMap[repoName];
          }
        }
      }
    });
    return release;
  });
  return { ...data, releases: updatedReleases };
};

export const updateHelmfile = (commitsMap, label) => {
  const parsedYAML = readYaml();
  let updatedFileContent = updateCommitIds(parsedYAML, commitsMap);
  if (label) updatedFileContent = updateLabel(parsedYAML, label);
  writeYaml(updatedFileContent);
  console.log(pc.green("\nSuccessfully updated helmfile.yaml\n"));
};
