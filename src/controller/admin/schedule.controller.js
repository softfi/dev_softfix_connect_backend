import {
  sendResponseBadReq,
  sendResponseCreated,
  sendResponseOk,
  tryCatch,
} from "../../utils/helper.js";
import ScheduleService from "../../service/schedule.service.js";
import UserService from "../../service/user.service.js";

const ScheduleInstance = new ScheduleService();
const UserInstance = new UserService();

export const getSchedule = tryCatch(async (req, res) => {
  let result = await ScheduleInstance.getSchedule();

  if (result.status) {
    return sendResponseOk(res, result.msg, { data: result.data });
  } else {
    return sendResponseBadReq(res, result.msg);
  }
});

export const updateSchedule = tryCatch(async (req, res) => {
  let { id, startTime, endTime, off } = req.body;
  let result = await ScheduleInstance.updateSchedule({
    id,
    startTime,
    endTime,
    off,
  });

  if (result.status) {
    return sendResponseCreated(res, result.msg);
  } else {
    return sendResponseBadReq(res, result.msg);
  }
});

export const addSchedulePerms = tryCatch(async (req, res) => {
  let { userId, expireDateTime } = req.body;
  let result = await ScheduleInstance.addSchedulePerms({
    apiUser: req.apiUser,
    userId,
    expireDateTime,
  });

  if (result.status) {
    return sendResponseOk(res, result.msg);
  } else {
    return sendResponseBadReq(res, result.msg);
  }
});

export const getSchedulePerms = tryCatch(async (req, res) => {
  let { userId } = req.params;
  let result = await ScheduleInstance.getSchedulePerms({
    uuid: userId,
  });

  if (result.status) {
    return sendResponseOk(res, result.msg, { data: result?.data || null });
  } else {
    return sendResponseBadReq(res, result.msg);
  }
});

export const removeSchedulePerms = tryCatch(async (req, res) => {
  let { userId } = req.body;
  let result = await ScheduleInstance.removeSchedulePerms({
    userId,
  });

  if (result.status) {
    return sendResponseOk(res, result.msg);
  } else {
    return sendResponseBadReq(res, result.msg);
  }
});

export const getUserWithPerms = tryCatch(async (req, res) => {
  let { page, count, search } = req.body;

  const urlPrefix = `${req.protocol}://${req.headers.host}/public-uploads/`;
console.log("pppppppppppoooooopppppppppppp");
console.log(urlPrefix);
console.log("zzzzzzzzzzoooooozzzzzzzzzz");

  let result = await UserInstance.listWithPerms({
    page: Number(page) || 1,
    count: Number(count) || 10,
    search: search || "",
    urlPrefix
  });
  if (result.status) {
    return sendResponseOk(res, result.msg, {
      data: result.data,
      totalCount: result.count,
    });
  } else {
    return sendResponseBadReq(res, result.msg);
  }
});
