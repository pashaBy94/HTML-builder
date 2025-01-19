const fs = require('fs/promises');
const {
  createWriteStream: createWrStream,
  createReadStream: createRdStream,
} = require('fs');

const path = require('path');

const inPath = path.join(__dirname, 'styles');
const outPath = path.join(__dirname, 'project-dist', 'bundle.css');

copyStyles(inPath, outPath);

async function copyStyles(inpath) {
  const writeStream = createWrStream(outPath);
  try {
    const files = await fs.readdir(inpath, { withFileTypes: true });
    for (const file of files) {
      const pathFile = path.join(file.path, file.name);
      const stat = await fs.stat(pathFile);
      const extention = path.parse(file.name).ext.slice(1);
      if (stat.isFile() && extention === 'css') {
        const readStream = await createRdStream(pathFile, 'utf-8');
        readStream.on('data', async (data) => {
          if (data) {
            await writeStream.write(data + '\n');
          }
        });
      }
    }
  } catch (error) {
    console.log(error);
  }
}
