import * as readline from "node:readline/promises";
import {getPart} from "./bom-utils.js";

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

let docLink = await rl.question('Onshape document (assembly tab) link:');

let partName = await rl.question('Part name:');

let part = await getPart(docLink, partName);
console.log(part.name + ":");
console.log(`mass: ${part.mass}`);
console.log(`revision: ${part.revision}`);
console.log(`description: ${part.description}`);
console.log(`material: ${part.material.id}`)
