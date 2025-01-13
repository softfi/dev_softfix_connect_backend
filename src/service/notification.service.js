import { currentDateTimeIndian } from "../utils/helper.js";
import QueryService from "./database/query.service.js";

class NotificationService {
  #notification;
  #user;
  constructor() {
    this.#notification = new QueryService("Notification");
    this.#user = new QueryService("user");
  }

  async createNotification({
    userId,
    type,
    content,
    connectionSenderId,
    groupAdderId,
    repliedPersonId,
  }) {
    let userInfo = await this.#user.getDetails({
      where: { id: userId, isDeleted: false },
    });

    if (!userInfo) {
      return {
        status: false,
        msg: "Invalid user id!",
      };
    }

    if (type !== "CONNECTION_REQUEST" && type !== "GROUP") {
      return {
        status: false,
        msg: "type options are 'CONNECTION_REQUEST' or 'GROUP'",
      };
    }

    let newData = {
      userId: userId,
      type,
      content,
      createdAt: currentDateTimeIndian(new Date()),
    };

    if (connectionSenderId) {
      newData.connectionSenderId = connectionSenderId;
    }

    if (groupAdderId) {
      newData.groupAdderId = groupAdderId;
    }

    if (repliedPersonId) {
      newData.repliedPersonId = repliedPersonId;
    }

    await this.#notification.create({ data: newData });

    return {
      status: true,
      msg: "Notification created successfully!",
    };
  }

  async getNotificationsList({ userId, isSeen, type, page, count, markSeen }) {
    let userInfo = await this.#user.getDetails({
      where: { id: userId, isDeleted: false },
    });

    if (!userInfo) {
      return {
        status: false,
        msg: "Invalid user id!",
      };
    }

    let filter = {
      userId: userInfo.id,
    };

    if (type === "CONNECTION_REQUEST" || type === "GROUP") {
      filter.type = type;
    }

    if (isSeen === true || isSeen === false) {
      filter.isSeen = isSeen;
    }

    let list = await this.#notification.get({
      where: filter,
      select: {
        id: true,
        type: true,
        content: true,
        createdAt: true,
        isSeen: true,
        connectionSender: {
          select: {
            id: true,
            uuid: true,
            name: true,
            email: true,
          },
        },
        groupAdder: {
          select: {
            id: true,
            uuid: true,
            name: true,
            email: true,
          },
        },
        repliedPerson: {
          select: {
            id: true,
            uuid: true,
            name: true,
            email: true,
          },
        },
      },
      skip: (page - 1) * count,
      take: count,
    });

    let totalCount = await this.#notification.count({
      where: filter,
    });

    if (markSeen) {
      await this.#notification.updateMany(
        { userId, isSeen: false },
        { isSeen: true }
      );
    }

    return {
      status: true,
      msg: "Notification fetched successfully!",
      data: list,
      count: totalCount,
    };
  }
}

export default NotificationService;
