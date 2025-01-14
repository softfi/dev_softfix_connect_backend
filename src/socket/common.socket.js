class CommonSocketService {
  constructor() {}

  async sendSocketResponse(socket, status, event, message, data) {
    const dataToSend = {
      status,
      event,
      message,
      data,
    };
    socket.emit("response", dataToSend);
  }
}

export default CommonSocketService;
