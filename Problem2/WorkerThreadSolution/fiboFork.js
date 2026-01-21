/*
|--------------------------------------------------------------------------
| fiboFork.js (Worker Thread)
|--------------------------------------------------------------------------
| This file runs INSIDE a worker thread.
|
| - Same process as main server
| - Different thread
| - Separate call stack
| - Can use another CPU core
|
| Main event loop remains FREE.
|--------------------------------------------------------------------------
*/

const { parentPort, workerData } = require("worker_threads");

/*
  CPU-intensive Fibonacci function.
  Still recursive.
  Still slow.
  But now isolated from the event loop.
*/
function calculateFibonacci(number) {
  if (number <= 1) {
    return number;
  }
  return (
    calculateFibonacci(number - 1) +
    calculateFibonacci(number - 2)
  );
}

/*
|--------------------------------------------------------------------------
| Worker Execution Starts Here
|--------------------------------------------------------------------------
| workerData is passed at creation time.
| No messaging needed to start work.
|--------------------------------------------------------------------------
*/
const result = calculateFibonacci(workerData.number);

/*
  Send result back to main thread.
  This does NOT block the event loop.
*/
parentPort.postMessage(result);
