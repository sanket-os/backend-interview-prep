const { exec, execFile, spawn } = require("child_process");

/*
|--------------------------------------------------------------------------
| 1. exec — Windows-friendly command
|--------------------------------------------------------------------------
| exec runs inside a shell.
| If the command fails, err will NOT be null.
|--------------------------------------------------------------------------
*/
exec("ls -lh", { shell: "bash" }, (err, stdout, stderr) => {
  if (err) {
    console.error("❌ exec error:");
    console.error(err.message);
    return;
  }

  if (stderr) {
    console.error("⚠️ exec stderr:");
    console.error(stderr);
  }

  console.log("📂 exec stdout:");
  console.log(stdout);
});

/*
|--------------------------------------------------------------------------
| 2. execFile — Bash script via Git Bash
|--------------------------------------------------------------------------
| No shell involved.
| We explicitly call 'bash' like responsible adults.
|--------------------------------------------------------------------------
*/
execFile("bash", ["script.sh", "Hinata", "Sakura"], (err, stdout, stderr) => {
  if (err) {
    console.error("❌ execFile error:");
    console.error(err.message);
  }

  if (stderr) {
    console.error("⚠️ script stderr:");
    console.error(stderr);
  }

  console.log("📜 script stdout:");
  console.log(stdout);
});

/*
|--------------------------------------------------------------------------
| 3. spawn — Open Chrome
|--------------------------------------------------------------------------
| spawn streams output and does NOT buffer.
| Chrome won't say much, but failures matter.
|--------------------------------------------------------------------------
*/
const chrome = spawn(
  "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
  ["https://www.youtube.com", "--incognito"]
);

// stdout (Chrome usually stays quiet, but we listen anyway)
chrome.stdout.on("data", (data) => {
  console.log("🟢 chrome stdout:");
  console.log(data.toString());
});

// stderr (this is where Chrome complains)
chrome.stderr.on("data", (data) => {
  console.error("🔴 chrome stderr:");
  console.error(data.toString());
});

// process exit
chrome.on("close", (code) => {
  if (code === 0) {
    console.log("🚀 Chrome launched successfully.");
  } else {
    console.error(`💀 Chrome exited with code ${code}.`);
  }
});

// spawn-level failure (file not found, permission denied, etc.)
chrome.on("error", (err) => {
  console.error("🔥 Failed to start Chrome:");
  console.error(err.message);
});
