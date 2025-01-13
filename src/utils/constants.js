export const uploadPath = "public/image";

export const delFilter = {
  isDeleted: false,
};

export const Roles = [
  { strongId: 1, name: "SUPER_ADMIN" },
  { strongId: 2, name: "ADMIN" },
  { strongId: 3, name: "EMPLOYEE" },
];

export const Admin = Object.freeze({
  name: "Admin#1",
  email: "sc.admin.1@gmail.com",
  password: "1234",
});

export const actionContent = Object.freeze({
  addMember: `<p><span style='font-weight:900'>#@from#</span> added <span style='font-weight:900'>#@to#</span> in this group</p>`,
  removeMember: `<p><span style='font-weight:900'>#@from#</span> remove <span style='font-weight:900'>#@to#</span> from this group</p>`,
  sentConnectionReq: `<p><span style='font-weight:900'>#@from#</span> sent connection request to <span style='font-weight:900'>#@to#</span></p>`,
  acceptConnectionReq: `<p><span style='font-weight:900'>#@from#</span> accepted the connection request</p>`,
  blockConnection: `<p><span style='font-weight:900'>#@from#</span> blocked <span style='font-weight:900'>#@to#</span></p>`,
  notificationConnectionRequestSend: `<p><b>#@connectionSender#</b> sent you a connection request</p>`,
  notificationConnectionRequestAccept: `<p><b>#@connectionSender#</b> accepted your connection request</p>`,
});

export const scheduleDefaultData = [
  { day: 0, name: "sunday", startTime: "10:00", endTime: "19:00", off: true },
  { day: 1, name: "monday", startTime: "10:00", endTime: "19:00", off: false },
  { day: 2, name: "tuesday", startTime: "10:00", endTime: "19:00", off: false },
  {
    day: 3,
    name: "wednesday",
    startTime: "10:00",
    endTime: "19:00",
    off: false,
  },
  {
    day: 4,
    name: "thursday",
    startTime: "10:00",
    endTime: "19:00",
    off: false,
  },
  { day: 5, name: "friday", startTime: "10:00", endTime: "19:00", off: false },
  {
    day: 6,
    name: "saturday",
    startTime: "10:00",
    endTime: "19:00",
    off: false,
  },
];

export const notificationType = ["CONNECTION_REQUEST", "GROUP"];
