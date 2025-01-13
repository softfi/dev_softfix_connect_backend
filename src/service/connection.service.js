import { actionContent } from "../utils/constants.js";
import { currentDateTimeIndian } from "../utils/helper.js";
import QueryService from "./database/query.service.js";
import NotificationService from "./notification.service.js";
import PersonalService from "./personal.service.js";
import UserService from "./user.service.js";

const personalInstance = new PersonalService();
const notificationInstance = new NotificationService();

class ConnectionService {
  #connections;
  #user;
  constructor() {
    this.#connections = new QueryService("Connections");
    this.#user = new UserService();
  }

  async sendConnectionReq({ apiUser, toId }) {
    let userInfo = await this.#user.details({ uuid: toId });

    if (!userInfo.status) {
      return {
        status: false,
        msg: "Invalid user id!",
      };
    }

    let getConnectionInfo = await this.#connections.get({
      where: {
        OR: [
          {
            userId1: apiUser.id,
            userId2: userInfo.data.id,
            status: { in: ["PENDING", "BLOCKED"] },
          },
          {
            userId1: userInfo.data.id,
            userId2: apiUser.id,
            status: { in: ["PENDING", "BLOCKED"] },
          },
        ],
      },
      orderBy: { id: "desc" },
      take: 1,
    });

    if (getConnectionInfo.length > 0) {
      return {
        status: false,
        msg: "Cannot perform this action",
      };
    }

    let getConnectionInfoForRejection = await this.#connections.get({
      where: {
        OR: [
          {
            userId1: apiUser.id,
            userId2: userInfo.data.id,
            status: "REJECTED",
          },
          {
            userId1: userInfo.data.id,
            userId2: apiUser.id,
            status: "REJECTED",
          },
        ],
      },
      orderBy: { id: "desc" },
      take: 1,
    });

    if (getConnectionInfoForRejection.length > 0) {
      const newData = {
        userId1: apiUser.id, // The user who's sending the request should be at `userId1`
        userId2: userInfo.data.id, // The user who's receiving the request should be at `userId2`
        status: "PENDING",
        sentAt: currentDateTimeIndian(new Date()),
        sentById: apiUser.id,
      };

      let connectionInfo = await this.#connections.update(
        { id: getConnectionInfoForRejection[0].id },
        newData
      );

      if (connectionInfo) {
        await personalInstance.create({
          fromId: apiUser.id,
          toId: userInfo.data.id,
          connectionId: connectionInfo.id,
          content: actionContent.sentConnectionReq,
          type: "ACTION",
        });

        await notificationInstance.createNotification({
          userId: userInfo.data.id,
          type: "CONNECTION_REQUEST",
          content: actionContent.notificationConnectionRequestSend,
          connectionSenderId: apiUser.id,
        });

        return {
          status: true,
          msg: "Connection request sent successfully!",
        };
      }

      return {
        status: false,
        msg: "Failed to send connection request!",
      };
    }

    const newData = {
      userId1: apiUser.id, // The user who's sending the request should be at `userId1`
      userId2: userInfo.data.id, // The user who's receiving the request should be at `userId2`
      status: "PENDING",
      sentAt: currentDateTimeIndian(new Date()),
      sentById: apiUser.id,
    };

    let connectionInfo = await this.#connections.create({ data: newData });

    if (connectionInfo) {
      await personalInstance.create({
        fromId: apiUser.id,
        toId: userInfo.data.id,
        connectionId: connectionInfo.id,
        content: actionContent.sentConnectionReq,
        type: "ACTION",
      });

      await notificationInstance.createNotification({
        userId: userInfo.data.id,
        type: "CONNECTION_REQUEST",
        content: actionContent.notificationConnectionRequestSend,
        connectionSenderId: apiUser.id,
      });
      return {
        status: true,
        msg: "Connection request sent successfully!",
      };
    }

    return {
      status: false,
      msg: "Failed to send connection request!",
    };
  }

  async getConnectionReq({ apiUser }) {
    let getConnectionList = await this.#connections.get({
      where: {
        status: "PENDING",
        userId2: apiUser.id,
      },
      select: {
        id: true,
        user1: {
          select: {
            id: true,
            uuid: true,
            name: true,
            email: true,
            image: {
              select: {
                id: true,
                extension: true,
                path: true,
              },
            },
          },
        },
        status: true,
        sentAt: true,
      },
      orderBy: { sentAt: "desc" },
    });

    return {
      status: true,
      msg: "Connection requests fetched successfully!",
      data: getConnectionList,
    };
  }

  async getConnectionDetails({ connectionId }) {
    let getConnectionList = await this.#connections.getDetails({
      where: {
        id: connectionId,
      },
      select: {
        id: true,
        user1: {
          select: {
            id: true,
            uuid: true,
            name: true,
            email: true,
            image: {
              select: {
                id: true,
                extension: true,
                path: true,
              },
            },
          },
        },
        user2: {
          select: {
            id: true,
            uuid: true,
            name: true,
            email: true,
            image: {
              select: {
                id: true,
                extension: true,
                path: true,
              },
            },
          },
        },
        status: true,
        sentAt: true,
      },
    });

    return {
      status: true,
      msg: "Connection requests fetched successfully!",
      data: getConnectionList,
    };
  }

  async getConnectionDetailsByUserId({ user1, user2 }) {
    let getConnectionList = await this.#connections.get({
      where: {
        OR: [
          {
            userId1: user1,
            userId2: user2,
          },
          {
            userId2: user1,
            userId1: user2,
          },
        ],
      },
      select: {
        id: true,
        user1: {
          select: {
            id: true,
            uuid: true,
            name: true,
            email: true,
            image: {
              select: {
                id: true,
                extension: true,
                path: true,
              },
            },
          },
        },
        user2: {
          select: {
            id: true,
            uuid: true,
            name: true,
            email: true,
            image: {
              select: {
                id: true,
                extension: true,
                path: true,
              },
            },
          },
        },
        status: true,
        sentAt: true,
      },
    });

    return {
      status: true,
      msg: "Connection requests fetched successfully!",
      data: getConnectionList.length > 0 ? getConnectionList[0] : null,
    };
  }

  async updateConnectionReq({ apiUser, user, action }) {
    let getConnectionInfo = await this.#connections.getDetails({
      where: {
        userId1: user,
        userId2: apiUser.id,
        status: "PENDING",
      },
    });

    if (!getConnectionInfo) {
      return {
        status: false,
        msg: "Invalid connection request!",
      };
    }

    if (action === "ACTIVE") {
      await this.#connections.update(
        { id: getConnectionInfo.id },
        { status: "ACTIVE" }
      );

      await personalInstance.create({
        fromId: apiUser.id,
        toId: user,
        content: actionContent.acceptConnectionReq,
        connectionId: getConnectionInfo.id,
        type: "ACTION",
      });

      let a = await notificationInstance.createNotification({
        userId: user,
        type: "CONNECTION_REQUEST",
        content: actionContent.notificationConnectionRequestAccept,
        connectionSenderId: apiUser.id,
      });
      console.log(a);

      return {
        status: true,
        msg: "Connection accepted successfully!",
      };
    } else if (action === "REJECTED") {
      await this.#connections.update(
        { id: getConnectionInfo.id },
        { status: "REJECTED" }
      );
      return {
        status: true,
        msg: "Connection rejected successfully!",
      };
    } else if (action === "BLOCKED") {
      await this.#connections.update(
        { id: getConnectionInfo.id },
        { status: "BLOCKED" }
      );

      await personalInstance.create({
        fromId: apiUser.id,
        toId: user,
        content: actionContent.blockConnection,
        connectionId: getConnectionInfo.id,
        type: "ACTION",
      });
      return {
        status: true,
        msg: "Connection blocked successfully!",
      };
    }

    return {
      status: true,
      msg: "Invalid action!",
    };
  }

  async getActiveConnections({ apiUser, page, count, search }) {
    let getConnectionList = await this.#connections.get({
      where: {
        status: "ACTIVE",
        OR: [
          {
            userId1: apiUser.id,
          },
          {
            userId2: apiUser.id,
          },
        ],
      },
      select: {
        id: true,
        user1: {
          select: {
            id: true,
            uuid: true,
            name: true,
            email: true,
            image: {
              select: {
                id: true,
                extension: true,
                path: true,
              },
            },
          },
        },
        user2: {
          select: {
            id: true,
            uuid: true,
            name: true,
            email: true,
            image: {
              select: {
                id: true,
                extension: true,
                path: true,
              },
            },
          },
        },
        status: true,
        sentAt: true,
      },
      orderBy: {
        sentAt: "desc",
      },
      skip: (page - 1) * count,
      take: count,
    });

    let getConnectionCount = await this.#connections.count({
      where: {
        status: "ACTIVE",
        OR: [
          {
            userId1: apiUser.id,
          },
          {
            userId2: apiUser.id,
          },
        ],
      },
    });

    return {
      status: true,
      msg: "Connection fetched successfully!",
      data: getConnectionList,
      count: getConnectionCount,
    };
  }
}

export default ConnectionService;
