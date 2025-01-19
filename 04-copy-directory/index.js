const fs = require('fs/promises');
const path = require('path');
const outDir = path.join(__dirname, 'files-copy');
const dirPath = path.join(__dirname, 'files');

copyFiles(dirPath, outDir);

async function copyFiles(dirpath, outdir) {
  try {
    await fs.mkdir(outDir, { recursive: true });
    const realFiles = await fs.readdir(dirpath, { withFileTypes: true });
    const copyFiles = await fs.readdir(outdir, { withFileTypes: true });
    //.........................
    for (const out of copyFiles) {
      if (!realFiles.some((el) => el.name === out.name)) {
        deleteDirectory(out);
      }
    }
    //..............................
    for (const file of realFiles) {
      const currentPath = path.join(dirPath, file.name);
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
