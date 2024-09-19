const core = require("@actions/core");
const github = require("@actions/github");
const readFilesToAnalyze = require("./read_files");
const { initProcessedPbs, processPbs } = require("./process_pbs");
const { runSpectral, createSpectral } = require("./spectral");
const toMarkdown = require("./to_markdown");

// most @actions toolkit packages have async methods
async function run() {
  try {
    const context = github.context;
    if (!context.payload.pull_request) {
      core.error("this action only works on pull_request events");
      core.setOutput("comment-created", "false");
      return;
    }

    const inputs = {
      githubToken: core.getInput("github-token"),
      fileGlob: core.getInput("file-glob") || "sample/sailpoint.yml",
      spectralRootRuleset:
        core.getInput("spectral-root-ruleset") ||
        "https://raw.githubusercontent.com/sailpoint-oss/api-linter/main/root-ruleset.yaml",
      spectralPathRuleset:
        core.getInput("spectral-path-ruleset") ||
        "https://raw.githubusercontent.com/sailpoint-oss/api-linter/main/path-ruleset.yaml",
      spectralSchemaRuleset:
        core.getInput("spectral-schema-ruleset") ||
        "https://raw.githubusercontent.com/sailpoint-oss/api-linter/main/schema-ruleset.yaml",
      githubURL: core.getInput("github-url"),
    };

    const project = {
      githubURL: inputs.githubURL,
      repository: process.env.GITHUB_REPOSITORY,
      headRef: process.env.GITHUB_HEAD_REF,
      workspace:
        process.env.GITHUB_WORKSPACE ||
        "/Users/tyler.mairose/development/spectral-comment-action/",
    };

    console.log("Workspace:" + project.workspace);
    console.log("FileGlob: " + inputs.fileGlob);
    console.log("File Path: " + project.workspace + "/" + inputs.fileGlob);

    const fileContents = await readFilesToAnalyze(
      project.workspace,
      inputs.fileGlob
    );
    var rootSpectral = null;
    var pathSpectral = null;
    var schemaSpectral = null;

    let processedPbs = initProcessedPbs();
    for (var i = 0, len = fileContents.length; i < len; i++) {
      console.log(
        "Changing Directory to: " +
          fileContents[i].file.substr(0, fileContents[i].file.lastIndexOf("/"))
      );

      process.chdir(
        project.workspace +
          "/" +
          fileContents[i].file.substr(0, fileContents[i].file.lastIndexOf("/"))
      );

      let pbs = "";

      if (fileContents[i].file.includes(`sailpoint-api.`)) {
        console.log(`Running root ruleset on ${fileContents[i].file}`);
        rootSpectral = await createSpectral(inputs.spectralRootRuleset);
        pbs = await runSpectral(rootSpectral, fileContents[i].content, false);
      } else if (fileContents[i].file.includes(`paths`)) {
        console.log(`Running path ruleset on ${fileContents[i].file}`);
        pathSpectral = await createSpectral(inputs.spectralPathRuleset);
        pbs = await runSpectral(pathSpectral, fileContents[i].content, true);
      } else if (fileContents[i].file.includes(`schema`)) {
        console.log(`Running schema ruleset on ${fileContents[i].file}`);
        schemaSpectral = await createSpectral(inputs.spectralSchemaRuleset);
        pbs = await runSpectral(schemaSpectral, fileContents[i].content, true);
      }

      //console.log(`Current Working Directory: ` + process.cwd());

      processedPbs = processPbs(fileContents[i].file, processedPbs, pbs);
    }

    const md = await toMarkdown(processedPbs, project);

    //console.log(md);

    if (md === "") {
      core.info("No lint error found! Congratulation!");
    } else {
      const octokit = new github.GitHub(inputs.githubToken);
      const repoName = context.repo.repo;
      const repoOwner = context.repo.owner;
      const prNumber = context.payload.pull_request.number;
      await octokit.issues.createComment({
        repo: repoName,
        owner: repoOwner,
        body: md,
        issue_number: prNumber,
      });
      if (processedPbs.severitiesCount[0] > 0) {
        core.setFailed(
          "There are " + processedPbs.severitiesCount[0] + " lint errors!"
        );
      }
    }
  } catch (error) {
    core.setFailed(error.message);
  }
}

run();
