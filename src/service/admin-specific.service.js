import QueryService from "./database/query.service.js";
import RoleService from "./role.service.js";

class AdminSpecificService {
  #user;
  #group;
  #role;
  constructor() {
    this.#user = new QueryService("user");
    this.#group = new QueryService("group");
    this.#role = new RoleService();
  }

  async dashboard({ apiUser }) {
    let profileInfo = await this.#user.getDetails({
      where: { id: apiUser.id, isDeleted: false },
      select: {
        name: true,
        email: true,
        role: { select: { name: true } },
        image: { select: { path: true } },
      },
    });

    if (profileInfo) {
      profileInfo.totalGroupCount =
        (await this.#group.count({
          where: {
            isDeleted: false,
          },
        })) ?? null;

      let getRole = await this.#role.list({});

      let roleFilterForEmp = getRole.data
        ?.filter((e) => e.strongId === 3)
        .map((e) => e.id);

      profileInfo.totalEmployeeCount =
        (await this.#user.count({
          where: {
            roleId: { in: roleFilterForEmp },
            isDeleted: false,
          },
        })) ?? null;

      let roleFilterForClient = getRole.data
        ?.filter((e) => e.strongId === 4)
        .map((e) => e.id);

      profileInfo.totalClientCount =
        (await this.#user.count({
          where: {
            roleId: { in: roleFilterForClient },
            isDeleted: false,
          },
        })) ?? null;

      return {
        status: true,
        msg: "Dashboard data fetched successfully!",
        data: profileInfo,
      };
    } else {
      return { status: false, msg: "Invalid user" };
    }
  }
}

export default AdminSpecificService;
