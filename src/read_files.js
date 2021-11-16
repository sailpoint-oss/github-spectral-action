const fs = require('fs');
const fg = require('fast-glob');

const readFilesToAnalyze = async (githubWorkspace, fileGlob) => {
  for (let i = 0, len = fileGlob.length; i < len; i++) {
    console.log(`File ${i}:  ${fileGlob[i]}`)
  } 


  console.dir("FileGlob: " + fileGlob);
  const entries = await fg(fileGlob);

  let fileContents = [];
  for (let i = 0, len = entries.length; i < len; i++) {
    fileContents.push({
      file: entries[i],
      content: fs.readFileSync(entries[i], 'utf-8')
    });
  }
  return fileContents;
};

module.exports = readFilesToAnalyze;

