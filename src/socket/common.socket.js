import QueryService from "../service/database/query.service.js";
import GroupService from "../service/group.service.js";
import PersonalService from "../service/personal.service.js";
import UserService from "../service/user.service.js";

class CommonSocketService {
  #personalInstance;
  #groupInstance;
  #connectionInstance;
  #userInstance;
  constructor() {
    this.#personalInstance = new PersonalService();
    this.#groupInstance = new GroupService();
    this.#connectionInstance = new QueryService("Connections");
    this.#userInstance = new UserService();
  }

  async sendSocketResponse(socket, { status, event, message, data }) {
    const dataToSend = {
      status,
      event,
      message,
      data,
    };
    socket.emit("response", dataToSend);
  }

  async personalListUpdate(socket, data) {
    let result = await this.#personalInstance.getLogList({
      apiUser: socket.apiUser,
      urlPrefix: data?.urlPrefix || "",
    });

    const dataToSend = {
      status: false,
      message: "",
      log: [],
    };
    if (result.status) {
      dataToSend.status = true;
      dataToSend.message = result.msg;
      dataToSend.log = result.data;
    }
    socket.emit("personal-list-updated", dataToSend);
  }

  async personalMessageSeen(socket, data) {
    const dataToSend = {
      status: true,
      message: "Message seen",
      log: data?.data || null,
    };

    if (data?.data?.from?.isOnline && data?.data?.from?.socketId) {
      socket
        .to(data.data.from.socketId)
        .emit("personal-message-seen", dataToSend);
    }
  }

  async groupListUpdate(socket, data) {
    let result = await this.#groupInstance.listByUser({
      apiUser: socket.apiUser,
      urlPrefix: data?.urlPrefix || "",
      search: data?.search || "",
    });

    const dataToSend = {
      status: false,
      message: "",
      log: [],
    };
    if (result.status) {
      dataToSend.status = true;
      dataToSend.message = result.msg;
      dataToSend.log = result.data;
    }
    socket.emit("group-list-updated", dataToSend);
  }

  async userOnline(socket, onlineStatus = true) {
    const rawQuery = `SELECT usr.id, usr.uuid, usr.name, usr.email, usr.socketId, usr.isOnline FROM Connections con LEFT JOIN User usr ON usr.id = (CASE WHEN con.userId1 = ${socket.apiUser.id} THEN con.userId2 ELSE con.userId1 END) WHERE (con.userId1 = ${socket.apiUser.id} OR con.userId2 = ${socket.apiUser.id}) AND con.status = 'ACTIVE' AND usr.isDeleted = 0`;

    let connection = await this.#connectionInstance.raw(rawQuery);

    let userInfo = await this.#userInstance.details({
      uuid: socket.apiUser.uuid,
    });

    if (connection) {
      for (const usr of connection) {
        if (usr && usr.isOnline && usr?.socketId) {
          const dataToSend = {
            onlineStatus: onlineStatus,
            user: {
              id: userInfo.data.id,
              uuid: userInfo.data.uuid,
              email: userInfo.data.email,
              socketId: userInfo.data.socketId,
              lastOnline: userInfo.data.lastOnline,
            },
          };
          socket.to(usr.socketId).emit("user-online", dataToSend);
        }
      }
    }

    // const dataToSend = {
    //   status: false,
    //   message: "",
    //   log: [],
    // };
    // if (result.status) {
    //   dataToSend.status = true;
    //   dataToSend.message = result.msg;
    //   dataToSend.log = result.data;
    // }
    // socket.emit("group-list-updated", dataToSend);
  }
}

export default CommonSocketService;
