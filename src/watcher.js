// https://nodejs.org/docs/latest/api/fs.html#fs_fs_watch_filename_options_listener
// manage always running with pm2 https://velog.io/@cckn/2019-11-05-0611-%EC%9E%91%EC%84%B1%EB%90%A8-17k2kwsgms

const fs = require("fs");
const path = require("path");
const { exec } = require("child_process");

require("dotenv").config();

const WATCH_DIR = process.env?.WATCH_DIR || ".";
const WATCH_FILE_EXTENSIONS = process.env?.WATCH_FILE_EXTENSIONS || "txt";
const SCP_TARGET_PATH = process.env?.SCP_TARGET_PATH || "localhost";
const lastFileMtime = {};

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
    exec(command, (error, stdout, stderr) => {
      if (error) {
        console.log(`${filePath} upload error: ${error.message}`);
        return;
      }
      if (stderr) {
        console.log(`${filePath} upload stderr: ${stderr}`);
        return;
      }
      console.log(`${filePath} upload stdout: ${stdout}`);
    });
  });
});

const extensionsWithDot = "." + WATCH_FILE_EXTENSIONS.replace(".", "");
const isFileWithExtension = (full) => {
  if (full.length < extensionsWithDot.length) return false;
  if (extensionsWithDot === ".") return true;
  const cut = full.substr(
    full.length - extensionsWithDot.length,
    extensionsWithDot.length
  );

  return cut === extensionsWithDot;
};
