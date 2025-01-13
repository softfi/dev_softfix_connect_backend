import { Server } from "socket.io";
import { socketAuthentication } from "../middlewares/socket.js";
import UserService from "../service/user.service.js";
import GroupService from "../service/group.service.js";
import SocketEventService from "./group.socket.js";
import { printSocketConnection } from "../log/action.js";
import { tryCatch } from "../utils/helper.js";
import UserSocketEventService from "./user.socket.js";

const userServiceInstance = new UserService();
const groupServiceInstance = new GroupService();

const startSocket = tryCatch(async (app) => {
  const io = new Server(app, {
    cors: {
      origin: "*",
    },
  });

  const socketServiceInstance = new SocketEventService(io);
  const userSocketServiceInstance = new UserSocketEventService(io);

  io.use(socketAuthentication);

  io.on("connection", async (socket) => {
    let currentUser = io.engine.clientsCount;

    let updateResult = await userServiceInstance.update({
      uuid: socket?.apiUser?.uuid,
      socketId: socket.id,
      isOnline: true,
    });

    if (!updateResult.status) {
      console.log("Socket id updation failed!");
      socket.disconnect();
      return;
    }

    let getGroupResult = await groupServiceInstance.listByUser({
      apiUser: socket.apiUser,
      search: "",
    });

    if (!getGroupResult.status) {
      console.log("Group query failed!");
      socket.disconnect();
      return;
    }

    for (let groupInfo of getGroupResult.data) {
      socket.join(groupInfo.group.uuid);
    }

    io.engine.on("connection_error", (err) => {
      console.log(err.req);
      console.log(err.code);
      console.log(err.message);
      console.log(err.context);
    });

    // printSocketConnection({ socket, currentUser });
    socket.on("disconnect", () => {
      userSocketServiceInstance.disconnection(socket);
    });

    socket.on("send-message-in-group", (data) =>
      socketServiceInstance.sendMessageInGroup(socket, data)
    );

    socket.on("delete-message-in-group", (data) =>
      socketServiceInstance.deleteMessageInGroup(socket, data)
    );

    socket.on("current-group-with-log", (data) =>
      socketServiceInstance.manageGroupMessageSeen(socket, data)
    );

    socket.on("send-connection-req", (data) =>
      userSocketServiceInstance.sendConnectionRequest(socket, data)
    );

    socket.on("action-on-connection-req", (data) =>
      userSocketServiceInstance.actionOnConnectionRequest(socket, data)
    );

    socket.on("send-message-to-personal", (data) =>
      userSocketServiceInstance.sendMessageInPersonal(socket, data)
    );

    socket.on("current-personal-chat-with-log", (data) =>
      userSocketServiceInstance.managePersonalMessageSeen(socket, data)
    );

    socket.on("delete-personal-log", (data) =>
      userSocketServiceInstance.deletePersonalMessage(socket, data)
    );
  });
});

export default startSocket;
