#!/usr/bin/env node

import { readFileSync, writeFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const DATES_PATH = resolve(__dirname, "../data/dates.json");

function main() {
  const [year, ...mmddList] = process.argv.slice(2);

  if (!year || mmddList.length === 0) {
    console.error("Usage: node scripts/add-date.mjs <year> <MMDD> [MMDD ...]");
    console.error("Example: node scripts/add-date.mjs 2025 0405 0406");
    process.exit(1);
  }

  if (!/^\d{4}$/.test(year)) {
    console.error(`Invalid year: ${year}`);
    process.exit(1);
  }

  for (const mmdd of mmddList) {
    if (!/^\d{4}$/.test(mmdd)) {
      console.error(`Invalid date format: ${mmdd} (expected MMDD, e.g. 0819)`);
      process.exit(1);
    }
    const month = parseInt(mmdd.slice(0, 2), 10);
    const day = parseInt(mmdd.slice(2, 4), 10);
    if (month < 1 || month > 12 || day < 1 || day > 31) {
      console.error(`Invalid date: ${mmdd}`);
      process.exit(1);
    }
  }

  const data = JSON.parse(readFileSync(DATES_PATH, "utf-8"));

  if (!data[year]) {
    data[year] = [];
  }

  let added = 0;
  for (const mmdd of mmddList) {
    if (data[year].includes(mmdd)) {
      console.log(`${year}/${mmdd} is already registered, skipping`);
    } else {
      data[year].push(mmdd);
      added++;
    }
  }

  data[year].sort();

  const sortedData = Object.fromEntries(
    Object.entries(data).sort(([a], [b]) => Number(a) - Number(b)),
  );

  writeFileSync(DATES_PATH, JSON.stringify(sortedData, null, 2) + "\n");

  console.log(
    `Done! Added ${added} date(s) to ${year}. Total: ${data[year].length} games in ${year}.`,
  );
}

main();
