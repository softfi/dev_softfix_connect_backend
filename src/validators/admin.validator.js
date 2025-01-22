import { body } from "express-validator";
import { rgx__yyyy_mm_dd_t_hh_mm, rgx_hh_mm } from "../utils/regex.js";
import { notificationType } from "../utils/constants.js";

export const listValidator_v = [
  body("page").optional(),
  body("count").optional(),
  body("search").optional(),
];

export const loginValidator_v = [
  body("username").notEmpty().withMessage("username field is required"),
  body("password").notEmpty().withMessage("password field is required"),
];

export const userCreateValidator_v = [
  body("name").optional(),
  body("email")
    .notEmpty()
    .withMessage("email field is required")
    .isEmail()
    .withMessage("invalid email format"),
  body("password").optional(),
  body("role").notEmpty().withMessage("role field is required"),
  body("profile").optional(),
];

export const userListValidator_v = [
  ...listValidator_v,
  body("groupId").optional(),
  body("isActive").optional(),
];

export const passwordChangeValidator_v = [
  body("oldPass").notEmpty().withMessage("oldPass field is required"),
  body("newPass").notEmpty().withMessage("newPass field is required"),
];

export const userUpdateValidator_v = [
  body("id").notEmpty().withMessage("id field is required"),
  body("name").optional(),
  body("email").optional().isEmail().withMessage("invalid email format"),
  body("password").optional(),
  body("role").optional(),
  body("isActive").optional(),
  body("profile").optional(),
  body("profileImageStatus")
    .notEmpty()
    .withMessage("profileImageStatus field is required")
    .isBoolean()
    .withMessage("profileImageStatus value should be boolean type"),
];

export const groupCreateValidator_v = [
  body("name").notEmpty().withMessage("name value is required"),
  body("description").notEmpty().withMessage("description field is required"),
  body("isActive")
    .notEmpty()
    .isBoolean()
    .withMessage("isActive field value should be in boolean format"),
  body("code").optional(),
  body("icon").optional(),
];

export const groupListValidator_v = [
  ...listValidator_v,
  body("isActive")
    .optional()
    .isBoolean()
    .withMessage("isActive value should be a boolean type"),
  body("maxUser")
    .optional()
    .isInt({ min: 2 })
    .withMessage("maxUser value should be minimum 2"),
];

export const groupUpdateValidator_v = [
  body("id").notEmpty().withMessage("id field is required"),
  body("name").optional(),
  body("description").optional(),
  body("isActive")
    .optional()
    .isBoolean()
    .withMessage("isActive field value should be in boolean format"),
  body("code").optional(),
  body("icon").optional(),
  body("iconImageStatus")
  .notEmpty()
  .withMessage("iconImageStatus field is required")
  .isBoolean()
  .withMessage("iconImageStatus value should be boolean type"),
];

export const groupAddMemberValidator_v = [
  body("groupId").notEmpty().withMessage("groupId value is required"),
  body("memberId")
    .notEmpty()
    .withMessage("memberId field is required")
    .isArray({ min: 1 })
    .withMessage("memberId value should be an array"),
];

export const activityLogValidator_v = [
  body("groupId").notEmpty().withMessage("groupId field is required"),
  body("page")
    .optional()
    .isInt({ min: 1 })
    .withMessage("page field value should be an positive integer"),
  body("count")
    .optional()
    .isInt({ min: 1 })
    .withMessage("count field value should be an positive integer"),
  body("all")
    .optional()
    .isBoolean()
    .withMessage("all field value should be a boolean"),
];

export const updateScheduleValidator_v = [
  body("id").notEmpty().withMessage("id field is required"),
  body("off")
    .optional()
    .isBoolean()
    .withMessage("off field should be a boolean value"),
  body("startTime")
    .notEmpty()
    .withMessage("startTime field is required")
    .custom((startTime) => {
      if (rgx_hh_mm.test(startTime)) {
        return true;
      }
      throw new Error(
        'Invalid startTime format "HH:MM" format is allowed only!'
      );
    }),
  body("endTime")
    .notEmpty()
    .withMessage("endTime field is required")
    .custom((endTime) => {
      if (rgx_hh_mm.test(endTime)) {
        return true;
      }
      throw new Error('Invalid endTime format "HH:MM" format is allowed only!');
    }),
];

export const updateSchedulePermsValidator_v = [
  body("userId").notEmpty().withMessage("userId field is required"),
  body("expireDateTime")
    .notEmpty()
    .withMessage("expireDateTime field is required")
    .custom((expireDateTime) => {
      if (rgx__yyyy_mm_dd_t_hh_mm.test(expireDateTime)) {
        return true;
      }
      throw new Error(
        'Invalid expireDateTime format "YYYY-MM-DDTHH:mm" format is allowed only!'
      );
    }),
];

export const removeSchedulePermsValidator_v = [
  body("userId").notEmpty().withMessage("userId field is required"),
];

export const actionConnectionRequestValidator_v = [
  body("user").notEmpty().withMessage("user field is required"),
  body("action")
    .notEmpty()
    .withMessage("action field is required")
    .isIn(["ACCEPT", "REJECT"])
    .withMessage("action field value should be either 'ACCEPT' or 'REJECT'"),
];

export const personalLogValidator_v = [
  body("connectionId").notEmpty().withMessage("connectionId field is required"),
  body("page")
    .optional()
    .isInt({ min: 1 })
    .withMessage("page field value should be an positive integer"),
  body("count")
    .optional()
    .isInt({ min: 1 })
    .withMessage("count field value should be an positive integer"),
  body("all")
    .optional()
    .isBoolean()
    .withMessage("all field value should be a boolean"),
  body("markSeen")
    .optional()
    .isBoolean()
    .withMessage("markSeen field value should be a boolean"),
];

export const userRegisterValidator_v = [
  body("name").notEmpty().withMessage("name field is required"),
  body("email")
    .notEmpty()
    .withMessage("email field is required")
    .isEmail()
    .withMessage("invalid email format"),
  body("password")
    .notEmpty()
    .withMessage("password field is required")
    .isLength({ min: 4 })
    .withMessage("password should have atleast 4 characters"),
  body("profile").optional(),
];

export const editProfileValidator_v = [
  body("name").optional(),
  body("image").optional(),
];

export const notificationListValidator_v = [
  ...listValidator_v,
  body("isSeen")
    .optional()
    .isBoolean()
    .withMessage("isSeen field should be a boolean value"),
  body("type")
    .optional()
    .isIn(notificationType)
    .withMessage(
      `type value should be one of these ${notificationType.join(",")}`
    ),
  body("markSeen")
    .optional()
    .isBoolean()
    .withMessage("markSeen field should be a boolean value"),
];
