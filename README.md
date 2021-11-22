
<p align="center">
  <a href="https://github.com/l-lin/spectral-comment-action/actions"><img alt="spectral-comment-action status" src="https://github.com/l-lin/spectral-comment-action/workflows/units-test/badge.svg"></a>
</p>

# Spectral comment action

> Comments pull requests with [Spectral linter](https://github.com/stoplightio/spectral) linter
> outputs using Github action

![spectral-comment-action](./spectral-comment-action-sample.png)

Check [PR showcase](https://github.com/l-lin/spectral-comment-action/pull/3#issuecomment-600786379).

## Usage

Add or edit an existing workflow:

```yaml
name: "Run Spectral API Linter"

on:
  pull_request:
    branches:
      - master

jobs:
  spectral_workflow:
    name: Lint OpenAPI
    runs-on: ubuntu-latest
    steps:
      # Checkout the pull request to run Spectral on
      - name: Checkout PR branch
        uses: actions/checkout@v2
        with:
          ref: ${{ github.ref }}

      # Checkout custom spectral action to comment issues to the PR
      - name: Checkout Spectral Action
        uses: actions/checkout@v2
        with:
          repository: tyler-mairose-sp/spectral-comment-action
          path: spectral-comment-action
          ref: master

      # Install node and run npm install on spectral action to install required packages
      - name: Use Node.js
        uses: actions/setup-node@v1
        with:
          node-version: "12.x"
      - run: |
          ls -al
          cd spectral-comment-action
          npm ci

      # Run get-changed-files step to get all files changed in the PR as a comma seperated list for the spectral linter action to process with our rulesets
      - id: files
        with:
          format: "csv"
        uses: jitterbit/get-changed-files@v1

      # Run the spectral linter action and recieve a comment on the PR for any issues the linter found
      - name: Spectral comment
        uses: ./spectral-comment-action/
        with:
          github-token: ${{ secrets.GITHUB_TOKEN }}
          file-glob: ${{ steps.files.outputs.all }}
          spectral-root-ruleset: http://raw.githubusercontent.com/sailpoint-oss/api-linter/main/root-ruleset.yaml
          spectral-path-ruleset: http://raw.githubusercontent.com/sailpoint-oss/api-linter/main/path-ruleset.yaml
          spectral-schema-ruleset: http://raw.githubusercontent.com/sailpoint-oss/api-linter/main/schema-ruleset.yaml

```

## License

[MIT](./LICENSE)

