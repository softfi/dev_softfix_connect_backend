import QueryService from "./database/query.service.js";

class RoleService {
  constructor() {
    this.role = new QueryService("role");
  }

  async list(filter={}) {
    let data = await this.role.get(filter);
    return {
      status: true,
      msg: "Roles list fetched successfully!",
      data: data,
    };
  }
}

export default RoleService;