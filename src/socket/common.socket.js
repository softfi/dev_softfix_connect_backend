import PersonalService from "../service/personal.service.js";

class CommonSocketService {
  #personalInstance;
  constructor() {
    this.#personalInstance = new PersonalService();
  }

  async sendSocketResponse(socket, status, event, message, data) {
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
      data: [],
    };
    if (result.status) {
      dataToSend.status = true;
      dataToSend.message = result.msg;
      dataToSend.data = result.data;
    }
    socket.emit("personal-list-updated", dataToSend);
  }
}

export default CommonSocketService;
