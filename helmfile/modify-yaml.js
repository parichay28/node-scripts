import { readFileSync, writeFileSync } from "fs";
import pc from "picocolors";
import { parse, stringify } from "yaml";
import {
  helmfilePath,
  escapeTemplatingSyntaxRegex,
  unescapeTemplatingSyntaxRegex,
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

const updateCommitIds = (data, commitsMap) => {
  const { releases } = data;
  const updatedReleases = releases.map((release) => {
    const namespace = release.namespace;
    // "dashboard" & "admin-dashboard" are deployed via "dashboard" namespace
    if (namespace in commitsMap || "admin-dashboard" in commitsMap) {
      const { values } = release;
      for (let keyValuePair of values) {
        // handle dashboard & admin-dashboard deployments
        if (namespace === "dashboard") {
          if (
            "admin-dashboard" in commitsMap &&
            "admin_image" in keyValuePair
          ) {
            keyValuePair["admin_image"] = commitsMap["admin-dashboard"];
          }
          if ("dashboard" in commitsMap && "image" in keyValuePair) {
            keyValuePair["image"] = commitsMap[namespace];
          }
        } else if ("image" in keyValuePair) {
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
  writeYaml(updatedFileContent);
  console.log(pc.green("\nSuccessfully updated helmfile.yaml\n"));
};
