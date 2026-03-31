import fs from 'fs';

const mkFile = fileName => {
  fs.writeFile(fileName, 'hello world', err => {
    if (err) throw err;
    console.log('文件创建成功');
  });
};

const deleteFile = fileName => {
  fs.unlink(fileName, err => {
    if (err) throw err;
    console.log('文件删除成功');
  });
};

const getFileInfo = fileName => {
  fs.stat(fileName, (err, stats) => {
    if (err) throw err;
    console.log(stats);
  });
};

export { mkFile, deleteFile, getFileInfo };
