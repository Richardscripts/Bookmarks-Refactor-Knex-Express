const BookmarksService = {
  getAllItems(knex) {
    return knex.select('*').from('bookmarks');
  },
  getById(knex, id) {
    return knex.from('bookmarks').select('*').where('id', id).first();
  },
  deleteItem(knex, id) {
    return knex('bookmarks').where({ id }).delete();
  },
  updateItem(knex, id, newItemFields) {
    return knex('bookmarks').where({ id }).update(newItemFields);
  },
  insertItem(knex, newItem) {
    return knex
      .insert(newItem)
      .into('bookmarks')
      .returning('*')
      .then((rows) => rows[0]);
  },
};

module.exports = BookmarksService;
