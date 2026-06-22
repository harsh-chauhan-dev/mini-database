const fs = require("fs");

class Database {
  constructor(filePath) {
    this.filePath = filePath;
  }

  read() {
    const data = fs.readFileSync(
      this.filePath,
      "utf8"
    );

    return JSON.parse(data);
  }

  write(data) {
    fs.writeFileSync(
      this.filePath,
      JSON.stringify(data, null, 2)
    );
  }

  insert(record) {
    const data = this.read();

    data.push(record);

    this.write(data);

    return record;
  }

  findById(id) {
    const data = this.read();

    return data.find(
      item => item.id === Number(id)
    );
  }

  update(id, newData) {
    const data = this.read();

    const index = data.findIndex(
      item => item.id === Number(id)
    );

    if (index === -1) {
      return null;
    }

    data[index] = {
      ...data[index],
      ...newData
    };

    this.write(data);

    return data[index];
  }

  delete(id) {
    const data = this.read();

    const filtered = data.filter(
      item => item.id !== Number(id)
    );

    this.write(filtered);
  }
}

module.exports = Database;