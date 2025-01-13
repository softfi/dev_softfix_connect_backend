import UserService from "../service/user.service.js";
import GroupService from "../service/group.service.js";
import ViewService from "../service/view.service.js";

class SocketEventService {
  #user;
  #group;
  #view;
  constructor(io) {
    this.#user = new UserService();
    this.#group = new GroupService();
    this.#view = new ViewService();
    this.io = io;
  }

  async sendMessageInGroup(socket, data) {
    let userInfo = await this.#user.details({ uuid: socket.apiUser.uuid });
    if (!userInfo.status) {
      throw new Error("Invalid user id");
    }
    if (!userInfo?.data?.socketId) {
      throw new Error("Socket id not available");
    }

    let groupInfo = await this.#group.details({ uuid: data.roomId });
    if (!groupInfo.status) {
      throw new Error("Invalid room id");
    }

    const urlPrefix = `http://${socket.handshake.headers.host}/public-uploads/`;
    let newLogEntry = await this.#group.setLogs({
      fromId: userInfo.data.id,
      groupId: groupInfo.data.id,
      repliedToId: data?.repliedMsgId || null,
      content: data?.content || "",
      type: "MESSAGE",
      msgType: data?.msgType || null,
      file: data?.file || null,
      fileUrlPrefix: urlPrefix,
    });

    const dataToSend = {
      log: newLogEntry,
    };
    socket.emit("self-message-for-group", dataToSend);
    socket.to(data.roomId).emit("receive-message-from-group", dataToSend);
  }

  async deleteMessageInGroup(socket, data) {
    let userInfo = await this.#user.details({ uuid: socket.apiUser.uuid });
    if (!userInfo.status) {
      throw new Error("Invalid user id");
    }
    if (!userInfo?.data?.socketId) {
      throw new Error("Socket id not available");
    }

    let groupInfo = await this.#group.details({ uuid: data.roomId });
    if (!groupInfo.status) {
      throw new Error("Invalid room id");
    }

    await this.#group.deleteLogs({
      apiUser: userInfo.data.id,
      msgId: data.msgId,
      groupId: groupInfo.data.id,
    });

    const dataToSend = {
      status: true,
      log: { msgId: data.msgId, groupId: groupInfo.data.id },
    };
    socket.emit("self-message-delete-confirmation-for-group", dataToSend);
    socket.to(data.roomId).emit("delete-message-in-group", dataToSend);
  }

  async manageGroupMessageSeen(socket, data) {
    let userInfo = await this.#user.details({ uuid: socket.apiUser.uuid });
    if (!userInfo.status) {
      throw new Error("Invalid user id");
    }
    if (!userInfo?.data?.socketId) {
      throw new Error("Socket id not available");
    }

    let groupInfo = await this.#group.details({ uuid: data.roomId });
    if (!groupInfo.status) {
      throw new Error("Invalid room id");
    }

    let groupLogInfo = await this.#group.getLogDetail({
      id: data.msgId,
    });
    if (!groupLogInfo.status) {
      throw new Error("Invalid log id");
    }

    if (groupLogInfo.data.group.uuid === data.roomId) {
      await this.#view.createGroupView({
        logId: data.msgId,
        userId: socket.apiUser.id,
      });
    } else {
      let unseenLogs = await this.#group.getGroupUnseenLog({
        groupId: groupLogInfo.data.group.id,
        userId: userInfo.data.id,
      });

      await this.#group.manageGroupLogSeen({
        groupId: groupLogInfo.data.group.id,
        userId: userInfo.data.id,
        unseen: unseenLogs.count + 1,
      });

      socket.emit("group-list-updated", { status: true, log: null });

      // socket
      //   .to(data.roomId)
      //   .emit("group-list-updated", { status: true, log: null });
    }
  }
}

export default SocketEventService;
