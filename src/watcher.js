// https://nodejs.org/docs/latest/api/fs.html#fs_fs_watch_filename_options_listener
// manage always running with pm2 https://velog.io/@cckn/2019-11-05-0611-%EC%9E%91%EC%84%B1%EB%90%A8-17k2kwsgms

const fs = require("fs");
const path = require("path");
const { exec } = require("child_process");

require("dotenv").config();

const WATCH_DIR = process.env?.WATCH_DIR || ".";
const WATCH_FILE_EXTENSIONS = process.env?.WATCH_FILE_EXTENSIONS || "txt";
const TRANSFERRED_FILE_EXTENSIONS = process.env?.TRANSFERRED_FILE_EXTENSIONS || "";
const SCP_TARGET_PATH = process.env?.SCP_TARGET_PATH || "localhost";
const lastFileMtime = {};

const watchExtensionsWithDot = "." + WATCH_FILE_EXTENSIONS.replace(".", "");
const transferredExtensionsWithDot = "." + TRANSFERRED_FILE_EXTENSIONS.replace(".", "");

if (WATCH_FILE_EXTENSIONS === TRANSFERRED_FILE_EXTENSIONS) {
  console.error(`TRANSFERRED_FILE_EXTENSIONS is MUST BE different with WATCH_FILE_EXTENSIONS`);
  console.error(`TRANSFERRED_FILE_EXTENSIONS[${TRANSFERRED_FILE_EXTENSIONS}], WATCH_FILE_EXTENSIONS[${WATCH_FILE_EXTENSIONS}]`);
  return 3;
}

fs.watch(WATCH_DIR, (event, file) => {
  if (event !== "rename" || !isFileWithExtension(file)) {
    return;
  }
  const filePath = path.join(WATCH_DIR, file);
  fs.stat(filePath, (err, stats) => {
    if (err != null || stats.isDirectory() || stats.size === 0) {
      return;
    }

    const last_mtime = lastFileMtime[filePath] || new Date("2000");
    if (last_mtime.getTime() === stats.mtime.getTime()) {
      return;
    }

    lastFileMtime[filePath] = stats.mtime;

    const command = `scp '${filePath}' '${SCP_TARGET_PATH}'`;
    console.log(`execute with ${command}`);
    const uploadProcess = exec(command, (error, stdout, stderr) => {
      if (error) {
        console.error(`${filePath} upload error: ${error.message}`);
        return;
      }
      if (stderr) {
        console.error(`${filePath} upload stderr: ${stderr}`);
        return;
      }
      console.log(`${filePath} upload stdout: ${stdout}`);
    });
    uploadProcess.on('exit', (code, signal) => {
      if (code !== 0) {
        console.error(`scp upload is exit with code[${code}], signal[${signal}]`);
        return;
      }
      if (transferredExtensionsWithDot === ".") {
        return;
      }
      const newFilePath = filePath + transferredExtensionsWithDot;
      fs.renameSync(filePath, newFilePath);
      console.log(`file rename from '${filePath}' to '${newFilePath}'`)
    });

  });
});


const isFileWithExtension = (full) => {
  if (full.length < watchExtensionsWithDot.length) return false;
  if (watchExtensionsWithDot === ".") return true;
  const cut = full.substr(
    full.length - watchExtensionsWithDot.length,
    watchExtensionsWithDot.length
  );

  return cut === watchExtensionsWithDot;
};
