const tablename = "user_products";
exports.up = function (knex) {
  return knex.schema.createTable(tablename, function (table) {
    table.increments("user_products_id").primary();

    table.bigInteger("project_id").notNullable().index();

    table.string("project_name").notNullable().defaultTo("untitled");

    //table.timestamp('created_at').defaultTo(knex.fn.now());
    //table.timestamp('updated_at').defaultTo(knex.fn.now());

    // Reference to users table
    table.uuid("user_id").notNullable();

    table
      .foreign("user_id")
      .references("user_id")
      .inTable("users")
      .onDelete("CASCADE");

    table.string("size").notNullable();
    table.jsonb("size_options").notNullable();

    table.float("price").notNullable();

    table.jsonb("quantity_options").notNullable();

    table.string("printSides").notNullable();
    table.jsonb("printSides_options").notNullable();

    table.string("print").notNullable();
    table.jsonb("print_options").notNullable();

    table.string("material").notNullable();
    table.jsonb("material_options").notNullable();

    table.string("finishing").notNullable();
    table.jsonb("finishing_options").notNullable();

    table.string("delivery").notNullable();
      table.jsonb("delivery_options").notNullable();
      
      //TODO: Add is_deleted


    table.timestamps(true, true);
  });
};

exports.down = function (knex) {
  return knex.schema.dropTable(tablename);
};
