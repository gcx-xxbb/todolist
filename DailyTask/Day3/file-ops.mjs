import fs from 'fs/promises';
import path from 'path';

async function createFilenewFold() {
  const folderPath = path.join('./', 'my-files');
  const filePath = path.join(folderPath, 'note.txt');
  const fileContent = `姓名：xbb,当前时间：${new Date().toLocaleDateString()}`;

  try {
    await fs.mkdir(folderPath, { recursive: true });
    console.log(`文件夹创建成功！${folderPath}`);

    await fs.writeFile(filePath, fileContent);
    console.log(`文件创建成功！${filePath}`);
  } catch (err) {
    console.error(err);
  }
}

async function getFileData() {
  const filePath = path.join('./', 'my-files', 'note.txt');

  try {
    const data = await fs.readFile(filePath, 'utf8');
    const fileInfo = await fs.stat(filePath);
    console.log(data);
    console.log('文件信息', fileInfo);
  } catch (err) {
    console.error(err);
  }
}

createFilenewFold().then(() => getFileData());
