import { actionContent } from "../utils/constants.js";
import {
  currentDateTimeIndian,
  generateRandomString,
} from "../utils/helper.js";
import QueryService from "./database/query.service.js";
import NotificationService from "./notification.service.js";

class GroupService {
  constructor() {
    this.user = new QueryService("user");
    this.group = new QueryService("group");
    this.groupMember = new QueryService("Group_Member");
    this.groupLog = new QueryService("Group_Logs");
    this.groupViewLog = new QueryService("Group_Logs_Views");
    this.notification = new NotificationService();
  }

  async create({ apiUser, name, description, isActive, code, icon }) {
    let newData = {
      description,
      isActive,
      createdById: apiUser.id,
      updatedById: apiUser.id,
    };

    if (icon) {
      newData.iconId = icon;
    }

    let nameCheck = await this.group.getDetails({
      where: { name, isDeleted: false },
    });

    if (nameCheck) {
      return { status: false, msg: "Group with this name already exists" };
    }
    newData.name = name;

    let codeStr = code ? code : generateRandomString(6);

    let codeCheck = await this.group.getDetails({
      where: { code: codeStr, isDeleted: false },
    });

    if (codeCheck) {
      return { status: false, msg: "Group with this code already exists" };
    }

    newData.code = codeStr;

    let insertStatus = await this.group.create({
      data: newData,
    });

    if (insertStatus) {
      return { status: true, msg: "Group created successfully" };
    } else {
      return { status: false, msg: "Group creation failed" };
    }
  }

  async list({ page, count, search, isActive, urlPrefix }) {
    let filter = {
      isDeleted: false,
      OR: [
        { name: { contains: search } },
        { code: { contains: search } },
        { description: { contains: search } },
      ],
    };

    if (isActive === true || isActive === false) {
      filter.isActive = isActive;
    }

    let groupList = await this.group.get({
      where: filter,
      select: {
        id: true,
        uuid: true,
        code: true,
        name: true,
        description: true,
        isActive: true,
        icon: {
          select: {
            id: true,
            extension: true,
            path: true,
          },
        },
        createdBy: {
          select: {
            id: true,
            uuid: true,
            name: true,
            email: true,
          },
        },
        updatedBy: {
          select: {
            id: true,
            uuid: true,
            name: true,
            email: true,
          },
        },
        createdAt: true,
        updatedAt: true,
      },
      orderBy: {
        createdAt: "desc",
      },
      skip: (page - 1) * count,
      take: count,
    });

    let totalCount = await this.group.count({
      where: filter,
    });

    groupList = groupList.map((item) => {
      if (item?.icon) {
        item.icon.path = `${urlPrefix}/${item.icon?.path}`;
      }
      return item;
    });

    return {
      status: true,
      msg: "Group list fetched successfully",
      data: groupList,
      count: totalCount,
    };
  }

  async details({ uuid, urlPrefix }) {
    let groupInfo = await this.group.getDetails({
      where: { uuid, isDeleted: false },
      select: {
        id: true,
        uuid: true,
        code: true,
        name: true,
        description: true,
        isActive: true,
        icon: {
          select: {
            id: true,
            extension: true,
            path: true,
          },
        },
        createdBy: {
          select: {
            id: true,
            uuid: true,
            name: true,
            email: true,
          },
        },
        updatedBy: {
          select: {
            id: true,
            uuid: true,
            name: true,
            email: true,
          },
        },
        createdAt: true,
        updatedAt: true,
      },
    });
    if (!groupInfo) {
      return {
        status: false,
        msg: "Invalid group id",
      };
    }

    if (groupInfo?.icon) {
      groupInfo.icon.path = `${urlPrefix}/${groupInfo.icon.path}`;
    }

    return {
      status: true,
      msg: "Group details fetched successfully",
      data: groupInfo,
    };
  }

  async update({ apiUser, uuid, name, description, isActive, code, icon }) {
    let userInfo = await this.group.getDetails({
      where: { uuid, isDeleted: false },
    });
    if (!userInfo) return { status: false, msg: "Invalid id" };

    let newData = {
      updatedById: apiUser.id,
    };

    if (name) {
      let nameInfo = await this.group.getDetails({
        where: { name, isDeleted: false, NOT: { uuid } },
      });

      if (nameInfo) {
        return { status: false, msg: "Group name already exists" };
      }
      newData.name = name;
    }

    if (icon) newData.iconId = icon;
    if (description) newData.description = description;
    if (isActive === true || isActive === false) newData.isActive = isActive;

    if (code) {
      let codeInfo = await this.group.getDetails({
        where: { code, isDeleted: false },
      });
      if (codeInfo) return { status: false, msg: "Code already exists." };
      newData.code = code;
    }

    let updateStatus = await this.group.update({ id: userInfo.id }, newData);

    return {
      status: true,
      msg: "Group updated successfully",
      data: updateStatus,
    };
  }

  async delete({ uuid }) {
    let groupInfo = await this.group.getDetails({
      where: {
        uuid: uuid,
        isDeleted: false,
      },
    });

    if (!groupInfo) {
      return {
        status: false,
        msg: "Invalid id",
      };
    }

    await this.group.update({ id: groupInfo.id }, { isDeleted: true });

    return {
      status: true,
      msg: "Group deleted successfully",
    };
  }

  async manageGroupLogSeen({ groupId, userId, unseen }) {
    let groupInfo = await this.group.getDetails({
      where: {
        id: groupId,
        isDeleted: false,
      },
    });

    if (!groupInfo) {
      return {
        status: false,
        msg: "Invalid group id",
      };
    }

    let groupMemberTableData = await this.groupMember.getDetails({
      where: { groupId, userId },
    });

    await this.groupMember.update({ id: groupMemberTableData.id }, { unseen });

    return {
      status: true,
      msg: "Unseen has been updated successfully",
    };
  }

  async getGroupUnseenLog({ groupId, userId }) {
    let groupInfo = await this.group.getDetails({
      where: {
        id: groupId,
        isDeleted: false,
      },
    });

    if (!groupInfo) {
      return {
        status: false,
        msg: "Invalid group id",
      };
    }

    let count = await this.groupMember.getDetails({
      where: { groupId, userId },
    });

    return {
      status: true,
      msg: "Group unseen logs fetched successfully",
      data: null,
      count: count ? count.unseen : 0,
    };
  }

  async addMembers({ apiUser, groupId, member }) {
    let groupInfo = await this.group.getDetails({
      where: {
        id: groupId,
        isDeleted: false,
      },
    });

    if (!groupInfo) {
      return {
        status: false,
        msg: "Invalid group id",
      };
    }

    let memberInfo = [];
    for (let mId of member) {
      let userData = await this.user.getDetails({
        where: { id: mId, isDeleted: false },
      });

      if (!userData) {
        continue;
      }
      let memberCheck = await this.groupMember.getDetails({
        where: {
          userId: mId,
          groupId: groupId,
        },
      });

      if (!memberCheck) {
        let statusCreate = await this.groupMember.create({
          data: {
            userId: mId,
            groupId: groupId,
            addedById: apiUser.id,
          },
        });

        if (statusCreate) {
          await this.groupLog.create({
            data: {
              groupId: groupId,
              fromId: apiUser.id,
              toId: mId,
              type: "ACTION",
              content: actionContent.addMember,
            },
          });
          await this.notification.createNotification({
            userId: mId,
            type: "GROUP",
            content: actionContent.notificationGroupAdd,
            groupAdderId: apiUser.id,
          });
          memberInfo.push(userData);
        }
      }
    }

    return {
      status: true,
      msg: "Member added in the group successfully",
      data: memberInfo,
    };
  }

  async removeMembers({ apiUser, groupId, member }) {
    let groupInfo = await this.group.getDetails({
      where: {
        id: groupId,
        isDeleted: false,
      },
    });

    if (!groupInfo) {
      return {
        status: false,
        msg: "Invalid group id",
      };
    }

    for (let mId of member) {
      let memberCheck = await this.groupMember.getDetails({
        where: {
          userId: Number(mId),
          groupId: Number(groupId),
        },
      });

      if (memberCheck) {
        await this.groupMember.delete({
          where: {
            id: memberCheck.id,
          },
        });
        await this.groupLog.create({
          data: {
            groupId: groupId,
            fromId: apiUser.id,
            toId: mId,
            type: "ACTION",
            content: actionContent.removeMember,
          },
        });
      }
    }

    return {
      status: true,
      msg: "Member removed from the group successfully",
    };
  }

  async removeMemberFromEvery({ apiUser, member }) {
    for (let mId of member) {
      let memberCheck = await this.groupMember.get({
        where: {
          userId: Number(mId),
        },
      });

      if (memberCheck.length > 0) {
        for (let i = 0; i < memberCheck.length; i++) {
          await this.groupMember.delete({
            where: {
              id: memberCheck[i].id,
            },
          });

          await this.groupLog.create({
            data: {
              groupId: memberCheck[i].groupId,
              fromId: apiUser.id,
              toId: memberCheck[i].userId,
              type: "ACTION",
              content: actionContent.removeMember,
            },
          });
        }
      }
    }

    return {
      status: true,
      msg: "Member removed from the group successfully",
    };
  }

  async getMembers({ groupId }) {
    let groupInfo = await this.group.getDetails({
      where: {
        uuid: groupId,
        isDeleted: false,
      },
    });

    if (!groupInfo) {
      return {
        status: false,
        msg: "Invalid group id",
      };
    }

    let memberData = await this.groupMember.get({
      where: { groupId: groupInfo.id, user: { isDeleted: false } },
      select: {
        id: true,
        user: {
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
        unseen: true,
        addedAt: true,
        addedBy: {
          select: {
            id: true,
            uuid: true,
            name: true,
            email: true,
          },
        },
      },
    });

    return {
      status: true,
      msg: "Members of the group fetched successfully",
      data: memberData,
    };
  }

  async listByUser({ apiUser, search, urlPrefix }) {
    let filter = {
      userId: apiUser.id,
      group: {
        name: {
          contains: search,
        },
      },
    };

    let groupList = await this.groupMember.get({
      where: filter,
      select: {
        group: {
          select: {
            id: true,
            uuid: true,
            code: true,
            name: true,
            isActive: true,
            icon: {
              select: {
                id: true,
                extension: true,
                path: true,
              },
            },
          },
        },
        unseen: true,
        addedAt: true,
        addedBy: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    });

    groupList = await Promise.all(
      groupList.map(async (item) => {
        let lastMsg = await this.groupLog.get({
          where: {
            groupId: item.group.id,
            isDeleted: false,
          },
          select: {
            id: true,
            from: {
              select: {
                name: true,
                email: true,
              },
            },
            to: {
              select: {
                name: true,
                email: true,
              },
            },
            content: true,
            type: true,
            msgType: true,
            createdAt: true,
          },
          orderBy: {
            createdAt: "desc",
          },
          take: 1,
        });

        item.lastMessage = null;
        if (lastMsg && lastMsg.length > 0) {
          item.lastMessage = lastMsg[0];
        }

        if (item?.group?.icon) {
          item.group.icon.path = `${urlPrefix}${item.group.icon.path}`;
        }
        return item;
      })
    );

    let groupData = groupList;

    for (let i = 0; i < groupData.length; i++) {
      for (let j = 0; j < groupData.length - i - 1; j++) {
        if (
          groupData[j].lastMessage?.createdAt <
          groupData[j + 1].lastMessage?.createdAt
        ) {
          let temp = groupData[j];
          groupData[j] = groupData[j + 1];
          groupData[j + 1] = temp;
        }
      }
    }

    return {
      status: true,
      msg: "Group list fetched successfully",
      data: groupData,
    };
  }

  async getLogs({ apiUser, groupId, page, count, all }) {
    const filter = {
      groupId: groupId,
      isDeleted: false,
    };
    let query = {
      where: filter,
      select: {
        id: true,
        from: {
          select: {
            id: true,
            uuid: true,
            name: true,
            email: true,
            socketId: true,
            role: {
              select: {
                strongId: true,
                name: true,
              },
            },
            image: {
              select: {
                id: true,
                extension: true,
                path: true,
              },
            },
          },
        },
        to: {
          select: {
            id: true,
            uuid: true,
            name: true,
            email: true,
            socketId: true,
            role: {
              select: {
                strongId: true,
                name: true,
              },
            },
            image: {
              select: {
                id: true,
                extension: true,
                path: true,
              },
            },
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
      },
      orderBy: {
        createdAt: "asc",
      },
    };

    let queryWithPage = { ...query };
    if (!all) {
      queryWithPage.skip = (page - 1) * count;
      queryWithPage.take = count;
    }

    let logs = await this.groupLog.get(queryWithPage);
    let totalLogsCount = await this.groupLog.count({ where: filter });

    if (apiUser) {
      let lastSeenLog = await this.groupViewLog.get({
        where: { userId: apiUser.id, groupId },
        orderBy: {
          id: "desc",
        },
        take: 1,
      });

      if (lastSeenLog.length > 0) {
        let allLogs = await this.groupLog.get({
          where: {
            groupId,
            isDeleted: false,
            id: {
              gt: lastSeenLog[0].logId,
            },
          },
          select: {
            id: true,
          },
        });

        if (allLogs.length > 0) {
          const newViewsData = allLogs.map((item) => {
            return {
              logId: item.id,
              groupId: groupId,
              userId: apiUser.id,
              viewAt: currentDateTimeIndian(new Date()),
            };
          });

          await this.groupViewLog.createMany({ data: newViewsData });
        }
      } else {
        let allLogs = await this.groupLog.get({
          where: { groupId, isDeleted: false },
          select: {
            id: true,
          },
        });

        const newViewsData = allLogs.map((item) => {
          return {
            logId: item.id,
            groupId: groupId,
            userId: apiUser.id,
            viewAt: currentDateTimeIndian(new Date()),
          };
        });

        await this.groupViewLog.createMany({ data: newViewsData });
      }

      this.manageGroupLogSeen({ groupId, userId: apiUser.id, unseen: 0 }).catch(
        (error) => {
          console.log("Error updating unseen status:", error);
        }
      );
    }

    return {
      status: true,
      msg: "Group logs fetched successfully",
      data: logs,
      totalCount: totalLogsCount,
    };
  }

  async getLogDetails({ logId }) {
    const filter = {
      id: logId,
      isDeleted: false,
    };

    let query = {
      where: filter,
      select: {
        id: true,
        group: {
          select: {
            id: true,
            name: true,
            isActive: true,
          },
        },
        from: {
          select: {
            id: true,
            uuid: true,
            name: true,
            email: true,
            role: {
              select: {
                strongId: true,
                name: true,
              },
            },
          },
        },
        to: {
          select: {
            id: true,
            uuid: true,
            name: true,
            email: true,
            role: {
              select: {
                strongId: true,
                name: true,
              },
            },
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
      },
    };

    let logDetails = await this.groupLog.getDetails(query);
    if (logDetails) {
      logDetails.seenBy = await this.groupViewLog.get({
        where: { logId },
        select: {
          user: {
            select: {
              id: true,
              uuid: true,
              name: true,
              email: true,
              role: {
                select: {
                  id: true,
                  name: true,
                },
              },
              image: {
                select: {
                  id: true,
                  extension: true,
                  path: true,
                },
              },
            },
          },
          viewAt: true,
        },
      });
    }

    return {
      status: true,
      msg: "Log details fetched successfully",
      data: logDetails,
    };
  }

  async setLogs({
    fromId,
    toId,
    groupId,
    repliedToId,
    content,
    type,
    msgType,
    file,
    fileUrlPrefix,
  }) {
    if (!groupId) {
      return {
        status: false,
        msg: "Invalid group id",
      };
    }
    let groupInfo = await this.group.getDetails({
      where: {
        id: groupId,
        isDeleted: false,
      },
    });

    if (!groupInfo) {
      return {
        status: false,
        msg: "Invalid group id",
      };
    }

    if (!fromId) {
      return {
        status: false,
        msg: "Invalid fromId",
      };
    }
    let fromInfo = await this.groupMember.getDetails({
      where: {
        groupId: groupId,
        userId: fromId,
      },
    });

    if (!fromInfo) {
      return {
        status: false,
        msg: "Invalid fromId",
      };
    }

    if (type !== "MESSAGE" && type !== "ACTION") {
      return {
        status: false,
        msg: "type value can be either MESSAGE or ACTION",
      };
    }

    const stringifyContent = JSON.stringify(content);

    if (!stringifyContent) {
      return {
        status: false,
        msg: "No content provided",
      };
    }

    const newData = {
      groupId,
      fromId,
      content,
      type,
    };

    if (msgType && (msgType === "TEXT" || msgType === "FILE")) {
      newData.msgType = msgType;
    }

    if (file && "msgType" in newData && newData.msgType === "FILE") {
      newData.fileId = file;
    }

    if (toId) {
      let toInfo = await this.groupMember.getDetails({
        where: {
          groupId: groupId,
          userId: fromId,
        },
      });

      if (!toInfo) {
        return {
          status: false,
          msg: "Invalid toId",
        };
      }

      newData.toId = toId;
    }

    if (repliedToId) {
      let repliedMsgInfo = await this.groupLog.getDetails({
        where: {
          id: repliedToId,
        },
      });

      if (repliedMsgInfo) {
        newData.repliedToId = repliedToId;
      }
    }

    let newEntry = await this.groupLog.create({
      data: newData,
      select: {
        id: true,
        group: {
          select: {
            id: true,
            uuid: true,
            code: true,
            name: true,
            isActive: true,
          },
        },
        from: {
          select: {
            id: true,
            uuid: true,
            name: true,
            email: true,
            role: {
              select: {
                id: true,
                strongId: true,
                name: true,
              },
            },
          },
        },
        to: {
          select: {
            id: true,
            uuid: true,
            name: true,
            email: true,
            role: {
              select: {
                id: true,
                strongId: true,
                name: true,
              },
            },
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
      },
    });

    const urlPrefix = fileUrlPrefix || "";
    if (newEntry?.file) {
      newEntry.file = urlPrefix + newEntry.file.path;
    }

    return {
      status: true,
      msg: "Group logs set successfully",
      data: newEntry,
    };
  }

  async deleteLogs({ apiUser, msgId, groupId }) {
    let groupInfo = await this.group.getDetails({
      where: {
        id: groupId,
        isDeleted: false,
      },
    });

    if (!groupInfo) {
      return {
        status: false,
        msg: "Invalid group id",
      };
    }

    let fromInfo = await this.groupMember.getDetails({
      where: {
        groupId: groupId,
        userId: apiUser.id,
      },
    });

    if (!fromInfo) {
      return {
        status: false,
        msg: "Invalid user trying to remove log",
      };
    }

    let msgInfo = await this.groupLog.getDetails({
      where: {
        id: msgId,
        groupId: groupId,
        fromId: apiUser.id,
        isDeleted: false,
      },
    });

    if (!msgInfo) {
      return {
        status: false,
        msg: "Invalid message!",
      };
    }

    await this.groupLog.update(
      {
        id: msgId,
      },
      {
        isDeleted: true,
      }
    );

    return {
      status: true,
      msg: "Group log removed successfully",
    };
  }

  async getLogDetail({ id }) {
    const filter = {
      id,
    };
    let query = {
      where: filter,
      select: {
        id: true,
        group: {
          select: {
            id: true,
            uuid: true,
            code: true,
            name: true,
          },
        },
        from: {
          select: {
            id: true,
            uuid: true,
            name: true,
            email: true,
            role: {
              select: {
                strongId: true,
                name: true,
              },
            },
          },
        },
        to: {
          select: {
            id: true,
            uuid: true,
            name: true,
            email: true,
            role: {
              select: {
                strongId: true,
                name: true,
              },
            },
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
        isDeleted: true,
        createdAt: true,
      },
    };

    let logs = await this.groupLog.getDetails(query);

    return {
      status: true,
      msg: "Group log details fetched successfully",
      data: logs,
    };
  }
}

export default GroupService;
