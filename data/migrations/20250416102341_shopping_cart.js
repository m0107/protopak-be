// migrations/XXXXXXXXXXXXXX_create_shopping_cart.js

exports.up = function (knex) {
  return knex.schema.createTable("shopping_cart", function (table) {
    table.increments("shopping_cart_id").primary();
    table
      .uuid("user_id")
      .notNullable()
      .references("user_id")
      .inTable("users")
      .onDelete("CASCADE");
    table
      .integer("user_products_id")
      .notNullable()
      .references("user_products_id")
      .inTable("user_products")
      .onDelete("CASCADE");
    table.boolean("is_selected").defaultTo(true);
    table.jsonb("customization").defaultTo("{}");
    table.timestamps(true, true);
  });
};

exports.down = function (knex) {
  return knex.schema.dropTableIfExists("shopping_cart");
};
