const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'text.txt');

const readStream = fs.createReadStream(filePath, 'utf-8');
let data;
readStream
  .on('data', (chunk) => {
    if (data) data += chunk;
    data = chunk;
  })
  .on('readable', function () {
    if (!this.read()) console.log(data);
  })
  .on('error', function (err) {
    console.log(err);
    this.destroy();
  });
