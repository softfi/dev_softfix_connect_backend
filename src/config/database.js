import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

const databaseConnection = async () => {
  try {
    let data = await prisma.$queryRaw`SHOW TABLES`;
    // console.log(data);
    console.log("Database connected successfully...!");
    await prisma.$disconnect();
  } catch (error) {
    console.log("Crash =>", error);
    await prisma.$disconnect();
    process.exit(1);
  }
};

export default databaseConnection;
