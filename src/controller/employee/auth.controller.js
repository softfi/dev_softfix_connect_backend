import {
  sendResponseBadReq,
  sendResponseOk,
  tryCatch,
} from "../../utils/helper.js";
import AuthService from "../../service/auth.service.js";

const EmpAuthInstance = new AuthService();

export const employeeLogin = tryCatch(async (req, res) => {
  const { username, password } = req.body;

  let result = await EmpAuthInstance.login({
    username,
    password,
    type: "EMPLOYEE",
  });
  if (result.status) {
    return sendResponseOk(res, result.msg, { data: result.data });
  } else {
    return sendResponseBadReq(res, result.msg);
  }
});

export const employeeProfile = tryCatch(async (req, res) => {
  let result = await EmpAuthInstance.profile({ apiUser: req.apiUser });
  if (result.status) {
    if (result?.data?.image) {
      const urlPrefix = `${req.protocol}://${req.headers.host}/public-uploads/`;
      result.data.image.path = `${urlPrefix}${result.data.image.path}`;
    }
    return sendResponseOk(res, result.msg, { data: result.data });
  } else {
    return sendResponseBadReq(res, result.msg);
  }
});

export const employeeProfileImageRemove = tryCatch(async (req, res) => {
  let result = await EmpAuthInstance.removeProfile({ apiUser: req.apiUser });
  if (result.status) {
    return sendResponseOk(res, result.msg);
  } else {
    return sendResponseBadReq(res, result.msg);
  }
});

export const employeeEditProfile = tryCatch(async (req, res) => {
  const { name, image } = req.body;
  let result = await EmpAuthInstance.editProfile({
    apiUser: req.apiUser,
    name,
    image,
  });
  if (result.status) {
    return sendResponseOk(res, result.msg);
  } else {
    return sendResponseBadReq(res, result.msg);
  }
});
