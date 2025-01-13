import jwt from "jsonwebtoken";
import { JWT_SECRET_TOKEN } from "../config/config.js";
import {
  jwtTokenValues,
  sendErrorResponse,
  sendResponseWithoutData,
  sendResponseUnAuth,
  sendResponseBadReq,
} from "../utils/helper.js";
import QueryService from "../service/database/query.service.js";

export const commonAuthentication = (req, res, next) => {
  try {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];

    if (!token) {
      return sendResponseWithoutData(res, 401, false, "Unauthorized");
    }

    jwt.verify(token, JWT_SECRET_TOKEN, async function (err) {
      if (err) {
        console.log(err);
        return sendResponseUnAuth(res, "Token Expired");
      } else {
        var decoded = await jwtTokenValues(token);

        if (!decoded) {
          return sendResponseUnAuth(res, "Invalid Token");
        }

        let roleInstance = new QueryService("role", false);

        let roleInfo = await roleInstance.get({
          where: {
            OR: [
              {
                strongId: 1,
              },
              {
                strongId: 2,
              },
              {
                strongId: 3,
              },
              {
                strongId: 4,
              },
            ],
          },
        });
        if (roleInfo.length === 0) {
          return sendResponseBadReq(res, "Roles not available");
        }

        let userInstance = new QueryService("user");
        let userInfo = await userInstance.getDetails(
          { where: { id: decoded?.data?.id } },
          { select: { id: true, roleId: true, email: true } }
        );
        
        if (userInfo) {
          if (roleInfo.map((e) => e.id).includes(userInfo.roleId)) {
            req.apiUser = userInfo;
            return next();
          }
        }
        return sendResponseUnAuth(res, "Invalid Token");
      }
    });
  } catch (err) {
    console.log(err);
    return sendErrorResponse(res);
  }
};
