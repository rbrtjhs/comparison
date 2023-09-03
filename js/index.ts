import express, { Express, Request, Response } from 'express';
import cluster from 'cluster';
import { cpus } from 'os';

const mysql = require('mysql2');
const totalCPUs = cpus().length;

const port = 3000;

const pool = mysql.createPool({
  host: process.env.DATABASE_HOST ?? 'localhost',
  user: process.env.DATABASE_USER ?? 'root',
  password: process.env.DATABASE_PASSWORD ?? 'root',
  database: 'comparison',
  waitForConnections: true,
  connectionLimit: 10,
  maxIdle: 10, // max idle connections, the default value is the same as `connectionLimit`
  idleTimeout: 60000, // idle connections timeout, in milliseconds, the default value 60000
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelay: 0
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
    // For pool initialization, see above
    const promisePool = pool.promise();
    // query database using promises
    const [rows, fields] = await promisePool.query("SELECT * FROM user");
    res.send(rows);
  });

  app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`);
  });
}