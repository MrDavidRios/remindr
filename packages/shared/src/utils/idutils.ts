export function generateUniqueID(): number {
  const timestamp = Date.now(); // Current time in milliseconds
  const randomNum = Math.round(Math.random() * 1000); // Random number between 0 (inclusive) and 1000 (exclusive)

  return timestamp - randomNum;
}
