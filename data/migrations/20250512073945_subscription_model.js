// 20250512_create_subscriptions_and_user_subscriptions.js

exports.up = async function (knex) {
  await knex.schema.createTable("subscriptions", (table) => {
    table.uuid("subscription_id").primary();
    table.integer("amount").notNullable();
    table.integer("dieline_downloads").notNullable();
    table
      .enu("type", ["basic", "pro"], {
        useNative: true,
        enumName: "subscription_type",
      })
      .notNullable();
    table.timestamps(true, true);
  });

  await knex.schema.createTable("user_subscriptions", (table) => {
    table.uuid("user_subscription_id").primary();
    table.uuid("user_id").references("users.user_id").notNullable();
    table
      .uuid("subscription_id")
      .notNullable()
      .references("subscription_id")
      .inTable("subscriptions")
      .onDelete("CASCADE");
    table
      .enu("order_status", ["created", "paid", "failed", "cancelled", "success"], {
        useNative: true,
        enumName: "order_status_enum",
      })
      .notNullable();
    table.string("razorpay_order_id").notNullable();
    table.string("razorpay_payment_id").notNullable();
    table.string("razorpay_signature").notNullable();
    table.integer("amount").notNullable();
    table.string("currency").notNullable();
    table.string("payment_method");
    table.timestamps(true, true);
  });

  await knex.schema.createTable("dieline_downloads", (table) => {
    table.uuid("dieline_downloads_id").primary();
    table.uuid("user_id").references("users.user_id").notNullable();
    table.uuid("user_products_id");
    table.string("project_id");
    table.string("pdf_task_id").comment('This is given by API team to track status of download-dieline');
    table.string("pdf_file_url").comment('This is given by API team to track status of download-dieline');
    table.string("blank_dieline_task_id").comment('This is given by API team to track status of download-dieline');
    table.string("blank_file_url").comment('This is given by API team to track status of download-dieline');
    table.string("ai_task_id").comment('This is given by API team to track status of download-dieline');
    table.string("ai_file_url").comment('This is given by API team to track status of download-dieline');
    table.string("dxf_task_id").comment('This is given by API team to track status of download-dieline');
    table.string("dxf_file_url").comment('This is given by API team to track status of download-dieline');
    table.timestamps(true, true);
  });
};

exports.down = async function (knex) {
  await knex.schema.dropTableIfExists("dieline_downloads");
  await knex.schema.dropTableIfExists("user_subscriptions");
  await knex.schema.dropTableIfExists("subscriptions");
  await knex.raw("DROP TYPE IF EXISTS subscription_type");
  await knex.raw("DROP TYPE IF EXISTS order_status_enum");
};
