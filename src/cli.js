#!/usr/bin/env node
import { readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { solve } from './engine.js';
import { verifyCertificate } from './certificate.js';

async function json(path) {
  return JSON.parse(await readFile(resolve(path), 'utf8'));
}

function usage() {
  console.error(`TESSERA — proof-carrying CTL model checker

Usage:
  node src/cli.js demo
  node src/cli.js check <model.json> <formula.json> [certificate-out.json]
  node src/cli.js verify <model.json> <formula.json> <certificate.json>

Formula input is a JSON CTL AST. See examples/ for complete models.`);
}

async function main() {
  const [, , command, ...args] = process.argv;
  if (command === 'demo') {
    const model = await json('examples/escrow-protocol.json');
    const properties = await json('examples/properties.json');
    let failures = 0;
    for (const property of properties) {
      const solved = solve(model, property.formula);
      const checked = verifyCertificate(model, property.formula, solved.certificate);
      const matches = checked.holdsAtAllInitial === property.expectedAtInitial;
      if (!matches) failures += 1;
      const status = matches ? 'PASS' : 'FAIL';
      console.log(`${status}  ${property.name.padEnd(38)} initial=${checked.holdsAtAllInitial ? 'holds' : 'violated'}  cert=verified`);
      if (!matches) console.error(`      Expected ${property.expectedAtInitial}, got ${checked.holdsAtAllInitial}`);
    }
    console.log(`\n${properties.length - failures}/${properties.length} expected outcomes; every emitted certificate verified independently.`);
    if (failures) process.exitCode = 1;
    return;
  }

  if (command === 'check') {
    if (args.length < 2 || args.length > 3) return usage();
    const [modelPath, formulaPath, certificatePath] = args;
    const model = await json(modelPath);
    const formula = await json(formulaPath);
    const solved = solve(model, formula);
    const verified = verifyCertificate(model, formula, solved.certificate);
    if (certificatePath) await writeFile(resolve(certificatePath), `${JSON.stringify(solved.certificate, null, 2)}\n`);
    console.log(JSON.stringify({ result: solved.result, certificateVerified: verified.verified, certificatePath: certificatePath ?? null }, null, 2));
    return;
  }

  if (command === 'verify') {
    if (args.length !== 3) return usage();
    const [modelPath, formulaPath, certificatePath] = args;
    const [model, formula, certificate] = await Promise.all([json(modelPath), json(formulaPath), json(certificatePath)]);
    console.log(JSON.stringify(verifyCertificate(model, formula, certificate), null, 2));
    return;
  }
  usage();
  process.exitCode = 2;
}

main().catch(error => {
  console.error(error.message);
  process.exitCode = 1;
});
