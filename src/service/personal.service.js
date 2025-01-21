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

  async delete({ apiUser, msgId }) {
    let checkMsg = await this.#personalLogs.getDetails({
      where: {
        id: msgId,
      },
    });

    if (!checkMsg) {
      return {
        status: false,
        msg: "Invalid msgId",
      };
    }

    if (checkMsg?.fromId !== apiUser?.id) {
      return {
        status: false,
        msg: "Only the person who sent the message can delete it!",
      };
    }

    let updateStatus = await this.#personalLogs.update(
      { id: msgId },
      { isDeleted: true }
    );

    if (updateStatus) {
      return {
        status: true,
        msg: "Personal log deleted successfully",
      };
    } else {
      return { status: false, msg: "Personal log deletion failed" };
    }
  }

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

  // async getLogList({ apiUser, page, count, search, urlPrefix }) {
  //   let paginationObj = {};
  //   if (all !== true) {
  //     paginationObj.skip = (page - 1) * count;
  //     paginationObj.take = count;
  //   }
  //   let logs = await this.#connection.get({
  //     where: {
  //       status: { in: ["ACTIVE", "BLOCKED"] },
  //       OR: [
  //         {
  //           userId1: apiUser.id,
  //         },
  //         {
  //           userId2: apiUser.id,
  //         },
  //       ],
  //       user1: {
  //         isDeleted: false,
  //       },
  //       user2: {
  //         isDeleted: false,
  //       },
  //     },
  //     select: {
  //       id: true,
  //       status: true,
  //       user1: {
  //         select: {
  //           id: true,
  //           uuid: true,
  //           name: true,
  //           email: true,
  //           image: {
  //             select: {
  //               id: true,
  //               extension: true,
  //               path: true,
  //             },
  //           },
  //         },
  //       },
  //       user2: {
  //         select: {
  //           id: true,
  //           uuid: true,
  //           name: true,
  //           email: true,
  //           image: {
  //             select: {
  //               id: true,
  //               extension: true,
  //               path: true,
  //             },
  //           },
  //         },
  //       },
  //     },
  //     ...paginationObj,
  //   });

  //   logs = await Promise.all(
  //     logs.map(async (item) => {
  //       if (item.user1?.image) {
  //         item.user1.image.path = `${urlPrefix}${item.user1.image.path}`;
  //       }
  //       if (item.user2?.image) {
  //         item.user2.image.path = `${urlPrefix}${item.user2.image.path}`;
  //       }
  //       let lastLog = await this.#personalLogs.get({
  //         where: { connectionId: item.id, isDeleted: false },
  //         select: {
  //           id: true,
  //           content: true,
  //           type: true,
  //           msgType: true,
  //           seenAt: true,
  //           repliedToId: true,
  //         },
  //         orderBy: { createdAt: "desc" },
  //         take: 1,
  //       });

  //       let unseenMsgCount = await this.#personalLogs.count({
  //         where: {
  //           connectionId: item.id,
  //           toId: apiUser.id,
  //           seenAt: null,
  //           isDeleted: false,
  //         },
  //       });

  //       item.lastMessage = lastLog.length > 0 ? lastLog[0] : null;
  //       item.unseenMsg = unseenMsgCount;
  //       return item;
  //     })
  //   );

  //   let customLog = logs;

  //   for (let i = 0; i < customLog.length; i++) {
  //     for (let j = 0; j < customLog.length - i - 1; j++) {
  //       if (
  //         customLog[j].lastMessage?.createdAt <
  //         customLog[j + 1].lastMessage?.createdAt
  //       ) {
  //         let temp = customLog[j];
  //         customLog[j] = customLog[j + 1];
  //         customLog[j + 1] = temp;
  //       }
  //     }
  //   }

  //   const totalCount = await this.#connection.count({
  //     where: {
  //       status: { in: ["ACTIVE", "BLOCKED"] },
  //       OR: [
  //         {
  //           userId1: apiUser.id,
  //         },
  //         {
  //           userId2: apiUser.id,
  //         },
  //       ],
  //       user1: {
  //         isDeleted: false,
  //       },
  //       user2: {
  //         isDeleted: false,
  //       },
  //     },
  //   });

  //   return {
  //     status: true,
  //     msg: "Personal log created successfully",
  //     data: logs,
  //     count: totalCount,
  //   };
  // }

  async getLogList({ apiUser, urlPrefix}) {

    let rawQuery = `SELECT plog.content as lastMsg_Content,plog.type as lastMsg_Type, plog.msgType as lastMsg_msgType, plog.createdAt as lastMsg_createdAt,plog.seenAt as lastMsg_seenAt, plog.fromId as lastMsgFromId, con.id, con.status, usr.id as userId, usr.name as userName, usr.uuid as userUUID, usr.socketId as userSocketId, usr.email as userEmail, usr.isOnline as userIsOnline, usr.imageId as userImageId, CONCAT('${urlPrefix}', uploads.path) as finalPath, (SELECT CAST(COUNT(inPlog.id) as CHAR) FROM Personal_Logs inPlog WHERE inPlog.connectionId = con.id AND toId = ${apiUser.id} and inPlog.seenAt IS NULL) as unseenMsgCount FROM Connections con LEFT JOIN User usr ON usr.id = (CASE WHEN con.userId1 = ${apiUser.id} THEN con.userId2 ELSE con.userId1 END) LEFT JOIN Uploads uploads ON uploads.id = usr.imageId LEFT JOIN (SELECT pl1.connectionId, pl1.id, pl1.content, pl1.type, pl1.msgType, pl1.seenAt, pl1.fromId, pl1.toId, pl1.createdAt FROM Personal_Logs pl1 WHERE pl1.isDeleted = 0 AND pl1.id = (SELECT MAX(pl2.id) FROM Personal_Logs pl2 WHERE pl2.connectionId = pl1.connectionId AND pl2.isDeleted = 0)) plog ON plog.connectionId = con.id WHERE (con.userId1 = ${apiUser.id} OR con.userId2 = ${apiUser.id}) AND usr.isDeleted = 0 AND (con.status = 'ACTIVE' OR con.status = 'BLOCKED') ORDER BY plog.createdAt DESC`;

    let logs = await this.#connection.raw(rawQuery);
    
    return {
      status: true,
      msg: "Personal log fetched successfully",
      data: logs,
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
            socketId: true,
          },
        },
        to: {
          select: {
            id: true,
            uuid: true,
            name: true,
            email: true,
            socketId: true,
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
        connectionId:true
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
