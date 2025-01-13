import { compareTime, currentDateTimeIndian } from "../utils/helper.js";
import QueryService from "./database/query.service.js";

class ScheduleService {
  #schedule;
  #schedulePerms;
  #user;
  constructor() {
    this.#user = new QueryService("user");
    this.#schedule = new QueryService("schedule");
    this.#schedulePerms = new QueryService("Special_Schedule_Permission");
  }

  async getSchedule() {
    let list = await this.#schedule.get({
      where: {},
      select: {
        id: true,
        day: true,
        name: true,
        off: true,
        startTime: true,
        endTime: true,
        updatedAt: true,
        updatedBy: {
          select: {
            id: true,
            uuid: true,
            name: true,
            email: true,
          },
        },
      },
    });
    return { status: true, msg: "Schedule fetched successfully!", data: list };
  }

  async updateSchedule({ id, startTime, endTime, off }) {
    let scheduleInfo = await this.#schedule.get({
      where: { id: id },
    });

    if (!scheduleInfo) {
      return {
        status: false,
        msg: "Invalid schedule id!",
      };
    }

    let timeStatus = compareTime(startTime, endTime);

    if (timeStatus !== "end") {
      return {
        status: false,
        msg: "End time should be greater than start time!",
      };
    }

    let newData = {
      startTime,
      endTime,
      off,
    };

    await this.#schedule.update({ id: id }, newData);

    return { status: true, msg: "Schedule updated successfully!" };
  }

  async addSchedulePerms({ apiUser, userId, expireDateTime }) {
    let userInfo = await this.#user.getDetails({
      where: { id: userId, isDeleted: false },
    });

    if (!userInfo) {
      return {
        status: false,
        msg: "Invalid user id!",
      };
    }

    const currentDateTime = currentDateTimeIndian(new Date());

    let existingPerms = await this.#schedulePerms.getDetails({
      where: { userId: userId, expireTime: { gt: currentDateTime } },
    });

    const usableExpireDateTime = new Date(expireDateTime + "Z").toISOString();

    if (existingPerms) {
      await this.#schedulePerms.update(
        { id: existingPerms.id },
        {
          expireTime: usableExpireDateTime,
          updatedById: apiUser.id,
          updatedAt: currentDateTime,
        }
      );
    } else {
      let newData = {
        // userId: userId,
        user: { connect: { id: userId } },
        expireTime: usableExpireDateTime,
        createdBy: { connect: { id: apiUser.id } },
        updatedBy: { connect: { id: apiUser.id } },
      };
      await this.#schedulePerms.create({ data: newData });
    }

    return { status: true, msg: "Schedule permission granted successfully!" };
  }

  async getSchedulePerms({ uuid }) {
    let userInfo = await this.#user.getDetails({
      where: { uuid: uuid, isDeleted: false },
    });

    if (!userInfo) {
      return {
        status: false,
        msg: "Invalid user id!",
      };
    }

    const currentDateTime = currentDateTimeIndian(new Date());

    const perms = await this.#schedulePerms.getDetails({
      where: { userId: userInfo.id, expireTime: { gt: currentDateTime } },
      select: {
        expireTime: true,
        createdAt: true,
        createdBy: {
          select: {
            id: true,
            uuid: true,
            name: true,
            email: true,
          },
        },
        updatedAt: true,
        updatedBy: {
          select: {
            id: true,
            uuid: true,
            name: true,
            email: true,
          },
        },
      },
    });

    if (perms) {
      return {
        status: true,
        msg: "Schedule permission fetched successfully!",
        data: perms,
      };
    }

    return {
      status: true,
      msg: "No permission allowed to this user!",
    };
  }

  async removeSchedulePerms({ userId }) {
    let userInfo = await this.#user.getDetails({
      where: { id: userId, isDeleted: false },
    });

    if (!userInfo) {
      return {
        status: false,
        msg: "Invalid user id!",
      };
    }

    const currentDateTime = currentDateTimeIndian(new Date());

    await this.#schedulePerms.deleteMany({
      where: { userId: userId, expireTime: { gt: currentDateTime } },
    });

    return { status: true, msg: "Schedule permission removed successfully!" };
  }
}

export default ScheduleService;
