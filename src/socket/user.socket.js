import BlockService from "../service/block.service.js";
import ConnectionService from "../service/connection.service.js";
import PersonalService from "../service/personal.service.js";
import UserService from "../service/user.service.js";
import CommonSocketService from "./common.socket.js";
import { currentDateTimeIndian } from "../utils/helper.js";

class UserSocketEventService {
  #connectionServiceInstance;
  #userServiceInstance;
  #personalServiceInstance;
  #blockServiceInstance;
  #commonSocketService;
  constructor(io) {
    this.#connectionServiceInstance = new ConnectionService();
    this.#userServiceInstance = new UserService();
    this.#personalServiceInstance = new PersonalService();
    this.#blockServiceInstance = new BlockService();
    this.#commonSocketService = new CommonSocketService();
    this.io = io;
  }

  async disconnection(socket, eventName) {
    console.log(`****************** ${eventName} ******************`);
    console.log(socket?.apiUser);
    console.log(`****************** ${eventName} ******************`);

    await this.#userServiceInstance.update({
      uuid: socket?.apiUser?.uuid,
      isOnline: false,
      lastOnline: currentDateTimeIndian(new Date()),
    });

    await this.#commonSocketService.userOnline(socket, false);
  }

  async on_offStatus(socket, data) {
    if (data?.status !== true && data?.status !== false) {
      throw new Error("status value should be a boolean");
    }

    if (data.status) {
      await this.#commonSocketService.userOnline(socket, true);
    } else {
      await this.disconnection(socket, "offline");
    }
  }

  async getLogDetails(socket, data = {}, eventName) {
    let { connectionId, page, count, all, markSeen } = data;

    if (!connectionId) {
      return this.#commonSocketService.sendSocketResponse(socket, {
        status: false,
        event: eventName,
        message: "connectionId not available or invalid connectionId",
        data: null,
      });
    }

    let result = await this.#personalServiceInstance.getLogDetails({
      apiUser: socket.apiUser,
      connectionId,
      page: Number(page) || 1,
      count: Number(count) || 100,
      all: all ?? false,
      markSeen: markSeen === true || markSeen === false ? markSeen : null,
    });

    if (!result.status) {
      return this.#commonSocketService.sendSocketResponse(socket, {
        status: false,
        event: eventName,
        message: result.msg,
        data: null,
      });
    }

    const urlPrefix = `http://${socket.handshake.headers.host}/public-uploads/`;
    socket.emit("get-log-details-listen", {
      status: true,
      msg: result.msg,
      data: result.data.map((item) => {
        if (item?.file) {
          item.file.path = urlPrefix + item.file?.path;
        }
        if (
          item?.repliedTo &&
          item?.repliedTo?.file &&
          item?.repliedTo?.file?.path
        ) {
          item.repliedTo.file.path = urlPrefix + item.repliedTo.file.path;
        }
        return item;
      }),
      totalCount: result.count,
    });

    for (let obj of result.unread) {
      obj.seenAt = currentDateTimeIndian(new Date());
      await this.#commonSocketService.personalMessageSeen(socket, {
        data: obj,
      });
    }
  }

  async sendConnectionRequest(socket, data) {
    let result = await this.#connectionServiceInstance.sendConnectionReq({
      apiUser: socket.apiUser,
      toId: data.toUUID,
    });

    if (result.status) {
      let onlineCheck = await this.#userServiceInstance.details({
        uuid: data.toUUID,
      });

      let reqSenderDetails = await this.#userServiceInstance.details({
        uuid: socket.apiUser.uuid,
      });

      if (onlineCheck.status && onlineCheck?.data?.socketId) {
        if (reqSenderDetails?.data.image) {
          const urlPrefix = `http://${socket.handshake.headers.host}/public-uploads/`;
          reqSenderDetails.data.image.path = `${urlPrefix}${reqSenderDetails.data.image.path}`;
        }
        const dataToSend = {
          status: true,
          msg: "Connection request received",
          log: {
            type: "CONNECTION_REQUEST",
            data: null,
          },
        };
        socket
          .to(onlineCheck.data.socketId)
          .emit("receive-notification", dataToSend);
      }
    }
  }

  async actionOnConnectionRequest(socket, data) {
    if (
      (data?.userId && data?.action === "REJECTED") ||
      data?.action === "ACTIVE"
    ) {
      let result = await this.#connectionServiceInstance.updateConnectionReq({
        apiUser: socket.apiUser,
        user: data.userId,
        action: data.action,
      });

      if (result.status) {
        let onlineCheck = await this.#userServiceInstance.detailsById({
          id: data.userId,
        });

        let reqSenderDetails = await this.#userServiceInstance.details({
          uuid: socket.apiUser.uuid,
        });

        if (onlineCheck.status && onlineCheck?.data?.socketId) {
          if (reqSenderDetails?.data.image) {
            const urlPrefix = `http://${socket.handshake.headers.host}/public-uploads/`;
            reqSenderDetails.data.image.path = `${urlPrefix}${reqSenderDetails.data.image.path}`;
          }
          if (data.action === "ACTIVE") {
            const dataToSend = {
              status: true,
              msg: "Connection request accepted",
              log: {
                type: "CONNECTION_REQUEST",
                action: data.action,
                data: reqSenderDetails?.data || null,
              },
            };
            socket
              .to(onlineCheck.data.socketId)
              .emit("receive-notification", dataToSend);
          }
        }
      }
    }
  }

  async sendMessageInPersonal(socket, data) {
    let userInfo = await this.#userServiceInstance.details({
      uuid: socket.apiUser.uuid,
    });
    if (!userInfo.status) {
      throw new Error("Invalid user id");
    }
    if (!userInfo?.data?.socketId) {
      throw new Error("Socket id not available");
    }

    if (!data?.toUUID) {
      throw new Error("Invalid receiver UUID");
    }

    let receiverInfo = await this.#userServiceInstance.details({
      uuid: data.toUUID,
    });
    if (!receiverInfo.status) {
      throw new Error("Invalid receiver id");
    }

    const connectionInfo =
      await this.#connectionServiceInstance.getConnectionDetailsByUserId({
        user1: userInfo.data.id,
        user2: receiverInfo?.data?.id,
      });

    if (!connectionInfo?.data) {
      throw new Error("Invalid connection!");
    }

    if (data?.msgType === "TEXT" && !data?.content) {
      throw new Error("Cannot send an empty message!F");
    }

    let blockInfo = await this.#blockServiceInstance.details({
      userId: receiverInfo.data.id,
      blockId: userInfo.data.id,
    });

    if (blockInfo.data) {
      throw new Error("Cannot send message, user has blocked you!");
    }

    const urlPrefix = `http://${socket.handshake.headers.host}/public-uploads/`;
    let newLogEntry = await this.#personalServiceInstance.create({
      connectionId: connectionInfo.data.id,
      fromId: userInfo.data.id,
      toId: receiverInfo.data.id,
      repliedToId: data?.repliedMsgId ? data.repliedMsgId : null,
      content: data.content,
      type: "MESSAGE",
      msgType: data?.msgType || null,
      file: data?.file || null,
      fileUrlPrefix: urlPrefix,
    });

    const dataToSend = {
      log: newLogEntry,
    };
    socket.emit("self-message-in-personal", dataToSend);
    await this.#commonSocketService.personalListUpdate(socket, { urlPrefix });

    if (receiverInfo?.data?.socketId) {
      socket
        .to(receiverInfo.data.socketId)
        .emit("receive-message-in-personal", dataToSend);
    }
  }

  async managePersonalMessageSeen(socket, data) {
    if (!data.msgId) {
      throw new Error("Invalid msgId");
    }

    let userInfo = await this.#userServiceInstance.details({
      uuid: socket.apiUser.uuid,
    });
    if (!userInfo.status) {
      throw new Error("Invalid user id");
    }
    if (!userInfo?.data?.socketId) {
      throw new Error("Socket id not available");
    }

    if (data.userUUID) {
      let receiverInfo = await this.#userServiceInstance.details({
        uuid: data.userUUID,
      });

      if (!receiverInfo.status) {
        throw new Error("Invalid userUUID");
      }
    }

    let personalLogInfo =
      await this.#personalServiceInstance.getSingleLogDetail({
        logId: data.msgId,
      });

    if (!personalLogInfo.status) {
      throw new Error("Invalid msgId");
    }

    if (personalLogInfo.data.from.uuid === data.userUUID) {
      await this.#personalServiceInstance.update({
        logId: data.msgId,
        isSeen: currentDateTimeIndian(new Date()),
      });

      personalLogInfo.data.seenAt = currentDateTimeIndian(new Date());

      await this.#commonSocketService.personalMessageSeen(socket, {
        data: personalLogInfo.data,
      });
    }

    const urlPrefix = `http://${socket.handshake.headers.host}/public-uploads/`;
    let dataToSend = {
      urlPrefix,
    };
    await this.#commonSocketService.personalListUpdate(socket, dataToSend);
  }

  async deletePersonalMessage(socket, data) {
    let userInfo = await this.#userServiceInstance.details({
      uuid: socket.apiUser.uuid,
    });
    if (!userInfo.status) {
      throw new Error("Invalid user id");
    }

    let toInfo = await this.#userServiceInstance.details({ uuid: data.toUUID });
    if (!toInfo.status) {
      throw new Error("Invalid toUUID");
    }

    let deleteStatus = await this.#personalServiceInstance.delete({
      apiUser: socket.apiUser,
      msgId: data.msgId,
    });

    if (deleteStatus.status) {
      const dataToSend = {
        status: true,
        log: { msgId: data.msgId, toUser: toInfo.data },
      };
      socket.emit("self-message-delete-confirmation-for-personal", dataToSend);
      if (toInfo?.socketId) {
        socket
          .to(toInfo.socketId)
          .emit("delete-message-in-personal", dataToSend);
      }
    }
  }

  async typingPersonalMessage(socket, data) {
    if (data?.typingStatus !== true && data?.typingStatus !== false) {
      throw new Error("typingStatus key should be a boolean value");
    }

    if (!data?.uuid) {
      throw new Error("Provide a valid uuid");
    }

    let userDetails = await this.#userServiceInstance.details({
      uuid: data?.uuid,
    });

    if (!userDetails.status) {
      throw new Error(userDetails.msg);
    }

    if (userDetails?.data?.isOnline && userDetails?.data?.socketId) {
      const dataToSend = {
        typingStatus: data?.typingStatus,
        user: {
          id: socket.apiUser.id,
          uuid: socket.apiUser.uuid,
          email: socket.apiUser.email,
          socketId: socket.apiUser.socketId,
        },
      };

      socket
        .to(userDetails.data.socketId)
        .emit("typing-in-personal-listen", dataToSend);
    }
  }
}

export default UserSocketEventService;
