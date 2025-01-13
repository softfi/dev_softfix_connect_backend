import { currentDateTimeIndian } from "../utils/helper.js";
import BlockService from "./block.service.js";
import QueryService from "./database/query.service.js";

const blockInstance = new BlockService();

class PersonalService {
  #personalLogs;
  #connection;
  #user;
  #uploads;
  constructor() {
    this.#personalLogs = new QueryService("Personal_Logs");
    this.#connection = new QueryService("Connections");
    this.#user = new QueryService("user");
    this.#uploads = new QueryService("Uploads");
  }

  async create({
    connectionId,
    fromId,
    toId,
    repliedToId,
    content,
    type,
    msgType,
    file,
    fileUrlPrefix,
  }) {
    if (!fromId) {
      return {
        status: false,
        msg: "Invalid fromId",
      };
    }

    let fromInfo = await this.#user.getDetails({
      where: {
        id: fromId,
      },
    });

    if (!fromInfo) {
      return {
        status: false,
        msg: "Invalid fromId",
      };
    }

    if (!toId) {
      return {
        status: false,
        msg: "Invalid toId",
      };
    }
    let toInfo = await this.#user.getDetails({
      where: {
        id: toId,
        isDeleted: false,
      },
    });
    if (!toInfo) {
      return {
        status: false,
        msg: "Invalid toId",
      };
    }

    if (type !== "MESSAGE" && type !== "ACTION") {
      return {
        status: false,
        msg: "type value can be either MESSAGE or ACTION",
      };
    }

    if (type === "MESSAGE") {
      let checkBlock = blockInstance.details({ userId: toId, blockId: fromId });
      if (checkBlock.data) {
        return {
          status: false,
          msg: "Cannot send message, this user has blocked you",
        };
      }
    }

    const stringifyContent = JSON.stringify(content);

    let newData = {
      connectionId,
      fromId,
      toId,
      // content: stringifyContent,
      content: content,
      type,
      createdAt: currentDateTimeIndian(new Date()),
    };

    if (repliedToId) {
      let repliedMsgInfo = await this.#personalLogs.getDetails({
        where: {
          isDeleted: false,
          id: repliedToId,
        },
      });

      if (
        (repliedMsgInfo &&
          repliedMsgInfo.fromId === fromId &&
          repliedMsgInfo.toId === toId) ||
        (repliedMsgInfo.toId === fromId && repliedMsgInfo.fromId === toId)
      ) {
        newData.repliedToId = repliedToId;
      }
    }

    if (msgType && (msgType === "TEXT" || msgType === "FILE")) {
      newData.msgType = msgType;
    }

    if (file && "msgType" in newData && newData.msgType === "FILE") {
      newData.fileId = file;
    }

    let insertStatus = await this.#personalLogs.create({
      data: newData,
      select: {
        id: true,
        connectionId: true,
        from: {
          select: {
            id: true,
            uuid: true,
            name: true,
            email: true,
          },
        },
        to: {
          select: {
            id: true,
            uuid: true,
            name: true,
            email: true,
          },
        },
        repliedTo: {
          select: {
            from: {
              select: {
                id: true,
                uuid: true,
                name: true,
                email: true,
              },
            },
            content: true,
            type: true,
            msgType: true,
            createdAt: true,
          },
        },
        file: {
          select: {
            id: true,
            extension: true,
            path: true,
          },
        },
        content: true,
        type: true,
        msgType: true,
        isEdited: true,
        createdAt: true,
        editedAt: true,
        seenAt: true,
      },
    });

    if (insertStatus) {
      const urlPrefix = fileUrlPrefix || "";
      if (insertStatus?.file) {
        insertStatus.file = urlPrefix + insertStatus.file.path;
      }

      return {
        status: true,
        msg: "Personal log created successfully",
        data: insertStatus,
      };
    } else {
      return { status: false, msg: "Personal log creation failed" };
    }
  }

  async update({ logId, isSeen }) {
    let newData = {};

    if (isSeen) {
      newData.seenAt = isSeen;
    }

    if (!logId) {
      return {
        status: false,
        msg: "Invalid logId!",
      };
    }

    let updateStatus = await this.#personalLogs.update({ id: logId }, newData);

    if (updateStatus) {
      return {
        status: true,
        msg: "Personal log updated successfully",
      };
    } else {
      return { status: false, msg: "Personal log updation failed" };
    }
  }

  // async getLogList({ apiUser, page, count, search, urlPrefix }) {
  //   const rawQuery = `SELECT PL.id, PL.fromId, PL.toId, PL.content, PL.type, PL.msgType, PL.createdAt, PL.seenAt, PL.connectionId, UF.uuid as fromUUID, UF.name as fromName, UF.email as fromEmail, UF.imageId as fromImageId, UT.uuid as toUUID, UT.name as toName, UT.email as toEmail,UT.imageId as toImageId FROM Personal_Logs PL LEFT JOIN User UF ON UF.id = PL.fromId LEFT JOIN User UT ON UT.id = PL.toId WHERE PL.isDeleted = 0 AND UF.isDeleted = 0 AND UT.isDeleted = 0 AND UF.id = ${
  //     apiUser.id
  //   } OR UT.id = ${
  //     apiUser.id
  //   } GROUP BY PL.connectionId ORDER BY PL.createdAt DESC LIMIT ${count} OFFSET ${
  //     (page - 1) * count
  //   }`;
  //   let logs = await this.#personalLogs.raw(rawQuery);

  //   const rawQueryCount = `SELECT COUNT(DISTINCT PL.connectionId) as count FROM Personal_Logs PL LEFT JOIN User UF ON UF.id = PL.fromId LEFT JOIN User UT ON UT.id = PL.toId WHERE PL.isDeleted = 0 AND UF.id = ${apiUser.id} OR UT.id = ${apiUser.id}`;
  //   const totalCount = parseInt(
  //     (await this.#personalLogs.raw(rawQueryCount))[0]?.count
  //   );

  //   logs = await Promise.all(
  //     logs.map(async (item) => {
  //       item.fromProfileImage = null;
  //       item.toProfileImage = null;

  //       if (item.fromImageId) {
  //         let file = await this.#uploads.getDetails({
  //           where: { id: item.fromImageId },
  //         });
  //         item.fromProfileImage = `${urlPrefix}${file?.path}`;
  //       }

  //       if (item.toImageId) {
  //         let file = await this.#uploads.getDetails({
  //           where: { id: item.toImageId },
  //         });
  //         item.toProfileImage = `${urlPrefix}${file?.path}`;;
  //       }
  //       return item;
  //     })
  //   );

  //   return {
  //     status: true,
  //     msg: "Personal log created successfully",
  //     data: logs,
  //     count: totalCount,
  //   };
  // }

  // async getUnseenLogList({ connectionId, userId }) {
  //   // let logs = await this.#connection.get({
  //   //   where: {
  //   //     status: { in: ["ACTIVE", "BLOCKED"] },
  //   //     OR: [
  //   //       {
  //   //         userId1: apiUser.id,
  //   //       },
  //   //       {
  //   //         userId2: apiUser.id,
  //   //       },
  //   //     ],
  //   //     user1: {
  //   //       isDeleted: false,
  //   //     },
  //   //     user2: {
  //   //       isDeleted: false,
  //   //     },
  //   //   },
  //   //   select: {
  //   //     id: true,
  //   //     status: true,
  //   //     user1: {
  //   //       select: {
  //   //         id: true,
  //   //         uuid: true,
  //   //         name: true,
  //   //         email: true,
  //   //         image: {
  //   //           select: {
  //   //             id: true,
  //   //             extension: true,
  //   //             path: true,
  //   //           },
  //   //         },
  //   //       },
  //   //     },
  //   //     user2: {
  //   //       select: {
  //   //         id: true,
  //   //         uuid: true,
  //   //         name: true,
  //   //         email: true,
  //   //         image: {
  //   //           select: {
  //   //             id: true,
  //   //             extension: true,
  //   //             path: true,
  //   //           },
  //   //         },
  //   //       },
  //   //     },
  //   //   },
  //   // });

  //   if (!connectionId) {
  //     return {
  //       status: false,
  //       msg: "Invalid connection id!",
  //     };
  //   }

  //   if (!userId) {
  //     return {
  //       status: false,
  //       msg: "Invalid userId!",
  //     };
  //   }

  //   const totalCount = await this.#personalLogs.count({
  //     where: {
  //       connectionId: connectionId,
  //       seenAt: null,
  //       toId: userId,
  //     },
  //   });

  //   return {
  //     status: true,
  //     msg: "Personal log created successfully",
  //     // data: logs,
  //     count: totalCount,
  //   };
  // }

  async getLogList({ apiUser, page, count, search, urlPrefix }) {
    let logs = await this.#connection.get({
      where: {
        status: { in: ["ACTIVE", "BLOCKED"] },
        OR: [
          {
            userId1: apiUser.id,
          },
          {
            userId2: apiUser.id,
          },
        ],
        user1: {
          isDeleted: false,
        },
        user2: {
          isDeleted: false,
        },
      },
      select: {
        id: true,
        status: true,
        user1: {
          select: {
            id: true,
            uuid: true,
            name: true,
            email: true,
            image: {
              select: {
                id: true,
                extension: true,
                path: true,
              },
            },
          },
        },
        user2: {
          select: {
            id: true,
            uuid: true,
            name: true,
            email: true,
            image: {
              select: {
                id: true,
                extension: true,
                path: true,
              },
            },
          },
        },
      },
      skip: (page - 1) * count,
      take: count,
    });

    logs = await Promise.all(
      logs.map(async (item) => {
        if (item.user1?.image) {
          item.user1.image.path = `${urlPrefix}${item.user1.image.path}`;
        }
        if (item.user2?.image) {
          item.user2.image.path = `${urlPrefix}${item.user2.image.path}`;
        }
        let lastLog = await this.#personalLogs.get({
          where: { connectionId: item.id, isDeleted: false },
          select: {
            id: true,
            content: true,
            type: true,
            msgType: true,
            seenAt: true,
            repliedToId: true,
          },
          orderBy: { createdAt: "desc" },
          take: 1,
        });

        let unseenMsgCount = await this.#personalLogs.count({
          where: {
            connectionId: item.id,
            toId: apiUser.id,
            seenAt: null,
            isDeleted: false,
          },
        });

        item.lastMessage = lastLog.length > 0 ? lastLog[0] : null;
        item.unseenMsg = unseenMsgCount;
        return item;
      })
    );

    let customLog = logs;

    for (let i = 0; i < customLog.length; i++) {
      for (let j = 0; j < customLog.length - i - 1; j++) {
        if (
          customLog[j].lastMessage?.createdAt <
          customLog[j + 1].lastMessage?.createdAt
        ) {
          let temp = customLog[j];
          customLog[j] = customLog[j + 1];
          customLog[j + 1] = temp;
        }
      }
    }

    const totalCount = await this.#connection.count({
      where: {
        status: { in: ["ACTIVE", "BLOCKED"] },
        OR: [
          {
            userId1: apiUser.id,
          },
          {
            userId2: apiUser.id,
          },
        ],
        user1: {
          isDeleted: false,
        },
        user2: {
          isDeleted: false,
        },
      },
    });

    return {
      status: true,
      msg: "Personal log created successfully",
      data: logs,
      count: totalCount,
    };
  }

  async getLogDetails({
    connectionId,
    apiUser,
    page,
    count,
    search,
    markSeen,
  }) {
    let connectionInfo = await this.#connection.getDetails({
      where: {
        id: connectionId,
      },
      select: {
        id: true,
        user1: {
          select: {
            id: true,
            uuid: true,
            name: true,
            email: true,
            image: {
              select: {
                id: true,
                extension: true,
                path: true,
              },
            },
          },
        },
        user2: {
          select: {
            id: true,
            uuid: true,
            name: true,
            email: true,
            image: {
              select: {
                id: true,
                extension: true,
                path: true,
              },
            },
          },
        },
        status: true,
        sentAt: true,
      },
    });

    if (!connectionInfo) {
      return {
        status: false,
        msg: "Invalid connection id!",
      };
    }

    let logs = await this.#personalLogs.get({
      where: {
        isDeleted: false,
        connectionId: connectionInfo.id,
      },
      select: {
        id: true,
        from: {
          select: {
            id: true,
            uuid: true,
            name: true,
            email: true,
          },
        },
        to: {
          select: {
            id: true,
            uuid: true,
            name: true,
            email: true,
          },
        },
        repliedTo: {
          select: {
            id: true,
            from: {
              select: {
                id: true,
                uuid: true,
                name: true,
                email: true,
              },
            },
            content: true,
            type: true,
            msgType: true,
            file: {
              select: {
                id: true,
                extension: true,
                path: true,
              },
            },
            createdAt: true,
          },
        },
        content: true,
        type: true,
        msgType: true,
        file: {
          select: {
            id: true,
            extension: true,
            path: true,
          },
        },
        isEdited: true,
        createdAt: true,
        editedAt: true,
        seenAt: true,
      },
      orderBy: {
        createdAt: "asc",
      },
      skip: (page - 1) * count,
      take: count,
    });

    let totalCount = await this.#personalLogs.count({
      where: {
        isDeleted: false,
        connectionId: connectionInfo.id,
      },
    });

    if (markSeen === true) {
      await this.#personalLogs.updateMany(
        {
          connectionId: connectionId,
          toId: apiUser.id,
          isDeleted: false,
          seenAt: null,
        },
        {
          seenAt: currentDateTimeIndian(new Date()),
        }
      );
    }

    return {
      status: true,
      msg: "Personal log created successfully",
      data: logs,
      count: totalCount,
    };
  }

  async getSingleLogDetail({ logId }) {
    if (!logId) {
      return {
        status: false,
        msg: "Invalid logId",
      };
    }

    let logs = await this.#personalLogs.getDetails({
      where: {
        id: logId,
        isDeleted: false,
      },
      select: {
        id: true,
        from: {
          select: {
            id: true,
            uuid: true,
            name: true,
            email: true,
          },
        },
        to: {
          select: {
            id: true,
            uuid: true,
            name: true,
            email: true,
          },
        },
        repliedTo: {
          select: {
            id: true,
            from: {
              select: {
                id: true,
                uuid: true,
                name: true,
                email: true,
              },
            },
            content: true,
            type: true,
            msgType: true,
            file: {
              select: {
                id: true,
                extension: true,
                path: true,
              },
            },
            createdAt: true,
          },
        },
        content: true,
        type: true,
        msgType: true,
        file: {
          select: {
            id: true,
            extension: true,
            path: true,
          },
        },
        isEdited: true,
        createdAt: true,
        editedAt: true,
        seenAt: true,
      },
    });

    return {
      status: true,
      msg: "Single log details successfully",
      data: logs,
    };
  }
}

export default PersonalService;
