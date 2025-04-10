const tableName = "users";
// const adminUserTableName = "admin_users";

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = async function(knex) {
    await knex.schema.createTable(tableName, (table) => {
        table.uuid("shopping_cart_id").primary(); //provided by telegram
        table.string("user_id").unique().notNullable();
        table.string("product_id").unique().notNullable();
        table.string("is_hidden").notNullable();
        table.string("is_deleted").unique().nullable();
    });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = async function(knex) {
    await knex.schema.dropTable("users");
};
