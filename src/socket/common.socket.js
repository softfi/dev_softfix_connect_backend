import GroupService from "../service/group.service.js";
import PersonalService from "../service/personal.service.js";

class CommonSocketService {
  #personalInstance;
  #groupInstance;
  constructor() {
    this.#personalInstance = new PersonalService();
    this.#groupInstance = new GroupService();
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

    if(data?.data?.to?.socketId){
      socket.to(data.data.to.socketId).emit("personal-message-seen", dataToSend);
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
}

export default CommonSocketService;
