exports.up = function (knex) {
  return knex.schema.createTable("user_orders", function (table) {
    table.increments("id").primary(); // Auto-incrementing primary key

    table.string("order_status").notNullable().defaultTo("pending"); // Default: 'pending'
    table.string("razorpay_order_id").nullable(); // Now nullable
    table.string("razorpay_payment_id");
    table.string("razorpay_signature");

    table.decimal("amount", 10, 2).notNullable(); // Total order amount
    table.string("currency", 10).defaultTo("INR");
    table.string("payment_method"); // e.g. card, UPI, netbanking
    table.timestamp("paid_at"); // When payment was completed

    table.boolean("is_deleted").defaultTo(false);
    table.jsonb("metadata"); // Optional field for extra info
    table.timestamps(true, true); // created_at & updated_at
  });
};

exports.down = function (knex) {
  return knex.schema.dropTable("user_orders");
};
