const fs = require('fs');
const path = require('path');
const readline = require('readline');

const consoleCustom = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});
const outPath = path.join(__dirname, 'output.txt');

const writableStream = fs.createWriteStream(outPath);

function loog() {
  consoleCustom.question(
    'Enter something to write to the file:\n',
    (answer) => {
      if (answer.toLowerCase() === 'exit') {
        consoleCustom.close();
        writableStream.end();
        return;
      }
      writableStream.write(answer + '\n');
      loog();
    },
  );
}
console.log('Hello me frends!');
loog();
consoleCustom.on('close', () => {
  console.log('Now you need to open output file and look your noties');
  consoleCustom.close();
  writableStream.end();
});
