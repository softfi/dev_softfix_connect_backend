import SeedService from "./seed/seed.service.js";

const seed = async () => {
    const seedService = new SeedService();
    await seedService.seed()
}
seed();