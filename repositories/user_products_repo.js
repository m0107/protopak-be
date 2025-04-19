"use strict";

const { knex } = require("../data/knex/index.js");
const { v4: uuidv4 } = require("uuid");

const constants = {
  name: "user_products",
  id1: "user_products_id",
  id2: "username",
  id3: "role_id",
  id4: "created_at",
  id5: "updated_at",
};

exports.insertProject = (object, { trx } = {}) => {
  console.log("adding id", object);
  object.user_products_id = uuidv4();
  // object[constants.id1] = uuidv4();
  console.log("insserting...", object)
  return (trx || knex)(constants.name)
    .returning("*")
    .insert(object)
    .then((res) => {
      return res[0];
    })
    .catch((error) => {
      throw error;
    });
};

exports.updateProject = ({user_products_id, ...object}, { trx } = {}) => {
  console.log("object", object);
  return (trx || knex)(constants.name)
    .where({ user_products_id })
    .update(object)
    .then((res) => {
      console.log("knex updateProduct", res);
      return res[0];
    })
    .catch((error) => {
      throw error;
    });
};

exports.findProductByFilter = (filter) => {
  return (knex)(constants.name)
    .where(filter)
    .select("*")
    .first()
    .catch((error) => {
      throw error;
    });
};

// exports.readAdminUserById = (id, idNumber = "id1", { trx } = {}) => {
//   return (
//     (trx || knexRead)(constants.name)
//       .where({ [`${constants[idNumber]}`]: id })
//       // .join("roles as r", "admin_users.role_id", "r.role_id")
//       .where({ is_deleted: false })
//       .select("*")
//       .then((res) => {
//         return res[0];
//       })
//       .catch((error) => {
//         throw error;
//       })
//   );
// };

// exports.readAdminUserByIdForEdit = (id, idNumber = "id1") => {
//   const columns = [
//     "user_id",
//     "r.role_name",
//     "r.role_id",
//     "username",
//     "email",
//     "admin_users.updated_at",
//     "admin_users.created_at",
//     "admin_users.is_deleted",
//     "admin_users.branch_id",
//     "b.branch_name",
//   ];
//   return knexRead(constants.name)
//     .where({ [`${constants[idNumber]}`]: id })
//     .join("roles as r", "admin_users.role_id", "r.role_id")
//     .leftJoin("branch as b", "admin_users.branch_id", "b.branch_id")
//     .where({ "admin_users.is_deleted": false })
//     .select(columns)
//     .then((res) => {
//       return res[0];
//     })
//     .catch((error) => {
//       throw error;
//     });
// };

// exports.readAdminUsersByRole = (role) => {
//   const columns = [
//     "user_id as value",
//     "r.role_name",
//     "r.role_id",
//     "username as label",
//     "email",
//     "admin_users.updated_at",
//     "admin_users.loggedout_at",
//     "admin_users.created_at",
//     "admin_users.is_deleted",
//     "admin_users.branch_id",
//   ];
//   return (
//     knexRead(constants.name)
//       .join("roles as r", "admin_users.role_id", "r.role_id")
//       // .whereRaw("admin_users.loggedout_at IS NULL")
//       .where({ "r.role_name": role })
//       .where({ "admin_users.is_deleted": false })
//       .select(columns)
//       .then((res) => {
//         return res;
//       })
//       .catch((error) => {
//         throw error;
//       })
//   );
// };

// exports.readAllAdminUsers = (columns = "*", { columnName = "created_at", order = "desc" } = {}) => {
//   return knexRead(constants.name)
//     .where({ is_deleted: false })
//     .select(columns)
//     .orderBy(columnName, order)
//     .catch((error) => {
//       throw error;
//     });
// };

// exports.updateAdminUser = (searchObj, object) => {
//   return knex(constants.name)
//     .returning("*")
//     .where(searchObj)
//     .update(object)
//     .then((res) => {
//       return res[0];
//     })
//     .catch((error) => {
//       throw error;
//     });
// };

// exports.deleteAdminUser = (searchObj) => {
//   const object = { is_deleted: true };
//   return knex(constants.name)
//     .returning("*")
//     .where(searchObj)
//     .update(object)
//     .then((res) => {
//       return res[0];
//     })
//     .catch((error) => {
//       throw error;
//     });
// };

// exports.getAdminUserDataForDashboard = async ({
//   limit = 10,
//   skip = 0,
//   order = "created_at",
//   dir = "asc",
//   searchText = null,
//   userId = null,
// } = {}) => {
//   const columns = [
//     "admin_users.user_id",
//     "r.role_id",
//     "r.role_name",
//     "username",
//     "email",
//     "admin_users.updated_at",
//     "admin_users.created_at",
//     "admin_users.is_deleted",
//   ];
//   let query;
//   query = knexRead.select(columns).from(constants.name).join("roles as r", "admin_users.role_id", "r.role_id").where({
//     "admin_users.is_deleted": false,
//   });
//   if (userId) {
//     query = query.where("admin_users.user_id", userId);
//   }
//   if (searchText) {
//     query = query.whereRaw("admin_users.username ILIKE ? OR r.role_name ILIKE ?", [
//       `%${searchText}%`,
//       `%${searchText}%`,
//     ]);
//   }
//   query = query.groupBy(["admin_users.user_id", "r.role_id", "r.role_name"]);
//   query = query.limit(limit).offset(skip).orderBy(order, dir);
//   if (userId) {
//     query = query.first();
//   }
//   return await query;
// };

// exports.getAllAdminUsersCount = async () => {
//   return await knexRead.select(knexRead.raw(`count(*) as count`)).from(constants.name).where({
//     "admin_users.is_deleted": false,
//   });
// };

// exports.getAdminUserDataWithRole = (username, { columnName = "updated_at", order = "desc" } = {}) => {
//   const columns = [
//     "user_id",
//     "r.role_name",
//     "r.role_id",
//     "username",
//     "admin_users.password",
//     "admin_users.updated_at",
//     "admin_users.created_at",
//     "admin_users.is_deleted",
//   ];
//   return knexRead(constants.name)
//     .select(columns)
//     .join("roles as r", "admin_users.role_id", "r.role_id")
//     .where({
//       "admin_users.is_deleted": false,
//       "admin_users.username": username,
//     })
//     .orderBy(columnName, order)
//     .then((res) => {
//       return res[0];
//     });
// };

// exports.getAdminUserLogsData = async () => {
//   let result = await knexRead
//     .select([
//       "aul.version",
//       "aul.username",
//       "au1.username as created_by",
//       "au2.username as updated_by",
//       "aul.created_at",
//       "aul.updated_at",
//     ])
//     .from("admin_users_logs as aul")
//     .leftJoin("admin_users as au1", knexRead.raw("CAST(aul.created_by as uuid) = au1.user_id"))
//     .leftJoin("admin_users as au2", knexRead.raw("CAST(aul.updated_by as uuid) = au2.user_id"))
//     .union(async (qb) => {
//       qb.select([
//         knexRead.raw("(select MAX(version)+1 from admin_users_logs) as version"),
//         "au.username",
//         "au1.username as created_by",
//         "au2.username as updated_by",
//         "au.created_at",
//         "au.updated_at",
//       ])
//         .from("admin_users as au")
//         .leftJoin("admin_users as au1", knexRead.raw("CAST(au.created_by as uuid) = au1.user_id"))
//         .leftJoin("admin_users as au2", knexRead.raw("CAST(au.updated_by as uuid) = au2.user_id"));
//     })
//     .orderBy("version", "asc");
//   // console.log(result);
//   return result;
// };

// exports.getUserByLeastLoginTime = ({ type = "banker", userId }) => {
//   let columns = ["user_id", "username", "last_login"];
//   let query = knexRead
//     .select(columns)
//     .from(constants.name)
//     .join("roles as r", "r.role_id", "admin_users.role_id")
//     .whereRaw(
//       `EXTRACT (day from age(last_login, now())) between ? and ? and r.role_name ILIKE ? and admin_users.user_id != ? and loggedout_at IS NULL and admin_users.is_deleted = ?`,
//       [0, 1, `%${type}%`, userId, false]
//     )
//     .orderBy("last_login", "asc")
//     .first();
//   // console.log(query.toString());
//   return query;
// };

// exports.getAdminUserLoginStatus = async (role_name) => {
//   const columns = [
//     "admin_users.user_id",
//     "username",
//     "email",
//     knexRead.raw(
//       `(CASE WHEN extract(epoch from now() - last_login) < ${process.env.REFRESH_TOKEN_EXPIRY} THEN true else false  END) as is_logged_in`
//     ),
//   ];
//   let query = knexRead.select(columns).from(constants.name).join("roles as r", "r.role_id", "admin_users.role_id");
//   query = query.where({ "r.role_name": role_name });
//   // query = query.where({ "admin_users.loggedout_at": null });
//   return query;
// };

// exports.getLoggedInBankersData = (exclude_banker_id = null) => {
//   try {
//     let columns = [
//       "au.user_id",
//       "au.username",
//       "au.last_login",
//       "au.loggedout_at",
//       knexRead.raw("count(w.transaction_id)::integer as pending_tasks"),
//     ];
//     columns.push(
//       knexRead.raw(`(
//       CASE
//           WHEN extract(
//               epoch
//               from
//                   now() - last_login
//           ) < ${parseInt(process.env.REFRESH_TOKEN_EXPIRY || 86400)}
//           and loggedout_at IS NULL
//           THEN true
//           else false
//       END
//   ) as is_logged_in`)
//     );
//     let query = knexRead
//       .select(columns)
//       .from("admin_users as au")
//       .join("roles as r", knexRead.raw("r.role_id = au.role_id and r.role_name = ?", ["Banker"]))
//       .leftJoin(
//         "withdraw as w",
//         knexRead.raw(
//           `w.assigned_to = au.user_id and w.status = ?
//           /*and ${knexRead.raw("w.created_at::date = now()::date")}*/
//           `,
//           ["to-pay"]
//         )
//       )
//       .whereRaw(
//         `(
//         CASE
//             WHEN extract(
//                 epoch
//                 from
//                     now() - last_login
//             ) < ${parseInt(process.env.REFRESH_TOKEN_EXPIRY || 86400)}
//             and loggedout_at IS NULL
//             THEN true
//             else false
//         END
//       ) = ?`,
//         [true]
//       );
//     query = query.groupBy("au.user_id").orderBy("pending_tasks", "asc");
//     if (exclude_banker_id) {
//       query = query.whereRaw(`au.user_id != ?`, [exclude_banker_id]);
//       return query;
//     }
//     let baseQuery = knexRead(query.as("tmp")).whereRaw("pending_tasks < ?", [
//       parseInt(process.env.PAYER_DEFAULT_TASKS_LIMIT),
//     ]);
//     // console.log(baseQuery.toString());
//     return baseQuery;
//   } catch (err) {
//     console.log(err);
//   }
// };

// exports.readFirstAdminUser = () => {
//   const query = knexRead(constants.name).select(["user_id"]).where({ is_deleted: false }).first();
//   return query;
// };

// exports.getReaderHealth = () => {
//   return knexRead(constants.name).select(["user_id"]).first();
// };

// exports.getWriterHealth = () => {
//   return knex(constants.name).select(["user_id"]).first();
// };
