import QueryService from "../service/database/query.service.js";
import GroupService from "../service/group.service.js";
import PersonalService from "../service/personal.service.js";

class CommonSocketService {
  #personalInstance;
  #groupInstance;
  #connectionInstance;
  constructor() {
    this.#personalInstance = new PersonalService();
    this.#groupInstance = new GroupService();
    this.#connectionInstance = new QueryService("Connections");
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

    if (data?.data?.to?.socketId) {
      socket
        .to(data.data.to.socketId)
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

  async userOnline(socket) {
    const rawQuery = `SELECT usr.id, usr.uuid, usr.name, usr.email, usr.socketId, usr.isOnline FROM Connections con LEFT JOIN User usr ON usr.id = (CASE WHEN con.userId1 = ${socket.apiUser.id} THEN con.userId2 ELSE con.userId1 END) WHERE (con.userId1 = ${socket.apiUser.id} OR con.userId2 = ${socket.apiUser.id}) AND con.status = 'ACTIVE' AND usr.isDeleted = 0`;

    let connection = await this.#connectionInstance.raw(rawQuery);

    if (connection) {
      for (const usr of connection) {
        if (usr && usr.isOnline && usr?.socketId) {
          const dataToSend = {
            onlineStatus: true,
            user: usr,
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
