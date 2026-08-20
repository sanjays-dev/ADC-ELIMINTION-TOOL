import fs from 'fs';

function unusedFunction() {
  return 1;
}

const unusedVar = 42;

function usedFunction() {
  return 'ok';
}

console.log(usedFunction());
