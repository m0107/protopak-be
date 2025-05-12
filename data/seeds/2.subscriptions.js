const { v4: uuidv4 } = require("uuid");
exports.seed = async (knex) => {
  return knex("subscriptions")
    .del()
    .then(async () => {
      return knex("subscriptions").insert([
        {
          subscription_id: uuidv4(),
          amount: 15,
          dieline_downloads: 3,
          type: "basic",
          },
          {
            subscription_id: uuidv4(),
            amount: 60,
            dieline_downloads: 15,
            type: "pro",
          },
      ]);
    });
};
