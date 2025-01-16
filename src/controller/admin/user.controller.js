import {
  sendResponseBadReq,
  sendResponseCreated,
  sendResponseOk,
  tryCatch,
} from "../../utils/helper.js";
import UserService from "../../service/user.service.js";

const UserInstance = new UserService();

export const createUser = tryCatch(async (req, res) => {
  let { name, email, password, role, profile } = req.body;

  let result = await UserInstance.create({
    name,
    email,
    password,
    role,
    profile,
  });
  if (result.status) {
    return sendResponseCreated(res, result.msg, result.data);
  } else {
    return sendResponseBadReq(res, result.msg);
  }
});

export const listUser = tryCatch(async (req, res) => {
  let { page, count, search, role, isActive } = req.body;
  const urlPrefix = `${req.protocol}://${req.headers.host}/public-uploads/`;

  let result = await UserInstance.list({
    page: Number(page) || 1,
    count: Number(count) || 10,
    search: search || "",
    role: role,
    isActive: isActive === true || isActive === false ? isActive : null,
    urlPrefix,
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

export const detailsUser = tryCatch(async (req, res) => {
  let { id } = req.params;
  const urlPrefix = `${req.protocol}://${req.headers.host}/public-uploads/`;

  let result = await UserInstance.details({ uuid: id, urlPrefix });
  if (result.status) {
    return sendResponseOk(res, result.msg, {
      data: result.data,
    });
  } else {
    return sendResponseBadReq(res, result.msg);
  }
});

export const updateUser = tryCatch(async (req, res) => {
  let {
    id,
    name,
    email,
    password,
    role,
    profile,
    isActive,
    profileImageStatus,
  } = req.body;

  let result = await UserInstance.update({
    uuid: id,
    name,
    email,
    password,
    role,
    profile,
    profileImageStatus,
    isActive: isActive === true || isActive === false ? isActive : null,
  });
  if (result.status) {
    return sendResponseCreated(res, result.msg, result.data);
  } else {
    return sendResponseBadReq(res, result.msg);
  }
});

export const deleteUser = tryCatch(async (req, res) => {
  let { id } = req.params;

  let result = await UserInstance.delete({
    uuid: id,
    apiUser: req.apiUser,
  });
  if (result.status) {
    return sendResponseOk(res, result.msg);
  } else {
    return sendResponseBadReq(res, result.msg);
  }
});
