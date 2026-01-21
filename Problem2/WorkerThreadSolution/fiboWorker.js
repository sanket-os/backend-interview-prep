const { parentPort, workerData, threadId } = require("worker_threads");

/*
|--------------------------------------------------------------------------
| Worker Thread
|--------------------------------------------------------------------------
| - Runs on a separate thread
| - Has its own call stack
| - Can use another CPU core
|--------------------------------------------------------------------------
*/

// Memoization cache (per worker)
const memo = {};

/*
|--------------------------------------------------------------------------
| Optimized Fibonacci (O(n))
|--------------------------------------------------------------------------
| Without memoization:
|   O(2^n) → CPU meltdown
| With memoization:
|   O(n) → civilized behavior
|--------------------------------------------------------------------------
*/
function calculateFibonacci(n) {
  if (n <= 1) return n;

  if (memo[n]) return memo[n];

  memo[n] =
    calculateFibonacci(n - 1) +
    calculateFibonacci(n - 2);

  return memo[n];
}

// Start timing
const start = Date.now();

console.log(
  `🧵 [Worker ${threadId}] Started Fibonacci(${workerData.number})`
);

// Do the CPU-heavy work
const result = calculateFibonacci(workerData.number);

// End timing
const end = Date.now();

console.log(
  `✅ [Worker ${threadId}] Finished Fibonacci(${workerData.number}) in ${
    end - start
  } ms`
);

// Send result back to main thread
parentPort.postMessage(result);
