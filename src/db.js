import fs from "node:fs/promises";

const dbUrl = new URL("../db.json", import.meta.url);

export class Db {
  #database = {};

  constructor() {
    fs.readFile(dbUrl, "utf8")
      .then((data) => {
        this.#database = JSON.parse(data);
      })
      .catch(() => {
        this.#persist();
      });
  }

  async #persist() {
    try {
      await fs.writeFile(dbUrl, JSON.stringify(this.#database, null, 2));
    } catch {
      console.error("Error writing to JSON file:", error);
      throw error;
    }
  }

  select(table, search) {
    let data = this.#database[table] ?? [];
    if (search) {
      data = data.filter((row) => {
        return Object.entries(search).some(([key, value]) => {
          return row[key].toLowerCase().includes(value.toLowerCase());
        });
      });
    }
    return data;
  }

  internSelect(table, search) {
    let data = this.#database[table] ?? [];
    if (search) {
      data = data.filter((row) => {
        return Object.entries(search).some(([key, value]) => {
          return row[key].toLowerCase().includes(value.toLowerCase());
        });
      });
    }
    return data[0];
  }

  async insert(table, data) {

    if (Array.isArray(this.#database[table])) {

      this.#database[table].push(data);

    } else {

      this.#database[table] = [data];

    }

    await this.#persist();

    return data;
  }

  update(table, id, data) {

    const rowIndex = this.#database[table].findIndex((row) => row.id === id);

    if (rowIndex > -1) {

      this.#database[table][rowIndex] = { id, ...data };
      this.#persist();
    }
  }

  delete(table, id) {
    const rowIndex = this.#database[table].findIndex((row) => row.id === id);
    if (rowIndex > -1) {
      this.#database[table].splice(rowIndex, 1);
      this.#persist();
    }
  }
  patch(table, id, data) {
    const rowIndex = this.#database[table].findIndex((row) => row.id === id);

    if (rowIndex > -1) {
      this.#database[table][rowIndex] = { id, ...data };
      this.#persist();
    }
  }
}
