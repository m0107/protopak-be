const { v4: uuidv4 } = require("uuid");
const bcrypt = require("bcrypt");
exports.seed = async (knex) => {
  return;
  return knex("users")
    .del()
    .then(async () => {
      const salt = await bcrypt.genSalt(10);
      return knex("users").insert([
        {
          user_id: uuidv4(),
          email: "admin@gmail.com",
          pacdora_user_id: "x9YP6Q7iCzEkhy2n4XfgbHLsmowqJAZ",
          password: await bcrypt.hash("Abcd@1234", salt),
          is_email_verified: true,
          is_deleted: false,
          status: "success",
        },
      ]);
    });
};
