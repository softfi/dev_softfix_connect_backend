import {
  sendResponseBadReq,
  sendResponseOk,
  tryCatch,
} from "../../utils/helper.js";
import GroupService from "../../service/group.service.js";

const EmpGroupInstance = new GroupService();

export const employeeGroupList = tryCatch(async (req, res) => {
  let result = await EmpGroupInstance.listByUser({
    apiUser: req.apiUser,
    search: req?.query?.search || "",
  });
  if (result.status) {
    return sendResponseOk(res, result.msg, { data: result.data });
  } else {
    return sendResponseBadReq(res, result.msg);
  }
});

export const employeeGroupDetails = tryCatch(async (req, res) => {
  let { id } = req.params;
  let result = await EmpGroupInstance.details({
    uuid: id,
  });
  if (result.status) {
    return sendResponseOk(res, result.msg, {
      data: {
        id: result.data?.id,
        uuid: result.data?.uuid,
        code: result.data?.code,
        name: result.data?.name,
        description: result.data?.description,
        maxUser: result.data?.maxUser,
        isActive: result.data?.isActive,
      },
    });
  } else {
    return sendResponseBadReq(res, result.msg);
  }
});

export const employeeGroupMembers = tryCatch(async (req, res) => {
  let { id } = req.params;

  let result = await EmpGroupInstance.getMembers({
    groupId: id,
  });
  if (result.status) {
    return sendResponseOk(res, result.msg, {
      data: result.data,
    });
  } else {
    return sendResponseBadReq(res, result.msg);
  }
});

export const employeeGroupLogs = tryCatch(async (req, res) => {
  let { groupId, page, count, all } = req.body;

  let result = await EmpGroupInstance.getLogs({
    apiUser: req.apiUser,
    groupId,
    page: Number(page) || 1,
    count: Number(count) || 100,
    all: all ?? false,
  });

  if (result.status) {
    const urlPrefix = `${req.protocol}://${req.headers.host}/public-uploads/`;
    return sendResponseOk(res, result.msg, {
      data: result.data.map((item) => {
        if (item?.file) {
          item.file.path = urlPrefix + item.file?.path;
        }
        return item;
      }),
      totalCount: result.totalCount,
    });
  } else {
    return sendResponseBadReq(res, result.msg);
  }
});

export const employeeGroupLogDetails = tryCatch(async (req, res) => {
  let { id } = req.params;

  let result = await EmpGroupInstance.getLogDetails({
    apiUser: req.apiUser,
    logId: Number(id),
  });

  const urlPrefix = `${req.protocol}://${req.headers.host}/public-uploads/`;

  if (result.status) {
    if (result?.data?.file) {
      result.data.file.path = urlPrefix + result?.data?.file?.path;
    }

    if (result.data?.seenBy) {
      result.data.seenBy = result.data.seenBy.map((item) => {
        if (item?.user?.image) {
          item.user.image.path = urlPrefix + item.user.image.path;
        }
        return item;
      });
    }
    return sendResponseOk(res, result.msg, {
      data: result.data,
    });
  } else {
    return sendResponseBadReq(res, result.msg);
  }
});
