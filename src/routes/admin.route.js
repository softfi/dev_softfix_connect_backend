import express from "express";
import "express-group-routes";

import {
  adminChangePassword,
  adminLogin,
  adminProfile,
} from "../controller/admin/auth.controller.js";
import {
  groupAddMemberValidator_v,
  groupCreateValidator_v,
  groupListValidator_v,
  groupUpdateValidator_v,
  loginValidator_v,
  passwordChangeValidator_v,
  removeSchedulePermsValidator_v,
  updateSchedulePermsValidator_v,
  updateScheduleValidator_v,
  userCreateValidator_v,
  userListValidator_v,
  userUpdateValidator_v,
} from "../validators/admin.validator.js";
import bodyValidator from "../validators/bodyValidator.js";
import { roleList } from "../controller/admin/role.controller.js";
import {
  createUser,
  deleteUser,
  detailsUser,
  listUser,
  updateUser,
} from "../controller/admin/user.controller.js";
import {
  addMemberToGroup,
  createGroup,
  deleteGroup,
  detailsGroup,
  getMemberFromGroup,
  listGroup,
  memberNotInGroup,
  refreshGroup,
  removeMemberToGroup,
  updateGroup,
} from "../controller/admin/group.controller.js";
import {
  addSchedulePerms,
  getSchedule,
  getSchedulePerms,
  getUserWithPerms,
  removeSchedulePerms,
  updateSchedule,
} from "../controller/admin/schedule.controller.js";

export const adminRoute = express.Router();
export const adminAuthRoute = express.Router();

/**************************** UNAUTHENTICATED ROUTES **************************/
adminRoute.group("/auth", (adminRoute) => {
  adminRoute.post("/", loginValidator_v, bodyValidator, adminLogin);
});

/**************************** AUTHENTICATED ROUTES ****************************/
adminAuthRoute.group("/profile", (adminAuthRoute) => {
  adminAuthRoute.get("/", adminProfile);
  adminAuthRoute.put(
    "/change-password",
    passwordChangeValidator_v,
    bodyValidator,
    adminChangePassword
  );
});

adminAuthRoute.group("/role", (adminAuthRoute) => {
  adminAuthRoute.get("/", roleList);
});

adminAuthRoute.group("/user", (adminAuthRoute) => {
  adminAuthRoute.post("/", userCreateValidator_v, bodyValidator, createUser);
  adminAuthRoute.post("/list", userListValidator_v, bodyValidator, listUser);
  adminAuthRoute.get("/:id", detailsUser);
  adminAuthRoute.delete("/:id", deleteUser);
  adminAuthRoute.put(
    "/update",
    userUpdateValidator_v,
    bodyValidator,
    updateUser
  );
});

adminAuthRoute.group("/group", (adminAuthRoute) => {
  adminAuthRoute.post("/", groupCreateValidator_v, bodyValidator, createGroup);
  adminAuthRoute.post("/list", groupListValidator_v, bodyValidator, listGroup);
  adminAuthRoute.get("/:id", detailsGroup);
  adminAuthRoute.delete("/:id", deleteGroup);
  adminAuthRoute.put(
    "/update",
    groupUpdateValidator_v,
    bodyValidator,
    updateGroup
  );
  adminAuthRoute.get("/refresh/:id", refreshGroup);

  // ********* Members *********

  adminAuthRoute.group("/member", (adminAuthRoute) => {
    adminAuthRoute.post(
      "/add",
      groupAddMemberValidator_v,
      bodyValidator,
      addMemberToGroup
    );
    adminAuthRoute.post(
      "/remove",
      groupAddMemberValidator_v,
      bodyValidator,
      removeMemberToGroup
    );
    adminAuthRoute.get("/:id", getMemberFromGroup);
    adminAuthRoute.post(
      "/not-in-group",
      userListValidator_v,
      bodyValidator,
      memberNotInGroup
    );
  });
});

adminAuthRoute.group("/schedule", (adminAuthRoute) => {
  adminAuthRoute.get("/", getSchedule);
  adminAuthRoute.put(
    "/update",
    updateScheduleValidator_v,
    bodyValidator,
    updateSchedule
  );

  adminAuthRoute.group("/perms", (adminAuthRoute) => {
    adminAuthRoute.post(
      "/add",
      updateSchedulePermsValidator_v,
      bodyValidator,
      addSchedulePerms
    );
    adminAuthRoute.post(
      "/get-user-with-perms",
      userListValidator_v,
      bodyValidator,
      getUserWithPerms
    );
    adminAuthRoute.get("/get/:userId", getSchedulePerms);
    adminAuthRoute.post(
      "/remove",
      removeSchedulePermsValidator_v,
      bodyValidator,
      removeSchedulePerms
    );
  });
});
