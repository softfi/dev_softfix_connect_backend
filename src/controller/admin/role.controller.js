import {
  sendResponseBadReq,
  sendResponseOk,
  tryCatch,
} from "../../utils/helper.js";
import RoleService from "../../service/role.service.js";

const RoleInstance = new RoleService();

export const roleList = tryCatch(async (req, res) => {
  let result = await RoleInstance.list({
    where: { NOT: { id: req.apiUser.id } },
  });
  if (result.status) {
    return sendResponseOk(res, result.msg, { data: result.data });
  } else {
    return sendResponseBadReq(res, result.msg);
  }
});
