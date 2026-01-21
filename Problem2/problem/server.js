const express = require("express");
const app = express();

/*
|--------------------------------------------------------------------------
| Static File Middleware
|--------------------------------------------------------------------------
| This serves index.html from the "public" folder.
| This part is fast, non-blocking, and completely innocent.
|--------------------------------------------------------------------------
*/
app.use(express.static("public"));

/*
|--------------------------------------------------------------------------
| calculateFibonacci(number)
|--------------------------------------------------------------------------
| This is a classic recursive Fibonacci implementation.
|
| Why is this dangerous in Node.js?
| - It is CPU-intensive
| - It is synchronous
| - It blocks the event loop
| - It recalculates the same values repeatedly
|
| Time complexity: O(2^n)
| Educational value: VERY HIGH
|--------------------------------------------------------------------------
*/
function calculateFibonacci(number) {
  // Base case:
  // If number is 0 or 1, return it immediately
  if (number <= 1) {
    return number;
  }

  // Recursive calls
  // This line explodes into millions of calls for fib(40)
  return (
    calculateFibonacci(number - 1) +
    calculateFibonacci(number - 2)
  );
}

/*
|--------------------------------------------------------------------------
| /fib Route Handler
|--------------------------------------------------------------------------
| Every HTTP request to /fib lands here.
| Node.js handles requests ONE AT A TIME per event loop.
|--------------------------------------------------------------------------
*/
app.get("/fib", (req, res) => {

  // Extract query parameters from URL
  const { number, requestNumber } = req.query;

  // Log when handler is entered
  // Under heavy CPU load, these logs will appear late
  console.log("handler fn ran for req ", requestNumber);

  // Basic validation
  // Not the problem, but good hygiene
  if (!number || isNaN(number) || number <= 0) {
    return res.status(400).json({
      error: "Please provide a valid positive number."
    });
  }

  /*
    🚨 CRITICAL SECTION 🚨

    This function call blocks the event loop.
    While this is running:
    - No other requests are processed
    - No timers run
    - No callbacks execute
    - Everything waits
  */
  const answer = calculateFibonacci(number);

  // Response is sent ONLY after computation completes
  res.status(200).json({
    status: "success",
    message: answer,
    requestNumber,
  });
});

/*
|--------------------------------------------------------------------------
| Start Server
|--------------------------------------------------------------------------
| Single Node.js process
| Single JavaScript thread
| One event loop
|--------------------------------------------------------------------------
*/
app.listen(3000, () => {
  console.log("server is running on port 3000");
});
