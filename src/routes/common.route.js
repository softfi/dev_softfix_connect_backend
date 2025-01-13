import express from "express";
import { uploadFile, userRegister } from "../controller/common/upload.controller.js";
import { userRegisterValidator_v } from "../validators/admin.validator.js";
import bodyValidator from "../validators/bodyValidator.js";

export const commonRoute = express.Router();
export const commonAuthRoute = express.Router();

/**************************** UNAUTHENTICATED ROUTES **************************/
commonRoute.post(
  "/register",
  userRegisterValidator_v,
  bodyValidator,
  userRegister
);

/**************************** AUTHENTICATED ROUTES ****************************/
commonAuthRoute.post("/upload-file", uploadFile);
