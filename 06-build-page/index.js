const fs = require('fs/promises');
const {
  createReadStream: createRdStream,
  createWriteStream: createWrStream,
} = require('fs');
const path = require('path');

const pathProject = path.join(__dirname, 'project-dist');
buildProject(pathProject);

async function buildProject(pathOut) {
  try {
    await fs.mkdir(pathOut, { recursive: true });

    const pathComponent = path.join(__dirname, 'components');
    const pathStyles = path.join(__dirname, 'styles');
    const outPathStyles = path.join(__dirname, 'project-dist', 'style.css');
    const pathAssets = path.join(__dirname, 'assets');
    const outPathAssets = path.join(__dirname, 'project-dist', 'assets');
    const indexFilePath = await createIndexHTML();
    await replaceTamplateHTML(pathComponent, indexFilePath);
    await joinStyles(pathStyles, outPathStyles);
    await copyFiles(pathAssets, outPathAssets);
  } catch (error) {
    console.log(error);
  }
}

async function createIndexHTML() {
  try {
    const inPath = path.join(__dirname, 'template.html');
    const outPath = path.join(pathProject, 'index.html');
    await fs.copyFile(inPath, outPath);
    return outPath;
  } catch (error) {
    console.log(error);
  }
}
async function replaceTamplateHTML(inFilesPath, outPath) {
  try {
    const filesHTML = await fs.readdir(inFilesPath, { withFileTypes: true });
    let indexOutHTML = await fs.readFile(outPath, 'utf-8');
    const streamWrite = createWrStream(outPath);

    for (const file of filesHTML) {
      const pathFile = path.join(file.path, file.name);
      const exc = path.parse(file.name).ext;
      const stat = await fs.stat(pathFile);
      if (stat.isFile() && exc === '.html') {
        const dataStream = createRdStream(pathFile, 'utf-8');
        await new Promise((resolve, reject) => {
          dataStream.on('data', (data) => {
            if (data)
              indexOutHTML = indexOutHTML.replaceAll(
                `{{${path.parse(file.name).name}}}`,
                data,
              );
          });
          dataStream.on('end', resolve);
          dataStream.on('error', reject);
        });
      }
    }

    streamWrite.end(indexOutHTML);
  } catch (error) {
    console.log(error);
  }
}

async function joinStyles(inpath, outPath) {
  const writeStream = createWrStream(outPath);
  try {
    const files = await fs.readdir(inpath, { withFileTypes: true });
    for (const file of files) {
      const pathFile = path.join(file.path, file.name);
      const stat = await fs.stat(pathFile);
      const extention = path.parse(file.name).ext.slice(1);
      if (stat.isFile() && extention === 'css') {
        const readStream = createRdStream(pathFile, 'utf-8');
        await new Promise((resolve, reject) => {
          readStream.on('data', async (data) => {
            if (data) {
              writeStream.write(data + '\n');
            }
          });
          readStream.on('end', resolve);
          readStream.on('error', reject);
        });
      }
    }
  } catch (error) {
    console.log(error);
  }
}

async function copyFiles(dirpath, outdir) {
  try {
    await fs.mkdir(outdir, { recursive: true });
    const realFiles = await fs.readdir(dirpath, { withFileTypes: true });
    const copyFiles = await fs.readdir(outdir, { withFileTypes: true });
    //.........................
    for (const out of copyFiles) {
      if (!realFiles.some((el) => el.name === out.name)) {
        await deleteDirectory(out);
      }
    }
    //..............................
    for (const file of realFiles) {
      const currentPath = path.join(dirpath, file.name);
      const outPath = path.join(outdir, file.name);

      const stat = await fs.stat(currentPath);
      if (stat.isFile()) {
        await fs.copyFile(currentPath, outPath);
      }
      if (stat.isDirectory()) {
        await copyDirectory(currentPath, outPath);
      }
    }
  } catch (error) {
    console.log(error);
  }
}

async function copyDirectory(src, dest) {
  await fs.mkdir(dest, { recursive: true });
  const realFiles = await fs.readdir(src, { withFileTypes: true });
  const copyFiles = await fs.readdir(dest, { withFileTypes: true });
  for (const out of copyFiles) {
    if (!realFiles.some((el) => el.name === out.name)) {
      deleteDirectory(out);
    }
  }
  const diir = await fs.readdir(src, { withFileTypes: true });

  for (const fileOne of diir) {
    const currentPath = path.join(src, fileOne.name);
    const outPath = path.join(dest, fileOne.name);

    if (fileOne.isFile()) {
      await fs.copyFile(currentPath, outPath);
    } else if (fileOne.isDirectory()) {
      await copyDirectory(currentPath, outPath);
    }
  }
}
async function deleteDirectory(file) {
  const currentPath = path.join(file.path, file.name);
  const stat = await fs.stat(currentPath);
  if (stat.isFile()) {
    await fs.unlink(currentPath);
  }
  if (stat.isDirectory()) {
    const files = await fs.readdir(currentPath, { withFileTypes: true });
    for (const data of files) {
      await deleteDirectory(data);
    }
    await fs.rmdir(currentPath);
  }
}
