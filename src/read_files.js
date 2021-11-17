const fs = require('fs');

const readFilesToAnalyze = async (githubWorkspace, fileGlob) => {
  let files = fileGlob.split(",");
  let fileContents = [];
  for (let i = 0, len = files.length; i < len; i++) {
    console.log(`FILE ${j} ${files[j]}`);
    fileContents.push({
      file: files[i],
      content: fs.readFileSync(files[i], 'utf-8')
    });
  }

  return fileContents;
};

module.exports = readFilesToAnalyze;

