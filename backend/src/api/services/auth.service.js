const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const httpStatus = require('http-status');
const UserRepository = require('../repositories/user.repository');
const { throwConflictError, throwUnauthorizedError } = require('../utils/errorHelper');
const { jwtSecret, jwtExpiry } = require('../../config/vars');
const MESSAGES = require('../../constants/messages');
const { BCRYPT_SALT_ROUNDS } = require('../../constants');

const generateToken = (user) =>
  jwt.sign({ sub: user.id, role: user.role }, jwtSecret, { expiresIn: jwtExpiry });

const register = async ({ name, email, password }) => {
  const existing = await UserRepository.findByEmail(email);
  if (existing) {
    throwConflictError(MESSAGES.AUTH.EMAIL_EXISTS);
  }

  const hashedPassword = await bcrypt.hash(password, BCRYPT_SALT_ROUNDS);
  const user = await UserRepository.create({ name, email, password: hashedPassword });

  const token = generateToken(user);
  return { token, user: UserRepository.toAPIResponse(user) };
};

const login = async ({ email, password }) => {
  const user = await UserRepository.findByEmail(email);
  if (!user) {
    throwUnauthorizedError(MESSAGES.AUTH.INVALID_CREDENTIALS);
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    throwUnauthorizedError(MESSAGES.AUTH.INVALID_CREDENTIALS);
  }

  const token = generateToken(user);
  return { token, user: UserRepository.toAPIResponse(user) };
};

module.exports = { register, login };
