const express = require("express");
const path = require("path");
const { Worker } = require("worker_threads");

const app = express();
app.use(express.static("public"));

/*
|--------------------------------------------------------------------------
| Worker Pool Configuration
|--------------------------------------------------------------------------
| NEVER create unlimited workers.
| Use a fixed pool based on CPU cores.
|--------------------------------------------------------------------------
*/
const MAX_WORKERS = 4; // usually = CPU cores
const workerQueue = [];
let activeWorkers = 0;

/*
|--------------------------------------------------------------------------
| runWorkerTask(number)
|--------------------------------------------------------------------------
| - Queues requests
| - Executes them when a worker is free
| - Prevents CPU overload
|--------------------------------------------------------------------------
*/
function runWorkerTask(number) {
  return new Promise((resolve, reject) => {
    workerQueue.push({ number, resolve, reject });
    processQueue();
  });
}

/*
|--------------------------------------------------------------------------
| processQueue()
|--------------------------------------------------------------------------
| - Starts workers if slots are available
|--------------------------------------------------------------------------
*/
function processQueue() {
  if (activeWorkers >= MAX_WORKERS) return;
  if (workerQueue.length === 0) return;

  const { number, resolve, reject } = workerQueue.shift();
  activeWorkers++;

  const worker = new Worker(
    path.join(__dirname, "fiboWorker.js"),
    { workerData: { number } }
  );

  console.log(
    `🧵 Spawned worker ${worker.threadId} | Active workers: ${activeWorkers}`
  );

  worker.on("message", (result) => {
    resolve(result);
  });

  worker.on("error", (err) => {
    reject(err);
  });

  worker.on("exit", (code) => {
    activeWorkers--;

    console.log(
      `🧹 Worker exited | Active workers now: ${activeWorkers}`
    );

    if (code !== 0) {
      reject(new Error(`Worker exited with code ${code}`));
    }

    // Start next queued task
    processQueue();
  });
}

/*
|--------------------------------------------------------------------------
| /fib Route
|--------------------------------------------------------------------------
| - Does NOT compute Fibonacci
| - Delegates to worker pool
| - Event loop stays responsive
|--------------------------------------------------------------------------
*/
app.get("/fib", async (req, res) => {
  const { number, requestNumber } = req.query;

  console.log(`➡️ Request ${requestNumber} received`);

  if (!number || isNaN(number) || number <= 0) {
    return res.status(400).json({
      error: "Please provide a valid positive number",
    });
  }

  try {
    const result = await runWorkerTask(Number(number));

    console.log(`🚀 Responding to request ${requestNumber}`);

    res.json({
      status: "success",
      message: result,
      requestNumber,
    });
  } catch (err) {
    console.error(
      `💥 Error for request ${requestNumber}:`,
      err.message
    );
    res.status(500).json({
      error: "Error calculating Fibonacci",
    });
  }
});

/*
|--------------------------------------------------------------------------
| Start Server
|--------------------------------------------------------------------------
*/
app.listen(3000, () => {
  console.log("🟢 Server running on port 3000");
});



// FINAL ARCHITECTURE (Mental Picture)
// Browser
//    |
//    | many requests
//    v
// Express Server (Event Loop stays free)
//    |
//    | queue task
//    v
// Worker Pool (4 threads)
//    |
//    | Fibonacci computation
//    v
// Result → Response