const fs = require('fs');
const path = require('path');

fs.writeFile('output.txt', 'Hello World!', function (err) {
  if (err) throw err;
  console.log('数据已写入文件');
});

fs.readFile('nodejs初印象.md', 'utf-8', (err, data) => {
  if (err) throw err;
  console.log(data);
});

fs.readdir('./', function (err, files) {
  if (err) throw err;
  console.log(files);
});

console.log('nodejs版本：', process.version);
console.log('nodejs平台：', process.platform);
console.log('架构：', process.arch);
console.log('Hello, Node.js!');
