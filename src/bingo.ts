export function getRandomBoardUrl() {
  return `/${String(Math.random()).slice(2, 10)}`;
}
