import jwt from "jsonwebtoken";
import { JWT_SECRET_TOKEN, APP_ENV } from "../config/config.js";
import { jwtTokenValues, sendErrorResponse } from "../utils/helper.js";
import QueryService from "../service/database/query.service.js";

export const socketAuthentication = (socket, next) => {
  try {
    const authHandshake = socket?.handshake;
    if (!authHandshake) {
      console.log("Not a valid socket request!");
      socket.disconnect({ ok: 123 });
      return;
    }
    let token = null;
    // console.log("authHandshake?.headers ===========");
    // console.log(authHandshake?.headers);
    // console.log("authHandshake?.auth ===========");
    // console.log(authHandshake?.auth);

    if (APP_ENV === "development") {
      token = authHandshake?.headers["authorization"];
    } else {
      token = authHandshake?.auth["authorization"];
    }
    console.log("--------------------");
    console.log(token);
    console.log("--------------------");

    if (!token) {
      console.log("Token not available!");
      socket.disconnect();
      return;
    }

    jwt.verify(token, JWT_SECRET_TOKEN, async function (err) {
      if (err) {
        console.log(err);
        socket.disconnect();
        return;
      } else {
        var decoded = await jwtTokenValues(token);
        // console.log("------xxxxxxxxxxxxx--------");
        // console.log(decoded);
        // console.log("------xxxxxxxxxxxx--------");

        if (!decoded) {
          console.log("Invalid socket token!");
          socket.disconnect();
          return;
        }

        let roleInstance = new QueryService("role");

        let roleList = await roleInstance.get({
          where: { strongId: { in: [1, 2, 3, 4] } },
        });

        if (roleList.length === 0) {
          console.log("Roles not available!");
          socket.disconnect();
          return;
        }

        let userInstance = new QueryService("user");

        let userInfo = await userInstance.getDetails(
          { where: { id: decoded?.data?.id, isDeleted: false } },
          {
            select: {
              id: true,
              uuid: true,
              role: { select: { id: true, strongId: true, name: true } },
              email: true,
            },
          }
        );

        if (userInfo) {
          if (roleList.map((e) => e.id).includes(userInfo?.role?.id)) {
            socket.apiUser = { ...userInfo, socketId: socket.id };
            return next();
          }
        }
        console.log("Invalid socket token!");
        socket.disconnect();
        return;
      }
    });
  } catch (err) {
    console.log(err);
    return sendErrorResponse(res);
  }
};
