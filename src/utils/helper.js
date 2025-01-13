import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { JWT_EXPIRES_HOUR, JWT_SECRET_TOKEN } from "../config/config.js";
import httpStatusCodes from "./statusCodes.js";
import { Prisma } from "@prisma/client";

// ******************* Variable Path Name Start *******************

const characters =
  "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

// ******************* Variable Path Name End *********************

export const tryCatch = (fn) => {
  return async (req, res) => {
    try {
      await fn(req, res);
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        console.log(error.meta);
        return sendResponseBadReq(res, error?.meta?.cause);
      }
      console.log(error);
      return sendErrorResponse(res);
    }
  };
};

export const sendResponseWithData = (
  res,
  statusCode,
  status,
  message,
  data,
  length = false
) => {
  if (length) {
    return res.status(statusCode).json({
      status,
      message,
      data,
      count: data.length,
    });
  }
  return res.status(statusCode).json({
    status,
    message,
    data,
  });
};

export const sendResponseWithoutData = (res, statusCode, status, message) => {
  return res.status(statusCode).json({
    status,
    message,
  });
};

export const sendResponseBadReq = (res, msg) => {
  return res.status(httpStatusCodes.BAD_REQUEST).json({
    status: false,
    msg: msg ?? "",
  });
};

export const sendResponseUnAuth = (res, msg) => {
  return res.status(httpStatusCodes.UNAUTHORIZED).json({
    status: false,
    msg: msg ?? "",
  });
};

export const sendResponseOk = (res, msg, data = {}) => {
  return res.status(httpStatusCodes.OK).json({
    ...{
      status: true,
      msg: msg ?? "",
    },
    ...data,
  });
};

export const sendResponseCreated = (res, msg, data = {}) => {
  return res.status(httpStatusCodes.CREATED).json({
    ...{
      status: true,
      msg: msg ?? "",
    },
    ...data,
  });
};

export const sendResponseNoContent = (res, msg) => {
  return res.status(httpStatusCodes.NO_CONTENT).json({
    msg: msg,
  });
};

export const sendErrorResponse = (res) => {
  return res.status(httpStatusCodes.INTERNAL_SERVER_ERROR).send({
    status: false,
    msg: "Server down, try again in sometime or report the issue!",
  });
};

export const getJwtToken = (data) => {
  try {
    return jwt.sign(
      {
        data,
        exp: Math.floor(Date.now() / 1000) + 60 * 60 * Number(JWT_EXPIRES_HOUR),
      },
      JWT_SECRET_TOKEN
    );
  } catch (error) {
    console.log(error);
    return null;
  }
};

export const jwtTokenValues = async (authToken) => {
  try {
    let result = jwt.verify(authToken, JWT_SECRET_TOKEN);
    return result;
  } catch (error) {
    console.log(error);
    return null;
  }
};

export const hashPassword = async (password) => await bcrypt.hash(password, 10);

export const matchPassword = async (plainString, hashedString) =>
  await bcrypt.compare(plainString, hashedString);

export const removeSpace = (str, joinElement = "-") =>
  str.replaceAll(/[^a-zA-Z0-9]/g, joinElement);

export const generateSixDigitOtp = () =>
  Math.floor(100000 + Math.random() * 900000);

export const getTimePlusXMinutes = (timeToIncrese = 30) => {
  const currentTime = new Date();
  const ISTOffset = 330;
  const newTime = new Date(
    currentTime.getTime() + (timeToIncrese + ISTOffset) * 60000
  );
  return newTime;
};

export const generateRandomString = (length = 10) => {
  try {
    if (isNaN(length) || length > 50) {
      return null;
    }

    let result = "";
    const charLen = characters.length;

    for (let i = 0; i < length; i++) {
      const randomIndex = Math.floor(Math.random() * charLen);
      result += characters.charAt(randomIndex);
    }

    return result;
  } catch (error) {
    console.log(error);
    return null;
  }
};

export const compareTime = (start, end) => {
  let stHr = Number(start.split(":")[0]);
  let enHr = Number(end.split(":")[0]);

  if (stHr > enHr) {
    return "start";
  }

  if (stHr < enHr) {
    return "end";
  }

  let stMin = Number(start.split(":")[1]);
  let enMin = Number(end.split(":")[1]);

  if (stMin > enMin) {
    return "start";
  }

  if (stMin < enMin) {
    return "end";
  }

  return "equal";
};

export const currentDateTimeIndian = (date) =>
  new Date(date.getTime() + (5 * 60 + 30) * 60 * 1000);

// export const generateUUID = () => {
//   return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
//     const r = (Math.random() * 16) | 0;
//     const v = c === "x" ? r : (r & 0x3) | 0x8;
//     return v.toString(16);
//   });
// };
