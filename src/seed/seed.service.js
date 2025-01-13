import QueryService from "../service/database/query.service.js";
import { Admin, Roles, scheduleDefaultData } from "../utils/constants.js";
import { hashPassword } from "../utils/helper.js";

class SeedService {
  #role;
  #user;
  #schedule;
  constructor() {
    this.#role = new QueryService("role");
    this.#user = new QueryService("user");
    this.#schedule = new QueryService("schedule");
  }

  async #createRole() {
    try {
      for (const key of Roles) {
        const dt = {
          strongId: key.strongId,
          name: key.name,
        };
        let roleInfo = await this.#role.getDetails({ where: dt });
        if (!roleInfo) {
          await this.#role.create({
            data: {
              strongId: key.strongId,
              name: key.name,
            },
          });
        } else {
          console.log(
            `Role with strongId:${dt.strongId} and name:${dt.name} already exists!`
          );
        }
      }
      console.log("Roles created successfully...");
    } catch (error) {
      console.error("Error while creating Role =>" + error);
    }
  }

  async #createAdmin() {
    try {
      let adminRoleInfo = await this.#role.getDetails({
        where: { strongId: 2 },
      });
      if (!adminRoleInfo) {
        throw new Error("Admin role not available!");
      }

      let userInfo = await this.#user.getDetails({
        where: { name: "Admin#1", roleId: adminRoleInfo.id },
      });

      if (userInfo) {
        throw new Error("Admin already exists!");
      }
      const data = {
        name: Admin.name,
        email: Admin.email,
        password: await hashPassword(Admin.password),
        roleId: adminRoleInfo.id,
      };
      await this.#user.create({ data });
      console.log("Admin created successfully...");
    } catch (error) {
      console.error("Error while creating Admin =>" + error);
    }
  }

  async #createSchedule() {
    try {
      if (
        scheduleDefaultData &&
        Array.isArray(scheduleDefaultData) &&
        scheduleDefaultData.length > 0
      ) {
        for (let i = 0; i < scheduleDefaultData.length; i++) {
          let dayInfo = await this.#schedule.getDetails({
            where: {
              day: scheduleDefaultData[i].day,
            },
          });

          if (!dayInfo) {
            await this.#schedule.create({
              data: {
                day: scheduleDefaultData[i].day,
                name: scheduleDefaultData[i].name,
                startTime: scheduleDefaultData[i].startTime,
                endTime: scheduleDefaultData[i].endTime,
                off: scheduleDefaultData[i].off,
                updatedById: 1,
              },
            });
          }
        }
      } else {
        throw new Error("Default schedule not available!");
      }

      console.log("Schedule created successfully...");
    } catch (error) {
      console.error("Error while creating Admin =>" + error);
    }
  }

  async seed() {
    console.log("Seeding Start...");

    await this.#createRole();
    await this.#createAdmin();
    await this.#createSchedule();

    console.log("Seeding Done...!");
  }
}

export default SeedService;
