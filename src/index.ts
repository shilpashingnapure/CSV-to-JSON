import { config } from "dotenv";
import express , { Request , Response } from "express";
import { dataSource } from "../ormconfig";
import {
  calculateAgeDistribution,
  printResult,
} from "./services/user";
import { CSVFileParse } from "./services/csv-to-json-convert";

const app = express();

config();

async function startServer() {
  await dataSource.initialize();

  // convert CSV to JSON
  app.post("/csv-to-json", async (req : Request, res : Response) => {
    try {
      const data = await CSVFileParse();
      return res.status(200).send({ users : data });
    } catch (err) {
      return res.status(500).send({
        message: err.message,
      });
    }
  });

  // age distrubtion of all users based on condition
  app.get("/age-distribution", async (req : Request, res : Response) => {
    try {
      const distribution = await calculateAgeDistribution();
      if(!distribution){
          return res.status(200).send({
            message : 'no user'
          })
      }

      printResult(distribution);
      return res.status(200).send(distribution);
    } catch (err) {
      return res.status(500).send({
        message: err.message,
      });
    }
  });

  const PORT = 4000;
  app.listen(PORT, () => {
    console.log("server is running !!!");
  });
}

startServer().catch((err) => {
  console.log(err);
});

