const fs = require('fs');
const path = require('path');

const pathFolder = path.join(__dirname, 'secret-folder');
fs.readdir(pathFolder, { withFileTypes: true }, (err, data) => {
  if (err) {
    console.log(err);
    return;
  }
  data.forEach((file) => {
    if (file.isFile()) {
      const pathFile = path.join(pathFolder, file.name);
      fs.stat(pathFile, (err, stats) => {
        if (err) {
          console.log(err);
          return;
        }
        console.log(
          `${path.parse(file.name).name} - ${path
            .parse(file.name)
            .ext.slice(1)} - ${(stats.size / 1024).toFixed(3)}kb`,
        );
      });
    }
  });
});
