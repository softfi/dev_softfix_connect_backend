import { validationResult } from "express-validator";
import { sendResponseBadReq } from "../utils/helper.js";

const bodyValidator = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const err = errors?.array().map(({ msg, ...item }) => msg);
    return sendResponseBadReq(res, err.join(" | "));
  } else {
    next();
  }
};

export default bodyValidator;
