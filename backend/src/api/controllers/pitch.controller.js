const httpStatus = require('http-status');
const { Pitch } = require('../models');

exports.getAll = async (req, res, next) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;
    
    const { count, rows: pitches } = await Pitch.findAndCountAll({
      limit: parseInt(limit, 10),
      offset: parseInt(offset, 10),
      order: [['name', 'ASC']],
    });

    const result = {
      pitches,
      pagination: {
        currentPage: parseInt(page, 10),
        totalPages: Math.ceil(count / limit),
        totalItems: count,
        itemsPerPage: parseInt(limit, 10),
      },
    };

    res.status(httpStatus.OK).json(result);
  } catch (err) {
    next(err);
  }
};
