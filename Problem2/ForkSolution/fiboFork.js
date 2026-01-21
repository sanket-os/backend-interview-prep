/*
|--------------------------------------------------------------------------
| fiboFork.js
|--------------------------------------------------------------------------
| This file runs in a COMPLETELY SEPARATE PROCESS.
|
| - Separate memory
| - Separate event loop
| - Separate CPU core (if available)
|
| The main server remains responsive while this works.
|--------------------------------------------------------------------------
*/

/*
  Recursive Fibonacci.
  Still slow.
  Still CPU-heavy.
  But now it's NOT blocking the main server.
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
| IPC: Inter-Process Communication
|--------------------------------------------------------------------------
| Parent process sends a message → we receive it here.
|--------------------------------------------------------------------------
*/
process.on("message", (message) => {
  const { number } = message;

  // Perform the heavy computation
  const result = calculateFibonacci(number);

  // Send result back to parent process
  process.send(result);
});
