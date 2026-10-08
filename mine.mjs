import * as readline from 'node:readline/promises';
import { stdin as input, stdout as output } from 'node:process';
const rl = readline.createInterface({ input, output });

let Getal = parsefloat(await userInput.question("Welk getal geef je in? "));
if (Getal %2 === 1) {
    console.log("Dit getal is even ");
}
else{
    console.log("Dit is geen oneven getal ");
}
process.exit();