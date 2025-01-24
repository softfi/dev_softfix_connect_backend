import { getJwtToken, hashPassword, matchPassword } from "../utils/helper.js";
import QueryService from "./database/query.service.js";

class AuthService {
  constructor() {
    this.user = new QueryService("user");
  }

  async login({ username, password, type }) {
    let usernameInfo = await this.user.getDetails({
      where: { email: username, isDeleted: false },
      select: {
        id: true,
        uuid: true,
        name: true,
        email: true,
        password: true,
        isActive: true,
        role: { select: { id: true, name: true } },
      },
    });

    if (!usernameInfo) {
      return { status: false, msg: "Invalid username or password" };
    }

    let passStatus = await matchPassword(password, usernameInfo.password);
    if (passStatus) {
      if (type !== usernameInfo.role.name) {
        return { status: false, msg: "Cannot authorize from this side" };
      }
      const token = getJwtToken({ id: usernameInfo.id });
      return {
        status: true,
        msg: "Logged in successfully!",
        data: token,
        isVerified: usernameInfo.isActive,
      };
    } else {
      return { status: false, msg: "Invalid password" };
    }
  }

  async profile({ apiUser }) {
    let profileInfo = await this.user.getDetails({
      where: { id: apiUser.id, isDeleted: false },
      select: {
        id: true,
        uuid: true,
        name: true,
        email: true,
        role: { select: { id: true, name: true } },
        image: { select: { id: true, extension: true, path: true } },
      },
    });

    if (profileInfo) {
      return {
        status: true,
        msg: "Profile fetched successfully!",
        data: profileInfo,
      };
    } else {
      return { status: false, msg: "Invalid user" };
    }
  }

  async editProfile({ apiUser, name, image }) {
    let profileInfo = await this.user.getDetails({
      where: { id: apiUser.id, isDeleted: false },
    });

    if (!profileInfo) {
      return {
        status: false,
        msg: "Invalid profile!",
      };
    }

    let newData = {};

    if (name) newData.name = name;
    if (image) newData.imageId = image;

    await this.user.update({ id: apiUser.id }, newData);
    return {
      status: true,
      msg: "Profile updated successfully!",
    };
  }

  async removeProfile({ apiUser }) {
    let profileInfo = await this.user.getDetails({
      where: { id: apiUser.id, isDeleted: false },
    });

    if (!profileInfo) {
      return {
        status: false,
        msg: "Invalid profile!",
      };
    }

    await this.user.update({ id: apiUser.id }, { imageId: null });
    return {
      status: true,
      msg: "Profile image removed successfully!",
    };
  }

  async changePassword({ apiUser, oldPass, newPass }) {
    let profileInfo = await this.user.getDetails({
      where: { id: apiUser.id, isDeleted: false },
    });

    if (!profileInfo) {
      return {
        status: false,
        msg: "Invalid profile!",
      };
    }

    let matchPass = await matchPassword(oldPass, profileInfo.password);
    if (!matchPass) {
      return {
        status: false,
        msg: "Incorrect old password",
      };
    }

    await this.user.update(
      { id: apiUser.id },
      { password: await hashPassword(newPass) }
    );

    return {
      status: true,
      msg: "Password updated successfully!",
    };
  }
}

export default AuthService;
