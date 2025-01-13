import os from "os";
import cluster from "cluster";

const cpu = os.cpus();

cluster.setupPrimary({
    exec: "./src/index.js"
})

for (let i = 0; i < cpu.length; i++) {
    cluster.fork();
}   

cluster.on("exit", (worker, code, signal) => {
    console.log("Worker " + worker.process.pid + " has been killed");
    console.log("Start another worker");
    cluster.fork();
})