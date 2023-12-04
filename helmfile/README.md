<img src="https://drive.google.com/uc?id=1klvNwPIgPnJGgtH6ju1PlmosBT7Y8WrE" width="500px">

## Getting Started
1. Make sure required dependencies like yarn & node are present.
   
2. Update `helmfilePath` in `constants.js` to the desired path.
   
3. Add below script to your bash config (zshrc or bashrc). Feel free to modify name of the function according to your liking.

```bash
 hs() {
  scriptPath="path/to/helmfile-sync.js"
  node $scriptPath "$@"
 }
```
4. Reload shell config (`source ~/.zshrc` or `source ~/.bashrc`)


## Command format:
<br />`hs repo_name:branch_name repo_name_2:branch_name_2 ... repo_name_n:branch_name_n`<br/><br/>or<br/><br/>`hs repo_name repo_name_2 ... repo_name_n`
   
   

If branch name is omitted, master is assumed by default.

> fetches latest commit with build passing for specified servies, updates commit id in helmfile.yaml and deploys the pods.

## Adding support for new service

   Add the workflow name, job name & step name of the build workflow for the service that you want to onboard in `constants.js`. These can be found in `.github/workflows` folder


