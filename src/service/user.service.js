import { generateRandomString, hashPassword } from "../utils/helper.js";
import QueryService from "./database/query.service.js";
import GroupService from "./group.service.js";

const GroupInstance = new GroupService();

class UserService {
  #user;
  #connection;
  constructor() {
    this.#user = new QueryService("user");
    this.#connection = new QueryService("Connections");
  }

  async create({ name, email, password, role, profile }) {
    let emailInfo = await this.#user.getDetails({
      where: { email, isDeleted: false },
    });

    if (emailInfo) {
      return { status: false, msg: "Email already exists" };
    }

    const generatedPassword = generateRandomString(10);
    let newData = {
      email,
      roleId: role,
      password: password
        ? await hashPassword(password)
        : await hashPassword(generatedPassword),
    };

    let lastEntry = await this.#user.get({ take: 1, orderBy: { id: "desc" } });
    newData.name = name ? name : `Admin#${++lastEntry[0].id}`;

    if (profile) {
      newData.imageId = profile;
    }

    let insertStatus = await this.#user.create({
      data: newData,
    });

    if (insertStatus) {
      return { status: true, msg: "User created successfully" };
    } else {
      return { status: false, msg: "Failed to create user" };
    }
  }

  async list({ page, count, search, role, urlPrefix, orderBy, isActive }) {
    let filter = {
      isDeleted: false,
      OR: [{ name: { contains: search } }, { email: { contains: search } }],
    };

    if (isActive === true || isActive === false) {
      filter.isActive = isActive;
    }

    if (role && role.length > 0) {
      filter.roleId = { in: role };
    }

    let userList = await this.#user.get({
      where: filter,
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
        role: {
          select: {
            id: true,
            strongId: true,
            name: true,
          },
        },
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: orderBy
        ? orderBy
        : {
            createdAt: "desc",
          },
      skip: (page - 1) * count,
      take: count,
    });

    let totalCount = await this.#user.count({
      where: filter,
    });

    userList = userList.map((item) => {
      if (item?.image) {
        item.image.path = `${urlPrefix}/${item.image?.path}`;
      }
      return item;
    });

    return {
      status: true,
      msg: "User list fetched successfully",
      data: userList,
      count: totalCount,
    };
  }

  async details({ uuid, urlPrefix }) {
    let userInfo = await this.#user.getDetails({
      where: {
        uuid: uuid,
        isDeleted: false,
      },
      select: {
        id: true,
        uuid: true,
        name: true,
        email: true,
        socketId: true,
        image: {
          select: {
            id: true,
            extension: true,
            path: true,
          },
        },
        role: {
          select: {
            id: true,
            strongId: true,
            name: true,
          },
        },
        createdAt: true,
        updatedAt: true,
        isOnline: true,
        lastOnline: true,
      },
    });

    if (!userInfo) {
      return {
        status: false,
        msg: "Invalid id",
      };
    }

    if (userInfo?.image && urlPrefix) {
      userInfo.image.path = `${urlPrefix}/${userInfo.image.path}`;
    }

    return {
      status: true,
      msg: "User details fetched successfully",
      data: userInfo,
    };
  }

  async detailsById({ id, urlPrefix }) {
    let userInfo = await this.#user.getDetails({
      where: {
        id: id,
        isDeleted: false,
      },
      select: {
        id: true,
        uuid: true,
        name: true,
        email: true,
        socketId: true,
        image: {
          select: {
            id: true,
            extension: true,
            path: true,
          },
        },
        role: {
          select: {
            id: true,
            strongId: true,
            name: true,
          },
        },
        createdAt: true,
        updatedAt: true,
        isOnline: true,
        lastOnline: true,
      },
    });

    if (!userInfo) {
      return {
        status: false,
        msg: "Invalid id",
      };
    }

    if (userInfo?.image && urlPrefix) {
      userInfo.image.path = `${urlPrefix}/${userInfo.image.path}`;
    }

    return {
      status: true,
      msg: "User details fetched successfully",
      data: userInfo,
    };
  }

  async update({
    uuid,
    name,
    email,
    password,
    role,
    socketId,
    profile,
    isOnline,
    lastOnline,
    isActive,
    profileImageStatus,
  }) {
    let userInfo = await this.#user.getDetails({
      where: { uuid, isDeleted: false },
    });
    if (!userInfo) return { status: false, msg: "Invalid id" };

    let newData = {};

    if (email) {
      let emailInfo = await this.#user.getDetails({
        where: { email, isDeleted: false, NOT: { uuid } },
      });

      if (emailInfo) {
        return { status: false, msg: "Email already exists" };
      }
      newData.email = email;
    }

    if (name) newData.name = name;
    if (role) newData.roleId = role;
    if (password) newData.password = await hashPassword(password);
    if (socketId) newData.socketId = socketId;
    if (lastOnline) newData.lastOnline = lastOnline;
    if (isOnline === false || isOnline === true) newData.isOnline = isOnline;
    if (isActive === false || isActive === true) newData.isActive = isActive;

    if (profileImageStatus === true) {
      if (profile) newData.imageId = profile;
    }

    await this.#user.update({ id: userInfo.id }, newData);

    return { status: true, msg: "User updated successfully" };
  }

  async delete({ uuid, apiUser }) {
    let userInfo = await this.#user.getDetails({
      where: {
        uuid: uuid,
        isDeleted: false,
      },
    });

    if (!userInfo) {
      return {
        status: false,
        msg: "Invalid id",
      };
    }

    if (userInfo.roleId <= 2) {
      return {
        status: false,
        msg: "Cannot delete this user",
      };
    }

    let deleteStatus = await this.#user.update(
      { id: userInfo.id },
      { isDeleted: true }
    );
    if (deleteStatus) {
      await GroupInstance.removeMemberFromEvery({
        apiUser: apiUser,
        member: [userInfo.id],
      });
    }

    return {
      status: true,
      msg: "User deleted successfully",
    };
  }

  async notInGroup({ page, count, search, groupId }) {
    const rawQuery = `SELECT user.id,user.uuid,user.name,user.email,user.roleId,user.imageId,user.createdAt,user.updatedAt, user.alwaysOpenSchedule,role.strongId, role.name as roleName, uploads.extension, uploads.path FROM User user LEFT JOIN Uploads uploads ON user.imageId = uploads.id LEFT JOIN Role role on user.roleId = role.id WHERE user.isDeleted = 0 && user.id NOT IN (SELECT DISTINCT userId FROM Group_Member WHERE groupId = ${groupId}) AND role.strongId > 2 AND (user.name LIKE CONCAT('%', '${search}', '%') OR user.email LIKE CONCAT('%', '${search}', '%')) ORDER BY id DESC LIMIT ${count} OFFSET ${
      (page - 1) * count
    }`;

    let userList = await this.#user.raw(rawQuery);

    const rawTotalCountQuery = `SELECT COUNT(*) as count FROM User user LEFT JOIN Role role on user.roleId = role.id WHERE user.isDeleted = 0 && user.id NOT IN (SELECT DISTINCT userId FROM Group_Member WHERE groupId = ${groupId}) AND role.strongId > 2 AND (user.name LIKE CONCAT('%', '${search}', '%') OR user.email LIKE CONCAT('%', '${search}', '%'))`;

    let totalCount = parseInt(
      (await this.#user.raw(rawTotalCountQuery))[0]?.count
    );

    return {
      status: true,
      msg: "User list fetched successfully",
      data: userList,
      count: totalCount,
    };
  }

  async listWithPerms({ page, count, search, urlPrefix }) {
    console.log("--------------- IN ------------ START");
    console.log(urlPrefix);
    console.log("--------------- IN ------------ OVER");
    
    const rawQuery = `SELECT user.id,user.uuid,user.name,user.email,user.roleId,user.createdAt,user.updatedAt, user.alwaysOpenSchedule, role.strongId, role.name as roleName,upl.extension as imageExtension, CONCAT('${urlPrefix}',upl.path) as imagePath,  ssp.expireTime FROM User user LEFT JOIN Role role on user.roleId = role.id LEFT JOIN Uploads upl on upl.id = user.imageId LEFT JOIN (SELECT * FROM Special_Schedule_Permission WHERE expireTime > CURRENT_TIMESTAMP()) ssp on ssp.userId = user.id WHERE role.strongId > 2 AND user.isDeleted = 0 AND (user.name LIKE CONCAT('%', '${search}', '%') OR user.email LIKE CONCAT('%', '${search}', '%')) ORDER BY ssp.expireTime DESC LIMIT ${count} OFFSET ${
      (page - 1) * count
    }`;

    console.log("--------------- QUERY ------------ START");
    console.log(rawQuery);
    console.log("--------------- QUERY ------------ OVER");

    let userList = await this.#user.raw(rawQuery);

    const rawTotalCountQuery = `SELECT COUNT(*) as count FROM User user LEFT JOIN Role role on user.roleId = role.id LEFT JOIN (SELECT * FROM Special_Schedule_Permission WHERE expireTime > CURRENT_TIMESTAMP()) ssp on ssp.userId = user.id WHERE role.strongId > 2 AND user.isDeleted = 0 AND (user.name LIKE CONCAT('%', '${search}', '%') OR user.email LIKE CONCAT('%', '${search}', '%'))`;

    console.log("--------------- QUERY COUNT ------------ START");
    console.log(rawTotalCountQuery);
    console.log("--------------- QUERY COUNT ------------ OVER");

    let totalCount = parseInt(
      (await this.#user.raw(rawTotalCountQuery))[0]?.count
    );

    return {
      status: true,
      msg: "User list with perms fetched successfully",
      data: userList,
      count: totalCount,
    };
  }

  async listWithConnectionStatus({
    all,
    apiUser,
    page,
    count,
    search,
    role,
    urlPrefix,
    orderBy,
  }) {
    let filter = {
      isDeleted: false,
      NOT: { id: apiUser.id },
      OR: [{ name: { contains: search } }, { email: { contains: search } }],
    };

    if (role && role.length > 0) {
      filter.roleId = { in: role };
    }

    let paginationObj = {};

    if (all !== true) {
      paginationObj.skip = (page - 1) * count;
      paginationObj.take = count;
    }

    let userList = await this.#user.get({
      where: filter,
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
        role: {
          select: {
            id: true,
            strongId: true,
            name: true,
          },
        },
        isOnline: true,
        lastOnline: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: orderBy
        ? orderBy
        : {
            createdAt: "desc",
          },
      ...paginationObj,
    });

    let totalCount = await this.#user.count({
      where: filter,
    });

    userList = await Promise.all(
      userList.map(async (item) => {
        item.connectionStatus = null;
        item.connectionId = null;
        const connectionInfo = await this.#connection.getDetails({
          where: {
            OR: [
              {
                userId1: apiUser.id,
                userId2: item.id,
              },
              {
                userId1: item.id,
                userId2: apiUser.id,
              },
            ],
          },
        });

        if (connectionInfo) {
          item.connectionStatus = connectionInfo.status;
          item.connectionId = connectionInfo.id;
        }

        if (item?.image) {
          item.image.path = `${urlPrefix}/${item.image?.path}`;
        }
        return item;
      })
    );

    return {
      status: true,
      msg: "User list with permission fetched successfully",
      data: userList,
      count: totalCount,
    };
  }
}

export default UserService;
