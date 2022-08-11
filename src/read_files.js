const fs = require('fs');

const readFilesToAnalyze = async (githubWorkspace, fileGlob) => {
  let files = fileGlob.split(",");
  let fileContents = [];
  for (let i = 0, len = files.length; i < len; i++) {
    console.log(`FILE ${i} ${files[i]}`);
    try {
      if (fs.existsSync(files[i])) {
        //file exists
        console.log("File Exists, adding it to be linted")
        fileContents.push({
          file: files[i],
          content: fs.readFileSync(files[i], 'utf-8')
        });
      } else {
        console.log("File does not exist, if the file was intentially deleted during the PR ignore this comment")
      }
    } catch(err) {
      console.error(err)
    }
  }

  return fileContents;
};

module.exports = readFilesToAnalyze;

