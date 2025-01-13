import {
  sendResponseBadReq,
  sendResponseOk,
  tryCatch,
} from "../../utils/helper.js";
import UploadService from "../../service/upload.service.js";

const uploadServiceInstance = new UploadService();

export const uploadFile = tryCatch(async (req, res) => {
  if (!req?.files || !("file" in req?.files)) {
    return sendResponseBadReq(res, "File not provided");
  }

  let fileData = req.files.file;
  if (!Array.isArray(fileData)) {
    fileData = [fileData];
  }

  const urlPrefix = `${req.protocol}://${req.headers.host}/public-uploads/`;

  let result = await uploadServiceInstance.uploadFiles({
    apiUser: req.apiUser,
    fileArray: fileData,
    urlPrefix,
  });
  if (result.status) {
    return sendResponseOk(res, result.msg, { data: result.data });
  } else {
    return sendResponseBadReq(res, result.msg);
  }
});

export const userRegister = tryCatch(async (req, res) => {
  let { name, email, password } = req.body;

  let result = await uploadServiceInstance.userRegister({
    name,
    email,
    password,
  });
  if (result.status) {
    return sendResponseOk(res, result.msg, { data: result.data });
  } else {
    return sendResponseBadReq(res, result.msg);
  }
});
