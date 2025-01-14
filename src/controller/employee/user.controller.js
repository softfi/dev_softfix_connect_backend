import {
  sendResponseBadReq,
  sendResponseOk,
  tryCatch,
} from "../../utils/helper.js";
import UserService from "../../service/user.service.js";
import RoleService from "../../service/role.service.js";
import ConnectionService from "../../service/connection.service.js";
import PersonalService from "../../service/personal.service.js";

const EmpUserInstance = new UserService();
const EmpRoleInstance = new RoleService();
const ConnectionServiceInstance = new ConnectionService();
const PersonalInstance = new PersonalService();

export const employeeUserList = tryCatch(async (req, res) => {
  let { page, count, search, all } = req.body;
  const urlPrefix = `${req.protocol}://${req.headers.host}/public-uploads/`;

  let getRole = await EmpRoleInstance.list({});

  let roleFilter = getRole.data
    ?.filter((e) => e.strongId === 2 || e.strongId === 3)
    .map((e) => e.id);

  let result = await EmpUserInstance.listWithConnectionStatus({
    all: all === true || all === false ? all : null,
    apiUser: req.apiUser,
    page: Number(page) || 1,
    count: Number(count) || 10,
    search: search || "",
    role: roleFilter,
    urlPrefix,
    orderBy: {
      name: "asc",
    },
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

export const employeeUserDetails = tryCatch(async (req, res) => {
  let { uuid } = req.params;
  const urlPrefix = `${req.protocol}://${req.headers.host}/public-uploads/`;

  let result = await EmpUserInstance.details({
    uuid: uuid,
    urlPrefix: urlPrefix,
  });

  if (result.status) {
    return sendResponseOk(res, result.msg, {
      data: {
        id: result?.data?.id,
        uuid: result?.data?.uuid,
        name: result?.data?.name,
        email: result?.data?.email,
        socketId: result?.data?.socketId,
        image: result?.data?.image,
        role: result?.data?.role,
        createdAt: result?.data?.createdAt,
        isOnline: result?.data?.isOnline,
        lastOnline: result?.data?.lastOnline,
      },
    });
  } else {
    return sendResponseBadReq(res, result.msg);
  }
});

export const getEmployeeConnectionRequest = tryCatch(async (req, res) => {
  let result = await ConnectionServiceInstance.getConnectionReq({
    apiUser: req.apiUser,
  });

  const urlPrefix = `${req.protocol}://${req.headers.host}/public-uploads/`;

  if (result.status) {
    if (result?.data) {
      result.data = result.data.map((item) => {
        if (item.user1?.image) {
          item.user1.image.path = `${urlPrefix}/${item.user1.image.path}`;
        }

        return item;
      });
    }
    return sendResponseOk(res, result.msg, { data: result?.data || [] });
  } else {
    return sendResponseBadReq(res, result.msg);
  }
});

export const getEmployeeConnections = tryCatch(async (req, res) => {
  let { page, count, search } = req.body;

  const urlPrefix = `${req.protocol}://${req.headers.host}/public-uploads/`;

  let result = await ConnectionServiceInstance.getActiveConnections({
    apiUser: req.apiUser,
    page: Number(page) || 1,
    count: Number(count) || 10,
    search: search || "",
    urlPrefix,
  });

  if (result.status) {
    if (result?.data) {
      result.data = result.data.map((item) => {
        if (item.user1?.image) {
          item.user1.image.path = `${urlPrefix}/${item.user1.image.path}`;
        }
        if (item.user2?.image) {
          item.user2.image.path = `${urlPrefix}/${item.user2.image.path}`;
        }

        return item;
      });
    }

    return sendResponseOk(res, result.msg, {
      data: result?.data || [],
      totalCount: result?.count,
    });
  } else {
    return sendResponseBadReq(res, result.msg);
  }
});

export const employeeUserLogList = tryCatch(async (req, res) => {
  // let { page, count, search } = req.body;
  const urlPrefix = `${req.protocol}://${req.headers.host}/public-uploads/`;

  let result = await PersonalInstance.getLogList({
    apiUser: req.apiUser,
    // page: Number(page) || 1,
    // count: Number(count) || 10,
    // search: search || "",
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

export const employeePersonalLogDetails = tryCatch(async (req, res) => {
  let { connectionId, page, count, search, all, markSeen } = req.body;

  let result = await PersonalInstance.getLogDetails({
    apiUser: req.apiUser,
    connectionId,
    page: Number(page) || 1,
    count: Number(count) || 100,
    all: all ?? false,
    markSeen: markSeen === true || markSeen === false ? markSeen : null,
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
      totalCount: result.count,
    });
  } else {
    return sendResponseBadReq(res, result.msg);
  }
});

export const employeeSinglePersonalLogDetails = tryCatch(async (req, res) => {
  let { id } = req.params;

  let result = await PersonalInstance.getSingleLogDetail({
    logId: Number(id),
  });

  if (result.status) {
    const urlPrefix = `${req.protocol}://${req.headers.host}/public-uploads/`;
    if (result.data?.file && result.data.file?.path) {
      result.data.file.path = urlPrefix + result.data.file.path;
    }
    return sendResponseOk(res, result.msg, {
      data: result.data,
    });
  } else {
    return sendResponseBadReq(res, result.msg);
  }
});
