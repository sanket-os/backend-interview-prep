const express = require("express");
const app = express();
const path = require("path");
const { Worker } = require("worker_threads");

/*
|--------------------------------------------------------------------------
| Serve static frontend
|--------------------------------------------------------------------------
*/
app.use(express.static("public"));

/*
|--------------------------------------------------------------------------
| runWorker(number)
|--------------------------------------------------------------------------
| Creates a worker thread and returns a Promise.
|
| Why Promise?
| - Worker runs asynchronously
| - Result arrives later
| - async/await keeps code readable
|--------------------------------------------------------------------------
*/
function runWorker(number) {
  return new Promise((resolve, reject) => {

    /*
      Create a new worker thread.
      - Loads fiboFork.js
      - Passes number via workerData
    */
    const worker = new Worker(
      path.join(__dirname, "fiboFork.js"),
      {
        workerData: { number },
      }
    );

    console.log(
      `Forked new worker thread with threadId: ${worker.threadId}`
    );

    // Receive result from worker
    worker.on("message", resolve);

    // Handle worker-level errors
    worker.on("error", reject);

    // If worker exits unexpectedly
    worker.on("exit", (code) => {
      if (code !== 0) {
        reject(
          new Error(`Worker stopped with exit code ${code}`)
        );
      }
    });
  });
}

/*
|--------------------------------------------------------------------------
| /fib Route Handler
|--------------------------------------------------------------------------
| - Does NOT compute Fibonacci
| - Delegates to worker thread
| - Event loop stays responsive
|--------------------------------------------------------------------------
*/
app.get("/fib", async (req, res) => {
  const { number, requestNumber } = req.query;

  console.log("handler fn ran for req ", requestNumber);

  // Input validation
  if (!number || isNaN(number) || number <= 0) {
    return res
      .status(400)
      .json({ error: "Please provide a valid positive number." });
  }

  try {
    /*
      Await worker result.
      While waiting:
      - Event loop can handle other requests
      - No blocking
    */
    const result = await runWorker(Number(number));

    console.log("Sending response for req", requestNumber);

    res.status(200).json({
      status: "success",
      message: result,
      requestNumber,
    });
  } catch (error) {
    res.status(500).json({
      error: "Error Calculating Fibonacci",
    });
  }
});

/*
|--------------------------------------------------------------------------
| Start Server
|--------------------------------------------------------------------------
| Single process
| Multiple threads
| Event loop stays happy
|--------------------------------------------------------------------------
*/
app.listen(3000, () => {
  console.log("server is running on port 3000");
});
