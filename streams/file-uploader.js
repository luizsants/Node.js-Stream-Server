import { parse } from "csv-parse";
import fs from "node:fs";

const csvPath = new URL("./tasks.csv", import.meta.url);

const stream = fs.createReadStream(csvPath);

const csvParse = parse({
  delimiter: ",",
  skip_empty_lines: true,
  from_line: 2,
});

const BATCH_SIZE = 5;

async function sendBatch(batch) {
  try {
    await fetch("http://localhost:3333/tasks", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(batch),
    });
  } catch (error) {
    console.error("Error sending batch:", error);
  }
}

async function run() {
  const linesParse = stream.pipe(csvParse);
  let batch = [];
  let batchNumber = 0;

  for await (const line of linesParse) {
    const [title, description] = line;

    const task = {
      title,
      description,
    };

    batch.push(task);

    if (batch.length === BATCH_SIZE) {
      await sendBatch(batch);
      batch = [];
      batchNumber += 1;
      process.stdout.write(`Batch ${batchNumber} sent successfully...\r`);
    }
    
  }

  if (batch.length > 0) {
    await sendBatch(batch);
    batchNumber += 1;
    process.stdout.write(`Batch ${batchNumber} sent successfully...\r`);
  }

}

run().catch((error) => {
  console.error("Error processing CSV:", error);
});
