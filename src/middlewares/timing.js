import {
  sendErrorResponse,
  sendResponseWithoutData,
  sendResponseNoContent,
  compareTime,
  currentDateTimeIndian,
} from "../utils/helper.js";
import QueryService from "../service/database/query.service.js";
import { APP_ENV } from "../config/config.js";

export const timingAuthentication = async (req, res, next) => {
  try {
    // return next();
    if (!req?.apiUser) {
      return sendResponseWithoutData(res, 401, false, "Unauthorized");
    }
    let currentDateTime = null;
    if (APP_ENV === "development") {
      currentDateTime = new Date();
    } else {
      currentDateTime = currentDateTimeIndian(new Date());
    }
    const currentWeekDay = currentDateTime.getDay();
    const currentHour = currentDateTime.getHours();
    const currentMinute = currentDateTime.getMinutes();

    let scheduleSpecialPermsInstance = new QueryService(
      "Special_Schedule_Permission"
    );

    let getPerms = await scheduleSpecialPermsInstance.getDetails({
      where: { userId: req.apiUser.id, expireTime: { gt: currentDateTime } },
    });

    if (getPerms) {
      return next();
    }

    let scheduleInstance = new QueryService("schedule");

    let getDBstatus = await scheduleInstance.getDetails({
      where: { day: currentWeekDay },
    });

    if (!getDBstatus || getDBstatus.off) {
      return sendResponseNoContent(res, "Cannot use at this time");
    }

    const currentHHMM = `${
      String(currentHour).length > 1 ? currentHour : "0" + String(currentHour)
    }:${
      String(currentMinute).length > 1
        ? currentMinute
        : "0" + String(currentMinute)
    }`;

    let checkStartTime = compareTime(currentHHMM, getDBstatus.startTime);
    if (checkStartTime === "end") {
      return sendResponseNoContent(res, "Cannot use at this time");
    }

    let checkEndTime = compareTime(currentHHMM, getDBstatus.endTime);

    if (checkEndTime === "start") {
      return sendResponseNoContent(res, "Cannot use at this time");
    }
    next();
  } catch (err) {
    console.log(err);
    return sendErrorResponse(res);
  }
};
