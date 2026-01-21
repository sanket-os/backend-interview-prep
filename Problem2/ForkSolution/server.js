const { fork } = require("child_process");
const express = require("express");
const app = express();
const path = require("path");

/*
|--------------------------------------------------------------------------
| Serve static frontend
|--------------------------------------------------------------------------
*/
app.use(express.static("public"));

/*
|--------------------------------------------------------------------------
| /fib Route Handler
|--------------------------------------------------------------------------
| This time:
| - The server does NOT compute Fibonacci
| - It delegates the work to a child process
|--------------------------------------------------------------------------
*/
app.get("/fib", (req, res) => {
  const { number, requestNumber } = req.query;

  console.log("handler fn ran for req ", requestNumber);

  // Input validation (same as before)
  if (!number || isNaN(number) || number <= 0) {
    return res
      .status(400)
      .json({ error: "Please provide a valid positive number." });
  }

  /*
    fork()
    ------
    - Creates a brand new Node.js process
    - Loads fiboFork.js inside it
    - Sets up a communication channel (IPC)
  */
  const fiboResponse = fork(
    path.join(__dirname, "fiboFork.js")
  );

  console.log(
    "Forked new process for req:",
    requestNumber,
    "with PID:",
    fiboResponse.pid
  );

  // Send data to child process
  fiboResponse.send({ number });

  /*
    Listen for message from child process.
    This callback runs when Fibonacci finishes.
  */
  fiboResponse.on("message", (answer) => {
    console.log("sending response for req ", requestNumber);

    // Respond to client
    res.status(200).json({
      status: "success",
      message: answer,
      requestNumber,
    });

    // Kill child process to free resources
    fiboResponse.kill();
  });
});

/*
|--------------------------------------------------------------------------
| Start Server
|--------------------------------------------------------------------------
| Main event loop stays responsive.
| Child processes do the heavy lifting.
|--------------------------------------------------------------------------
*/
app.listen(3000, () => {
  console.log("server is running on port 3000");
});
