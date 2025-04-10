const tableName = "users";
// const adminUserTableName = "admin_users";

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = async function(knex) {
    await knex.schema.createTable(tableName, (table) => {
        table.uuid("razorpay_order_id").primary(); //provided by telegram
        table.string("razorpay_payment_id").unique().notNullable();
        table.string("razorpay_signature").unique().notNullable();
        table.string("amount").notNullable();
        table.string("currency").unique().nullable();
        table.string("status").unique().nullable();
        table.string("is_verified").unique().nullable();
    });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = async function(knex) {
    await knex.schema.dropTable("users");
};
