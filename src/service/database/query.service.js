import prismaClient from "../../prisma/prisma.service.js";

class QueryService {
  #prisma;
  #table;
  constructor(table) {
    this.#prisma = prismaClient;
    this.#table = table;
  }

  async raw(query) {
    return this.#prisma.$queryRawUnsafe(query);
  }

  async create(data) {
    return this.#prisma[this.#table].create(data);
  }

  async createMany(data) {
    return this.#prisma[this.#table].createMany(data);
  }

  async update(where = null, data = null) {
    if (!where) {
      return null;
    }
    return this.#prisma[this.#table].update({ where: where, data: data });
  }

  async updateMany(where = null, data = null) {
    if (!where) {
      return null;
    }
    return this.#prisma[this.#table].updateMany({ where: where, data: data });
  }

  async get(data = {}) {
    return this.#prisma[this.#table].findMany(data);
  }

  async count(data = {}, subQuery = null) {
    let query = data;
    if (subQuery) {
      query = { ...query, ...subQuery };
    }
    return this.#prisma[this.#table].count(query);
  }

  async getDetails(data = {}, subQuery = null) {
    let query = data;
    if (subQuery) {
      query = { ...query, ...subQuery };
    }

    return this.#prisma[this.#table].findFirst(query);
  }

  async delete(data = {}) {
    return this.#prisma[this.#table].delete(data);
  }

  async deleteMany(data = {}) {
    return this.#prisma[this.#table].deleteMany(data);
  }

  async groupBy(data = {}) {
    return this.#prisma[this.#table].groupBy(data);
  }
}

export default QueryService;
