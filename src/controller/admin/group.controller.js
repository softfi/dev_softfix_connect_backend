import {
  generateRandomString,
  sendResponseBadReq,
  sendResponseCreated,
  sendResponseOk,
  tryCatch,
} from "../../utils/helper.js";
import GroupService from "../../service/group.service.js";
import UserService from "../../service/user.service.js";

const UserInstance = new UserService();
const GroupInstance = new GroupService();

export const createGroup = tryCatch(async (req, res) => {
  let { name, description, isActive, code, icon } = req.body;

  let result = await GroupInstance.create({
    apiUser: req.apiUser,
    name,
    description,
    isActive,
    code,
    icon,
  });
  if (result.status) {
    return sendResponseCreated(res, result.msg);
  } else {
    return sendResponseBadReq(res, result.msg);
  }
});

export const listGroup = tryCatch(async (req, res) => {
  let { page, count, search, isActive } = req.body;

  const urlPrefix = `${req.protocol}://${req.headers.host}/public-uploads/`;
  let result = await GroupInstance.list({
    page: Number(page) || 1,
    count: Number(count) || 10,
    search: search || "",
    isActive,
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

export const detailsGroup = tryCatch(async (req, res) => {
  let { id } = req.params;

  const urlPrefix = `${req.protocol}://${req.headers.host}/public-uploads/`;
  let result = await GroupInstance.details({ uuid: id, urlPrefix });
  if (result.status) {
    return sendResponseOk(res, result.msg, {
      data: result.data,
    });
  } else {
    return sendResponseBadReq(res, result.msg);
  }
});

export const updateGroup = tryCatch(async (req, res) => {
  let { id, name, description, isActive, code, icon } = req.body;

  let result = await GroupInstance.update({
    apiUser: req.apiUser,
    uuid: id,
    name,
    description,
    isActive,
    code,
    icon,
  });
  if (result.status) {
    return sendResponseCreated(res, result.msg);
  } else {
    return sendResponseBadReq(res, result.msg);
  }
});

export const deleteGroup = tryCatch(async (req, res) => {
  let { id } = req.params;

  let result = await GroupInstance.delete({
    uuid: id,
  });
  if (result.status) {
    return sendResponseOk(res, result.msg);
  } else {
    return sendResponseBadReq(res, result.msg);
  }
});

export const refreshGroup = tryCatch(async (req, res) => {
  let { id } = req.params;

  let result = await GroupInstance.update({
    apiUser: req.apiUser,
    uuid: id,
    code: generateRandomString(6),
  });
  if (result.status) {
    return sendResponseOk(res, result.msg, { data: result.data.code });
  } else {
    return sendResponseBadReq(res, result.msg);
  }
});

export const addMemberToGroup = tryCatch(async (req, res) => {
  let { groupId, memberId } = req.body;

  let result = await GroupInstance.addMembers({
    apiUser: req.apiUser,
    groupId,
    member: memberId,
  });
  if (result.status) {
    return sendResponseOk(res, result.msg);
  } else {
    return sendResponseBadReq(res, result.msg);
  }
});

export const removeMemberToGroup = tryCatch(async (req, res) => {
  let { groupId, memberId } = req.body;

  let result = await GroupInstance.removeMembers({
    apiUser: req.apiUser,
    groupId,
    member: memberId,
  });
  if (result.status) {
    return sendResponseOk(res, result.msg);
  } else {
    return sendResponseBadReq(res, result.msg);
  }
});

export const getMemberFromGroup = tryCatch(async (req, res) => {
  let { id } = req.params;

  let result = await GroupInstance.getMembers({
    groupId: id,
  });
  if (result.status) {
    if (result?.data) {
      const urlPrefix = `${req.protocol}://${req.headers.host}/public-uploads/`;
      result.data = result.data.map((item) => {
        if (item.user?.image) {
          item.user.image.path = `${urlPrefix}/${item.user.image.path}`;
        }
        return item;
      });
    }
    return sendResponseOk(res, result.msg, { data: result.data });
  } else {
    return sendResponseBadReq(res, result.msg);
  }
});

export const memberNotInGroup = tryCatch(async (req, res) => {
  let { page, count, search, groupId } = req.body;

  let result = await UserInstance.notInGroup({
    page: Number(page) || 1,
    count: Number(count) || 10,
    search: search || "",
    groupId: groupId,
  });
  if (result.status) {
    if (result?.data) {
      const urlPrefix = `${req.protocol}://${req.headers.host}/public-uploads/`;
      result.data = result.data.map((item) => {
        if (item?.path) {
          item.path = `${urlPrefix}/${item.path}`;
        }
        return item;
      });
    }
    return sendResponseOk(res, result.msg, {
      data: result.data,
      totalCount: result.count,
    });
  } else {
    return sendResponseBadReq(res, result.msg);
  }
});
