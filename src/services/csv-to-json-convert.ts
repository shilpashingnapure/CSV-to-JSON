import fs from "fs";
import path from "path";
import { storeUsers } from "./user";

const BATCH_SIZE = 1000;

/**
 * Read a CSV file , process it in chunks , stores the results in a databse
 * @returns A promise that resolves with Array of Object
 */

export const CSVFileParse = async () => {
  const csvFilePath = process.env.CSV_FILE_PATH;
  if (!csvFilePath) {
    return  new Error("CSV file path is not provided in env variables");
  }
  const filePath = path.resolve(csvFilePath);
  const readStream = fs.createReadStream(filePath, { encoding: "utf8" });

  const result = [];

  const labels = [];
  let buffer = "";
  return new Promise((resolve, reject) => {
    readStream.on("data", async (chunk) => {
      buffer += chunk;
      let lines = buffer.trim().split("\n");

      if (labels.length === 0) {
        labels.push(...lines[0].split(","));
        lines = lines.slice(1);
      }

      const linesToProcess = lines.slice(0, -1);
      buffer = lines[lines.length - 1];
      try {
        const chunkData = await CSVtoJSON(linesToProcess, labels);
        result.push(...chunkData);
        await processBatches(result);
      } catch (err) {
        readStream.destroy();
        reject(err);
      }
    });

    readStream.on("end", async () => {
      if (buffer.length > 0) {
        try {
          const finalData = await CSVtoJSON(buffer.split("\n"), labels);
          result.push(...finalData);
          await processBatches(result);
        } catch (err) {
          return reject(err);
        }
      }
      resolve(result);
    });

    readStream.on("error", (error) => {
      reject(error);
    });
  });
};

/**
 * converts CSV rows to JSON objects.
 * @param labels - The labels of the CSV data
 * @param data - The rows of CSV data
 * @returns - A promise that resolves with the JSON data.
 */
export const CSVtoJSON = async (data: any, labels: string[]) => {
  const res = data.map((row) => {
    let user = row.split(",");
    let obj = {};
    labels.forEach((label: string, index: number) => {
      let keys = label.split(".");
      let value = user[index] ? user[index].trim() : user[index];
      setNestedValue(obj, keys, 0, value);
    });
    return obj;
  });
  return res;
};

/**
 * recursively sets , to handle nested object
 * @returns nested object with value
 */
export const setNestedValue = (
  obj: {},
  keys: string[],
  index: number,
  value: string
) => {
  let key = keys[index].trim();
  if (index >= keys.length - 1) {
    obj[key] = value;
    return obj;
  }

  if (!obj[key]) {
    obj[key] = {};
  }

  return setNestedValue(obj[key], keys, index + 1, value);
};

/**
 * process results in batches and stores them in the database.
 * @param data - The object[] to store into database
 */
const processBatches = async (data) => {
const batches = [];
  for (let i = 0; i < data.length; i += BATCH_SIZE) {
    let batch = data.slice(i, i + BATCH_SIZE);
    batches.push(batch);
  }

  try{
    await Promise.all(batches.map(batch => storeUsers(batch)));
  }catch(err){
    console.log(err);

  }
};
