import BlockService from "../service/block.service.js";
import ConnectionService from "../service/connection.service.js";
import NotificationService from "../service/notification.service.js";
import PersonalService from "../service/personal.service.js";
import UserService from "../service/user.service.js";
import { currentDateTimeIndian } from "../utils/helper.js";

const connectionServiceInstance = new ConnectionService();
const userServiceInstance = new UserService();
const notificationServiceInstance = new NotificationService();
const personalServiceInstance = new PersonalService();
const blockServiceInstance = new BlockService();

class UserSocketEventService {
  constructor(io) {
    this.io = io;
  }

  async disconnection(socket) {
    console.log("****************** DISCONNECT ******************");
    console.log(socket?.apiUser);
    console.log("****************** DISCONNECT ******************");
    
    await userServiceInstance.update({
      uuid: socket?.apiUser?.uuid,
      isOnline: false,
      lastOnline: currentDateTimeIndian(new Date()),
    });
  }

  async sendConnectionRequest(socket, data) {

    console.log("*********************");
    console.log(socket.apiUser);
    console.log("*********************");
    console.log(data);
    console.log("*********************");
    
    let result = await connectionServiceInstance.sendConnectionReq({
      apiUser: socket.apiUser,
      toId: data.toUUID,
    });

    if (result.status) {
      let onlineCheck = await userServiceInstance.details({
        uuid: data.toUUID,
      });

      let reqSenderDetails = await userServiceInstance.details({
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
          log: null,
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
      let result = await connectionServiceInstance.updateConnectionReq({
        apiUser: socket.apiUser,
        user: data.userId,
        action: data.action,
      });

      if (result.status) {
        let onlineCheck = await userServiceInstance.detailsById({
          id: data.userId,
        });

        let reqSenderDetails = await userServiceInstance.details({
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
    let userInfo = await userServiceInstance.details({
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

    let receiverInfo = await userServiceInstance.details({ uuid: data.toUUID });
    if (!receiverInfo.status) {
      throw new Error("Invalid receiver id");
    }

    const connectionInfo =
      await connectionServiceInstance.getConnectionDetailsByUserId({
        user1: userInfo.data.id,
        user2: receiverInfo?.data?.id,
      });

    if (!connectionInfo?.data) {
      throw new Error("Invalid connection!");
    }

    if (data?.msgType === "TEXT" && !data?.content) {
      throw new Error("Cannot send an empty message!F");
    }

    let blockInfo = await blockServiceInstance.details({
      userId: receiverInfo.data.id,
      blockId: userInfo.data.id,
    });

    if (blockInfo.data) {
      throw new Error("Cannot send message, user has blocked you!");
    }

    const urlPrefix = `http://${socket.handshake.headers.host}/public-uploads/`;
    let newLogEntry = await personalServiceInstance.create({
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

    let userInfo = await userServiceInstance.details({
      uuid: socket.apiUser.uuid,
    });
    if (!userInfo.status) {
      throw new Error("Invalid user id");
    }
    if (!userInfo?.data?.socketId) {
      throw new Error("Socket id not available");
    }

    let receiverInfo = await userServiceInstance.details({
      uuid: data.userUUID,
    });
    if (!receiverInfo.status) {
      throw new Error("Invalid userUUID");
    }

    let personalLogInfo = await personalServiceInstance.getSingleLogDetail({
      logId: data.msgId,
    });

    if (!personalLogInfo.status) {
      throw new Error("Invalid msgId");
    }

    if (personalLogInfo.data.from.uuid === data.userUUID) {
      await personalServiceInstance.update({
        logId: data.msgId,
        isSeen: currentDateTimeIndian(new Date()),
      });
    } else {
      socket.emit("personal-list-updated", { status: true, log: null });
    }
  }

  async deletePersonalMessage(socket, data) {
    let userInfo = await userServiceInstance.details({
      uuid: socket.apiUser.uuid,
    });
    if (!userInfo.status) {
      throw new Error("Invalid user id");
    }

    let toInfo = await userServiceInstance.details({ uuid: data.toUUID });
    if (!toInfo.status) {
      throw new Error("Invalid toUUID");
    }

    let deleteStatus = await personalServiceInstance.delete({
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
}

export default UserSocketEventService;
