import express from "express";
import cors from "cors";
import morgan from "morgan";
import fileUpload from "express-fileupload";
import http from "http";

import databaseConnection from "./config/database.js";
import { PORT } from "./config/config.js";
import api from "./routes/index.js";
import startSocket from "./socket/index.js";
import { join } from "path";

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

app.use(fileUpload());
// app.use(morgan("dev"));
app.use(cors({ origin: "*", credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ limit: "500mb", extended: true }));
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

/***************************
          SOCKET 
****************************/
await startSocket(httpServer);

/***************************
  APPLICATION  SERVERS 
****************************/
httpServer.listen(PORT, () => {
  console.log(`Softfix Connect server is running at PORT ${PORT}`);
});
