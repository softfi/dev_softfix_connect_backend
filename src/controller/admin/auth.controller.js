import {
  sendResponseBadReq,
  sendResponseOk,
  tryCatch,
} from "../../utils/helper.js";
import AuthService from "../../service/auth.service.js";

const AdminAuthInstance = new AuthService();

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
