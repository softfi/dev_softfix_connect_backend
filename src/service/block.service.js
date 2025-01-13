import { currentDateTimeIndian } from "../utils/helper.js";
import QueryService from "./database/query.service.js";

class BlockService {
  #blockLogs;
  #user;
  constructor() {
    this.#blockLogs = new QueryService("Block_Logs");
    this.#user = new QueryService("user");
  }

  async create({ userId, blockId }) {
    let userInfo = await this.#user.getDetails({
      where: {
        id: userId,
        isDeleted: false,
      },
    });
    if (!userInfo) {
      return {
        status: false,
        msg: "Invalid userInfo",
      };
    }

    let blockInfo = await this.#user.getDetails({
      where: {
        id: blockId,
        isDeleted: false,
      },
    });
    if (blockInfo) {
      return {
        status: false,
        msg: "Invalid blockId",
      };
    }

    let checkBlockLog = await this.#blockLogs.getDetails({
      where: { userId, blockId },
    });

    if (!checkBlockLog) {
      return { status: false, msg: "User is already blocked" };
    }

    let newData = {
      userId,
      blockId,
      blockedAt: currentDateTimeIndian(new Date()),
    };

    let insertStatus = await this.#blockLogs.create({
      data: newData,
    });

    if (insertStatus) {
      return { status: true, msg: "User blocked successfully" };
    } else {
      return { status: false, msg: "Fail to block the user" };
    }
  }

  async details({ userId, blockId }) {
    let userInfo = await this.#user.getDetails({
      where: {
        id: userId,
        isDeleted: false,
      },
    });
    if (!userInfo) {
      return {
        status: false,
        msg: "Invalid userInfo",
      };
    }

    let blockInfo = await this.#user.getDetails({
      where: {
        id: blockId,
        isDeleted: false,
      },
    });
    if (!blockInfo) {
      return {
        status: false,
        msg: "Invalid blockId",
      };
    }

    let checkBlockLog = await this.#blockLogs.getDetails({
      where: { userId, blockId },
    });

    if (checkBlockLog) {
      return { status: true, msg: "User is blocked", data: true };
    }

    return { status: true, msg: "User is not blocked", data: false };
  }
}

export default BlockService;
