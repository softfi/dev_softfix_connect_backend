import { join } from "path";
import { readdir, mkdir } from "fs/promises";
import QueryService from "./database/query.service.js";
import { generateRandomString, hashPassword, removeSpace } from "../utils/helper.js";

class UploadService {
  #user;
  #role;
  constructor() {
    this.upload = new QueryService("uploads");
    this.#user = new QueryService("user");
    this.#role = new QueryService("role");
  }

  async #manageFolderStructure({ rootPath, year, month, date }) {
    let checkPublic = await readdir(rootPath);

    const rootDir = "public";
    if (!checkPublic.includes(rootDir)) {
      await mkdir(rootPath + "/" + rootDir);
    }

    rootPath = join(rootPath, rootDir);

    const insideRoot = "uploads";
    let checkInsideRoot = await readdir(rootPath);
    if (!checkInsideRoot.includes(insideRoot)) {
      await mkdir(rootPath + "/" + insideRoot);
    }

    rootPath = join(rootPath, insideRoot);

    let checkYear = await readdir(rootPath);
    if (!checkYear.includes(year)) {
      await mkdir(rootPath + "/" + year);
    }

    rootPath = join(rootPath, year);

    let checkMonth = await readdir(rootPath);
    if (!checkMonth.includes(month)) {
      await mkdir(rootPath + "/" + month);
    }

    rootPath = join(rootPath, month);

    let checkDate = await readdir(rootPath);
    if (!checkDate.includes(date)) {
      await mkdir(rootPath + "/" + date);
    }

    rootPath = join(rootPath, date);
    return rootPath;
  }

  async uploadFiles({ apiUser, fileArray, urlPrefix }) {
    let currentDate = new Date().toLocaleDateString().split("/");
    const year = currentDate[2];
    const month = currentDate[0];
    const date = currentDate[1];

    const rootPath = join(import.meta.dirname, "../../");

    let fullPath = await this.#manageFolderStructure({
      rootPath,
      year,
      month,
      date,
    });

    let pathToSave = fullPath;
    if (fullPath) {
      pathToSave = pathToSave.slice(pathToSave.lastIndexOf(year));
    }

    let result = [];
    for (let file of fileArray) {
      let fileName =
        file.name.slice(0, file.name.lastIndexOf(".")) +
        "-" +
        generateRandomString(7);

      fileName = removeSpace(fileName).toLowerCase();

      let fileExtension = file.name.split(".")[file.name.split(".").length - 1];

      const fullPathOfFile = pathToSave + "/" + fileName + "." + fileExtension;

      let uploadEntryData = {
        extension: fileExtension,
        path: fullPathOfFile,
        createdById: apiUser.id,
      };

      let dbData = await this.upload.create({ data: uploadEntryData });

      let uploadPath = fullPath + "/" + fileName + "." + fileExtension;
      await file.mv(uploadPath);
      result.push({
        id: dbData.id,
        url: urlPrefix ? urlPrefix + dbData.path : "",
      });
    }

    return {
      status: true,
      msg: "File uploaded successfully!",
      data: result,
    };
  }

  async userRegister({ name, email, password }) {
    let emailInfo = await this.#user.getDetails({
      where: { email, isDeleted: false },
    });

    if (emailInfo) {
      return { status: false, msg: "Email already exists" };
    }

    let empRole = await this.#role.getDetails({ where: { strongId: 3 } });

    if (!empRole) {
      return { status: false, msg: "Default role not available!" };
    }

    let newData = {
      name,
      email,
      roleId: empRole.id,
      password: await hashPassword(password),
    };

    let insertStatus = await this.#user.create({
      data: newData,
    });

    if (insertStatus) {
      return {
        status: true,
        msg: "User registered successfully, please wait for the approval",
      };
    } else {
      return { status: false, msg: "Failed to register" };
    }
  }
}

export default UploadService;
