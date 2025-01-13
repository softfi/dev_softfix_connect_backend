import express from "express";
import {
  actionConnectionRequestValidator_v,
  activityLogValidator_v,
  editProfileValidator_v,
  listValidator_v,
  loginValidator_v,
  notificationListValidator_v,
  personalLogValidator_v,
} from "../validators/admin.validator.js";
import bodyValidator from "../validators/bodyValidator.js";
import {
  employeeEditProfile,
  employeeLogin,
  employeeProfile,
  employeeProfileImageRemove,
} from "../controller/employee/auth.controller.js";
import {
  employeeGroupDetails,
  employeeGroupList,
  employeeGroupLogDetails,
  employeeGroupLogs,
  employeeGroupMembers,
} from "../controller/employee/group.controller.js";
import {
  employeePersonalLogDetails,
  employeeSinglePersonalLogDetails,
  employeeUserDetails,
  // actionEmployeeConnectionRequest,
  // employeeSendConnection,
  employeeUserList,
  employeeUserLogList,
  getEmployeeConnectionRequest,
  getEmployeeConnections,
} from "../controller/employee/user.controller.js";
import {
  notificationList
} from "../controller/employee/notification.controller.js";

export const empRoute = express.Router();
export const empAuthRoute = express.Router();

/**************************** UNAUTHENTICATED ROUTES **************************/
empRoute.group("/auth", (empRoute) => {
  empRoute.post("/", loginValidator_v, bodyValidator, employeeLogin);
});

empRoute.get("/live", (req, res) => {
  return res.status(200).send("Script executed successfully!");
});

empAuthRoute.group("/profile", (empAuthRoute) => {
  empAuthRoute.get("/", employeeProfile);
  empAuthRoute.delete("/remove-image", employeeProfileImageRemove);
  empAuthRoute.post(
    "/",
    editProfileValidator_v,
    bodyValidator,
    employeeEditProfile
  );
});

/**************************** AUTHENTICATED ROUTES ****************************/
empAuthRoute.group("/group", (empAuthRoute) => {
  empAuthRoute.get("/list", employeeGroupList);
  empAuthRoute.get("/:id", employeeGroupDetails);

  empAuthRoute.group("/member", (empAuthRoute) => {
    empAuthRoute.get("/:id", employeeGroupMembers);
  });

  empAuthRoute.group("/activity", (empAuthRoute) => {
    empAuthRoute.post(
      "/logs",
      activityLogValidator_v,
      bodyValidator,
      employeeGroupLogs
    );
    empAuthRoute.get("/logs/:id", employeeGroupLogDetails);
  });
});

empAuthRoute.group("/user", (empAuthRoute) => {
  empAuthRoute.post("/list", listValidator_v, bodyValidator, employeeUserList);
  empAuthRoute.get("/details/:uuid", employeeUserDetails);
  empAuthRoute.get("/get-connection-request", getEmployeeConnectionRequest);
  empAuthRoute.post(
    "/get-active-connection",
    listValidator_v,
    bodyValidator,
    getEmployeeConnections
  );

  empAuthRoute.group("/log", (empAuthRoute) => {
    empAuthRoute.post(
      "/list",
      listValidator_v,
      bodyValidator,
      employeeUserLogList
    );
    empAuthRoute.post(
      "/details",
      personalLogValidator_v,
      bodyValidator,
      employeePersonalLogDetails
    );

    empAuthRoute.get(
      "/details/:id",
      employeeSinglePersonalLogDetails
    );
  });
});

empAuthRoute.group("/notification", (empAuthRoute) => {
  empAuthRoute.post("/list", notificationListValidator_v, bodyValidator, notificationList);
});
