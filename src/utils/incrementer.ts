export default function incrementer(input: unknown): string {
  // Convert input to string
  const str = String(input);

  // Extract the first number found in the string
  const match = str.match(/\d+/);
  const number = match ? match[0] : '0';

  const numberLength = number.length;

  // Increment the number
  let incremented = (parseInt(number, 10) + 1).toString();

  // Pad with leading zeros if needed
  while (incremented.length < numberLength) {
    incremented = '0' + incremented;
  }

  return str.replace(number, incremented);
}
