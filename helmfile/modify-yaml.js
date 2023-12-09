import { readFileSync, writeFileSync } from "fs";
import { parse, stringify } from "yaml";
import {
  escapeTemplatingSyntaxRegex,
  helmfilePath,
  undoEscapeTemplatingSyntaxRegex,
} from "./constants.js";
import pc from "picocolors";

const readYaml = () => {
  try {
    const fileContent = readFileSync(helmfilePath, "utf8");
    const escapedFileContent = escapeTemplatingSyntax(fileContent);

    return parse(escapedFileContent);
  } catch (e) {
    console.log(e);
  }
};

const saveYaml = (data) => {
  try {
    const yamlData = stringify(data);
    const unescapedYamlData = undoEscapeTemplatingSyntax(yamlData);
    writeFileSync(helmfilePath, unescapedYamlData, "utf8");
  } catch (e) {
    console.log(e);
  }
};

const escapeTemplatingSyntax = (fileContent) => {
  return fileContent.replace(escapeTemplatingSyntaxRegex, ' "{{$1}}"');
};

const undoEscapeTemplatingSyntax = (fileContent) => {
  return fileContent.replace(undoEscapeTemplatingSyntaxRegex, "$1");
};

const updateCommitIds = (data, commitsMap) => {
  const { releases } = data;
  const updatedReleases = releases.map((release) => {
    const namespace = release.namespace;
    if (namespace in commitsMap) {
      const { values } = release;
      for (let keyValuePair of values) {
        if ("image" in keyValuePair) {
          keyValuePair["image"] = commitsMap[namespace];
        }
      }
      return release;
    } else return release;
  });
  return { ...data, releases: updatedReleases };
};

export const addCommitIdsToHelmfile = (commitsMap) => {
  const parsedYAML = readYaml();
  const updatedFileContent = updateCommitIds(parsedYAML, commitsMap);
  saveYaml(updatedFileContent);
  console.log(pc.green("\nSuccessfully updated helmfile.yaml\n"));
};
