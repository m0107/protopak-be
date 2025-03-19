const dropColumns = async ({ knex, tableName, columns }) => {
  for (let i = 0; i < columns.length; i++) {
    const col = columns[i];
    if (await knex.schema.hasColumn(tableName, col)) {
      await knex.schema.alterTable(tableName, async (table) => {
        table.dropColumn(col);
      });
    }
  }
};

module.exports = {
  dropColumns,
};
