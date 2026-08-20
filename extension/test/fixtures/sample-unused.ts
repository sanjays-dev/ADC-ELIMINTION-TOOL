import path from 'path';

function helper(): number {
  return 10;
}

const maybeUnused: string = 'x';

export function run(): number {
  return helper();
}

run();
