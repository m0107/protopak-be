const tableName = "users";
// const adminUserTableName = "admin_users";

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = async function(knex) {
    await knex.schema.createTable(tableName, (table) => {
        table.uuid("user_id").primary(); //provided by telegram
        table.string("email").unique().notNullable();
        table.string("password").notNullable();
        table.string("username").unique().nullable();
         table.string("phone_number").unique().nullable();
        // table.string("referral_code").unique().notNullable();
        // table.uuid("referred_by").nullable().references("user_id").inTable(tableName).onDelete("restrict");
        table.timestamp("last_login_at").nullable().defaultTo(null);
        table.string("status").nullable();
        // table.uuid("created_by").nullable().references("user_id").inTable(adminUserTableName).onDelete("restrict");
        // table.uuid("updated_by").nullable().references("user_id").inTable(adminUserTableName).onDelete("restrict");
        table.timestamps(false, true);
        table.boolean("is_deleted").defaultTo(false);
        table.boolean("is_email_verified").defaultTo(false);
        table.timestamp("password_changed_at").nullable().defaultTo(null);
        table.timestamp("ip").nullable().defaultTo(null);
    });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = async function(knex) {
    await knex.schema.dropTable("users");
};
