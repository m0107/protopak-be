exports.up = function (knex) {
  return knex.schema.createTable("shipping_address", function (table) {
    table.uuid("shipping_address_id").primary(); // Auto-incrementing primary key
    table.uuid("user_id").references("users.user_id").notNullable();
    table.string("first_line").notNullable(); // Default: 'pending'
    table.string("street_name").notNullable();
    table.string("post_code").notNullable(); // changed to string for flexibility
    table.timestamps(true, true);
  });
};

exports.down = function (knex) {
  return knex.schema.dropTable("shipping_address");
};
