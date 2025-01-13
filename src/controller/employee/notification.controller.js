import {
  sendResponseBadReq,
  sendResponseOk,
  tryCatch,
} from "../../utils/helper.js";
import NotificationService from "../../service/notification.service.js";

const NotificationInstance = new NotificationService();

export const notificationList = tryCatch(async (req, res) => {
  let { page, count, isSeen, type, markSeen } = req.body;
  const urlPrefix = `${req.protocol}://${req.headers.host}/public-uploads/`;

  let result = await NotificationInstance.getNotificationsList({
    userId: req.apiUser.id,
    isSeen: isSeen === true || isSeen === false ? isSeen : null,
    type: type,
    markSeen: markSeen,
    page: Number(page) || 1,
    count: Number(count) || 10,
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
