const { User } = require('../models');

const findByEmail = (email) =>
  User.scope('withPassword').findOne({ where: { email } });

const findById = (id) => User.findByPk(id);

const create = (data) => User.create(data);

const toAPIResponse = (user) => {
  if (!user) return null;
  
  const { id, name, email, role, createdAt, updatedAt } = user;
  return {
    id,
    name,
    email,
    role,
    createdAt,
    updatedAt,
  };
};

module.exports = { findByEmail, findById, create, toAPIResponse };
