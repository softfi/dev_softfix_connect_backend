import {
  sendResponseBadReq,
  sendResponseOk,
  tryCatch,
} from "../../utils/helper.js";
import AuthService from "../../service/auth.service.js";
import AdminSpecificService from "../../service/admin-specific.service.js";

const AdminAuthInstance = new AuthService();
const AdminSpecificInstance = new AdminSpecificService();

export const adminLogin = tryCatch(async (req, res) => {
  const { username, password } = req.body;

  let result = await AdminAuthInstance.login({
    username,
    password,
    type: "ADMIN",
  });
  if (result.status) {
    return sendResponseOk(res, result.msg, { data: result.data });
  } else {
    return sendResponseBadReq(res, result.msg);
  }
});

export const adminProfile = tryCatch(async (req, res) => {
  let result = await AdminAuthInstance.profile({
    apiUser: req.apiUser,
  });
  if (result.status) {
    if (result?.data && result?.data?.image && result?.data?.image?.path) {
      const urlPrefix = `${req.protocol}://${req.headers.host}/public-uploads/`;
      result.data.image.path = urlPrefix + result?.data?.image?.path;
    }
    return sendResponseOk(res, result.msg, { data: result.data });
  } else {
    return sendResponseBadReq(res, result.msg);
  }
});

export const adminChangePassword = tryCatch(async (req, res) => {
  let { oldPass, newPass } = req.body;
  let result = await AdminAuthInstance.changePassword({
    apiUser: req.apiUser,
    oldPass: oldPass,
    newPass: newPass,
  });
  if (result.status) {
    return sendResponseOk(res, result.msg);
  } else {
    return sendResponseBadReq(res, result.msg);
  }
});

export const adminDashBoard = tryCatch(async (req, res) => {
  let result = await AdminSpecificInstance.dashboard({
    apiUser: req.apiUser,
  });
  if (result.status) {
    if (result?.data && result?.data?.image && result?.data?.image?.path) {
      const urlPrefix = `${req.protocol}://${req.headers.host}/public-uploads/`;
      result.data.image.path = urlPrefix + result?.data?.image?.path;
    }
    return sendResponseOk(res, result.msg, { data: result.data });
  } else {
    return sendResponseBadReq(res, result.msg);
  }
});