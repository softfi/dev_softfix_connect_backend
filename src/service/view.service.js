import { currentDateTimeIndian } from "../utils/helper.js";
import QueryService from "./database/query.service.js";

class ViewService {
  #groupView;
  #groupLog;
  constructor() {
    this.#groupView = new QueryService("Group_Logs_Views");
    this.#groupLog = new QueryService("Group_Logs");
  }

  async createGroupView({ logId, userId }) {
    let alreadyViewed = await this.#groupView.getDetails({
      where: { logId, userId },
    });

    if (!alreadyViewed) {
      let groupInfo = await this.#groupLog.getDetails({ where: { id: logId } });
      await this.#groupView.create({
        data: {
          logId,
          userId,
          groupId: groupInfo.groupId,
          viewAt: currentDateTimeIndian(new Date()),
        },
      });
    }
    return {
      status: true,
      msg: "Log view created successfully!",
    };
  }
}

export default ViewService;
