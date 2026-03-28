const httpStatus = require('http-status');
const AuthService = require('../services/auth.service');
const MESSAGES = require('../../constants/messages');

exports.register = async (req, res, next) => {
  try {
    const result = await AuthService.register(req.body);
    res.status(httpStatus.CREATED).json(result);
  } catch (err) {
    next(err);
  }
};

exports.login = async (req, res, next) => {
  try {
    const result = await AuthService.login(req.body);
    res.status(httpStatus.OK).json(result);
  } catch (err) {
    next(err);
  }
};

exports.logout = (req, res) => {
  res.status(httpStatus.OK).json({ message: MESSAGES.AUTH.LOGGED_OUT });
};

exports.me = (req, res) => {
  const { id, name, email, role } = req.user;
  res.status(httpStatus.OK).json({ user: { id, name, email, role } });
};
