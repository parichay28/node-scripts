<img src="https://drive.google.com/uc?id=1klvNwPIgPnJGgtH6ju1PlmosBT7Y8WrE" width="500px">

## Getting Started
1. Install node from [here](https://nodejs.org/en).

2. Install yarn by running `npm install -g yarn`.

3. Install GH CLI by running `brew install gh`.
   
4. Update `helmfilePath` in `constants.js` to the desired path.
   
5. Add below script to your bash config (zshrc or bashrc). Feel free to modify name of the function according to your liking.

```bash
 hs() {
  scriptPath="path/to/helmfile-sync.js"
  node $scriptPath "$@"
 }
```
4. Reload shell config (`source ~/.zshrc` or `source ~/.bashrc`) for latest changes to take effect.


## Command format:
<br />`hs repo_name:branch_name repo_name_2:branch_name_2 ... repo_name_n:branch_name_n`<br/><br/>or<br/><br/>`hs repo_name repo_name_2 ... repo_name_n`

If branch name is omitted, master is assumed by default.

> fetches latest commit with build passing for specified servies, updates commit id in helmfile.yaml and deploys the pods.

## Options
`hs --help` to check out out all valid options


## Adding support for new service

   Add the workflow name, job name & step name of the build workflow for the service that you want to onboard in `constants.js`. These can be found in `.github/workflows` folder


