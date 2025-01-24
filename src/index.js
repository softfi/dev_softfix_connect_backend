import express from "express";
import cors from "cors";
import morgan from "morgan";
import fileUpload from "express-fileupload";
import http from "http";
import https from "https";
import { readFileSync } from "fs";

import databaseConnection from "./config/database.js";
import { APP_ENV, PORT } from "./config/config.js";
import api from "./routes/index.js";
import startSocket from "./socket/index.js";
import { join } from "path";
import { maxSizeToUploadFile } from "./utils/constants.js";

const app = express();
databaseConnection();

app.get("/health-check", (req, res) => {
  const data = {
    uptime: process.uptime(),
    message: "Ok",
    date: new Date(),
  };

  res.status(200).send(data);
});

/***************
  MIDDLEWARE 
****************/
app.use(
  "/socket-io-admin",
  express.static(
    join(import.meta.dirname, "../node_modules/@socket.io/admin-ui/ui/dist")
  )
);

app.use(
  fileUpload({
    abortOnLimit: true,
    limits: { fileSize: maxSizeToUploadFile * 1024 * 1024 },
    uploadTimeout: 0,
  })
);
// app.use(morgan("dev"));
app.use(cors({ origin: "*", credentials: true }));
app.use(express.json({ limit: 5 * 1024 * 1024 }));
app.use(
  "/public-uploads",
  express.static(join(import.meta.dirname, "../public/uploads"))
);
app.use("/api", api);

/***************************
   NOT FOUND HANDLER 404
****************************/
app.all("*", (req, res) => {
  return res.status(404).send({ status: false, msg: "Not Found" });
});

const httpServer = http.createServer(app);

/*********************
    SSL CERTIFICATE 
**********************/

let serverInstance = null;

if (APP_ENV === "production" || APP_ENV === "development") {
  const privateKey = readFileSync("./ssl/privateKey.pem", "utf8");
  const certificate = readFileSync("./ssl/cert.pem", "utf8");
  const chain = readFileSync("./ssl/chain.pem", "utf8");

  const credentials = {
    key: privateKey,
    cert: certificate,
    ca: chain,
  };
  serverInstance = https.createServer(credentials, app);
} else {
  serverInstance = http.createServer(app);
}

// let serverInstance = http.createServer(app);

/***************************
          SOCKET 
****************************/
await startSocket(serverInstance);

/***************************
  APPLICATION  SERVERS 
****************************/
serverInstance.listen(PORT, () => {
  console.log(`Softfix Connect server is running at PORT ${PORT}`);
});
