import express, { Express, Request, Response } from 'express';
import cluster from 'cluster';
import { cpus } from 'os';
import { Pool } from 'pg';

const totalCPUs = cpus().length;

const port = 3000;

const pool = new Pool({
  user: process.env.DATABASE_USERNAME ?? 'postgres',
  host: process.env.DATABASE_HOST ?? 'localhost',
  database: process.env.DATABASE_NAME ?? 'comparison',
  password: process.env.DATABASE_PASSWORD ?? 'postgres',
  port: 5432
  });



if (cluster.isPrimary) {
  console.log(`Number of CPUs is ${totalCPUs}`);
  console.log(`Master ${process.pid} is running`);

  // Fork workers.
  for (let i = 0; i < totalCPUs; i++) {
    cluster.fork();
  }

  cluster.on("exit", (worker, code, signal) => {
    console.log(`worker ${worker.process.pid} died`);
    console.log("Let's fork another worker!");
    cluster.fork();
  });
} else {
  const app: Express = express();
  console.log(`Worker ${process.pid} started`);

  app.get('/users', async function func(req: Request, res: Response) {

    res.send(await pool.query("SELECT * FROM account"));
  });

  app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`);
  });
}