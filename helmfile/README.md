<img src="https://drive.google.com/uc?id=1aJEF9moem6_-XfCKSAUmQ8IQ46XwUNRR" width="500px">

## Getting Started
1. Install node from [here](https://nodejs.org/en).

2. Install yarn by running `npm install -g yarn`.

3. Install GH CLI by running `brew install gh`.
   
4. Add `HEMLFILE_PATH` env variable to your bash config (zshrc or bashrc) containing absolute path to `helmfile.yaml`.
   
5. Add below script to your bash config (zshrc or bashrc). Feel free to modify name of the function according to your liking.

```bash
 hs() {
  scriptPath="path/to/helmfile-sync.js"
  node $scriptPath "$@"
 }
```
4. Reload shell config (`source ~/.zshrc` or `source ~/.bashrc`) for latest changes to take effect.

## Options
`hs --help` to check out out all valid options


## Example Usage:
- `hs -n repo_name_1 repo_name_2 ... repo_name_n`<br />
- `hs -n repo_name_1:branch_name repo_name_2:branch_name_2 ...`<br />
- `hs -n repo_name_1:commit_id repo_name_2:branch_name_2 ...`<br />
- `hs -n repo_name_1:repo_package_name:commit_id repo_name_2:branch_name_2 ...`<br />

<br />
> - If branch or commit_id is omitted, `master` branch is assumed by default.
> - If commit_id is specified it's used directly in helmfile.


## Adding support for new service

Add the workflow name, job name & step name of the build workflow for the service that you want to onboard in `constants.js`. These can be found in `.github/workflows` folder


