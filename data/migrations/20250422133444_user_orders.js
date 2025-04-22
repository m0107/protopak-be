exports.up = function (knex) {
  return knex.schema.createTable("user_orders", function (table) {
    table.increments("user_order_id").primary(); // Auto-incrementing primary key
    table.uuid("order_id").references("orders.order_id").notNullable();
    table
      .uuid("user_products_id")
      .references("user_products.user_products_id")
      .notNullable();
    table.timestamps(true, true); // created_at & updated_at
  });
};

exports.down = function (knex) {
  return knex.schema.dropTable("user_orders");
};
