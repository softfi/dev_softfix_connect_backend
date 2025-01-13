import express from "express";
import { adminAuthRoute, adminRoute } from "./admin.route.js";
import { adminAuthentication } from "../middlewares/admin.js";
import { empAuthRoute, empRoute } from "./employee.route.js";
import { empAuthentication } from "../middlewares/employee.js";
import { commonAuthRoute, commonRoute } from "./common.route.js";
import { commonAuthentication } from "../middlewares/common.js";
import { timingAuthentication } from "../middlewares/timing.js";

let api = express.Router();

/**************************** UNAUTHENTICATED ROUTES ****************************/
api.use("/admin", adminRoute);
api.use("/emp", empRoute);
api.use("/common", commonRoute);

/**************************** AUTHENTICATED ROUTES ****************************/
api.use("/admin", adminAuthentication, adminAuthRoute);
api.use("/emp", empAuthentication, timingAuthentication, empAuthRoute);
api.use("/common", commonAuthentication, commonAuthRoute);

export default api;
