import { open, fstat, close, read, write, unlink, mkdir, rename } from 'fs';
import { promisify } from 'util';

export async function ensureDataDirectory() {
  try {
    await promisify(mkdir)('data');
  } catch {
    // Ignore
  }
}

export async function readFileContents(filePath: string) {
  let fileDescriptor = -1;
  try {
    fileDescriptor = await promisify(open)(filePath, 'r');
    const stats = await promisify(fstat)(fileDescriptor);

    const bufferSize = stats.size;
    const buffer = Buffer.alloc(bufferSize);
    let bytesRead = 0;
    let chunkSize = 512;

    while (bytesRead < bufferSize) {
      if (bytesRead + chunkSize > bufferSize) {
        chunkSize = bufferSize - bytesRead;
      }
      await promisify(read)(
        fileDescriptor,
        buffer,
        bytesRead,
        chunkSize,
        bytesRead,
      );
      bytesRead += chunkSize;
    }
    const data = buffer.toString('utf8', 0, bufferSize);
    return data;
  } catch (err) {
    console.dir(err);
    throw err;
  } finally {
    if (fileDescriptor !== -1) {
      await promisify(close)(fileDescriptor);
    }
  }
}

export async function writeFileContents(
  filePath: string,
  data: string,
  overwrite = false,
) {
  let fileDescriptor = -1;
  try {
    fileDescriptor = await promisify(open)(filePath, overwrite ? 'w' : 'wx');
    await promisify(write)(fileDescriptor, data);
  } catch (err) {
    console.dir(err);
    throw err;
  } finally {
    if (fileDescriptor !== -1) {
      await promisify(close)(fileDescriptor);
    }
  }
}

export async function removeFile(filePath: string) {
  try {
    await promisify(unlink)(filePath);
  } catch (err) {
    console.dir(err);
    throw err;
  }
}

export async function renameFile(filePath: string, newFilePath: string) {
  try {
    await promisify(rename)(filePath, newFilePath);
  } catch (err) {
    console.dir(err);
    throw err;
  }
}
