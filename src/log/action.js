export const printSocketConnection = ({ socket, currentUser }) => {
  console.log("-----------------------------------------");
  console.log("New user connected with id =>", socket.id);
  console.log("User details =>", socket.apiUser);
  console.log("-----------");
  console.log("Now, Total Users are ", currentUser);
  console.log("-----------------------------------------\n\n");
};
