// ==========================================================
// STEP 0: SUMMON THE CORE NODE.JS POWERS
// ==========================================================

// fs → File System module
// Lets Node.js read/write files like a responsible adult
// (or irresponsibly, depending on how you use it)
const fs = require("fs");

// path → Path utilities
// Prevents Windows, Linux, and Mac from fighting over slashes (/ vs \)
// Peace treaties are important
const path = require("path");


// ==========================================================
// STEP 1: CREATE A MONSTROUS AMOUNT OF DATA
// ==========================================================

// Math.random() → creates chaos
// .toString(36) → turns chaos into letters + numbers
// repeat(10,000,000) → turns chaos into a disaster movie
// Purpose: simulate a BIG file without actually downloading one
const content = Math.random().toString(36).repeat(10000000);


// ==========================================================
// STEP 2: CREATE DIRECTORY & BIG FILE (ONE-TIME RITUAL)
// ==========================================================

// Join current directory with "files"
// __dirname → absolute path of this file (Node knows where it lives)
// path.join → avoids OS tantrums
// const dirPath = path.join(__dirname, "files");

// Check if the directory already exists
// existsSync → BLOCKING (yes, evil)
// Allowed here because this runs ONCE, not per request
// if (!fs.existsSync(dirPath)) {
//   fs.mkdirSync(dirPath, { recursive: true });
// }

// Build the full file path: files/bigFile.txt
// const filePath = path.join(dirPath, "bigFile.txt");

// Write the giant content into the file
// writeFileSync → blocks everything
// But it's fine here — we're not running a server yet
// fs.writeFileSync(filePath, content);


// ==========================================================
// VERSION 1 ❌ — "LET ME LOAD THE ENTIRE FILE INTO RAM"
// a.k.a. How to anger the Event Loop
// ==========================================================

// const http = require("http");
// const server = http.createServer();

// server.on("request", (req, res) => {
//   console.log("before");

//   // fs.readFile reads the WHOLE file at once
//   // Large file → large memory usage → Node starts sweating
//   fs.readFile("./files/bigFile.txt", (err, data) => {
//     if (err) throw err;

//     // Only AFTER reading everything, we respond
//     // Client waits patiently… or rage-quits
//     res.end(data);
//     console.log("file reading completed");
//   });

//   // This logs immediately because readFile is async
//   // Node says: "I’ll deal with the file later"
//   console.log("after");
// });

// server.listen(3000, () => {
//   console.log("server is started at 3000");
// });


// ==========================================================
// VERSION 2 ✅ — STREAMS: EAT THE ELEPHANT ONE BITE AT A TIME
// ==========================================================

// Streams process data in chunks
// Memory stays calm
// CPU stays sane
// Everyone survives

// const dirPath = path.join(__dirname, "files");
// const filePath = path.join(dirPath, "bigFile.txt");

// Readable stream → file → memory (chunk by chunk)
// const readableStream = fs.createReadStream(filePath);

// Writable streams → memory → disk
// const writableStream = fs.createWriteStream("copyBigFile.txt");
// const anotherWritableStream = fs.createWriteStream("copyBigFile-1.txt");

// pipe() = Node.js magic spell ✨
// Automatically handles:
// - reading
// - writing
// - backpressure (yes, Node can say "slow down")
// readableStream.pipe(anotherWritableStream);

// If reading fails, scream responsibly
// readableStream.on("error", (err) => {
//   console.log("error while reading :", err);
// });

// If writing fails, scream differently
// writableStream.on("error", (err) => {
//   console.log("error while writing :", err);
// });

// Manual chunk handling (for educational masochism)
// readableStream.on("data", (chunk) => {
//   console.log(`Received ${chunk.length} bytes of data`);

//   // Write each chunk manually
//   // This works, but pipe() does this better and judges you silently
//   writableStream.write(chunk);
// });

// When the file ends, close the stream like a civilized program
// readableStream.on("end", () => {
//   writableStream.end();
//   console.log("Finished reading file");
// });


// ==========================================================
// FINAL VERSION 👑 — HTTP STREAMING (PRODUCTION APPROVED)
// ==========================================================

const http = require("http");

// Create an HTTP server
// Simple, clean, no nonsense
const server = http.createServer();

// Every time a request arrives…
server.on("request", (req, res) => {

  // Create a readable stream for the big file
  // File is NOT fully loaded into memory
  // RAM breathes a sigh of relief
  const src = fs.createReadStream("./files/bigFile.txt");

  // Pipe file data directly to HTTP response
  // Chunk-by-chunk delivery
  // Fast, efficient, elegant
  src.pipe(res);
});

// Start the server
// Node is now officially open for business
server.listen(3000, () => {
  console.log("server is started at 3000");
});
