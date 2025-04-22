exports.up = function (knex) {
  return knex.schema.createTable("orders", function (table) {
    table.uuid("order_id").primary(); // Auto-incrementing primary key
    table.uuid("user_id").references("users.user_id").notNullable();
    table.string("order_status").notNullable();
    table.string("razorpay_order_id").notNullable();
    table.string("razorpay_payment_id").notNullable();
    table.string("razorpay_signature").notNullable();
    table.string("amount").notNullable();
    table.string("currency").notNullable();
    table
      .uuid("shipping_address_id")
      .references("shipping_address.shipping_address_id")
      .notNullable();
    table.string("payment_method");
    table.timestamps(true, true);
  });
};

exports.down = function (knex) {
  return knex.schema.dropTable("orders");
};
