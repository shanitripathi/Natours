const Naruto = require('../models/narutoModel');

exports.getShinobis = async (req, res) => {
  try {
    //filtering
    const reqQuery = { ...req.query };
    for (key in reqQuery) {
      if (['sort', 'filter', 'select'].includes(key)) {
        delete reqQuery[key];
      }
    }
    let query = Naruto.find(reqQuery);

    //sorting;
    if (req.query.sort) {
      const sortBy = req.query.sort.split(',').join(' ');
      query = query.sort(sortBy);
    } else {
      query = query.sort('-createdAt');
    }
    const shinobis = await query;
    res.status(200).json({
      status: 'success',
      data: {
        shinobis,
      },
    });
  } catch (err) {
    console.log(err.message);
    res.status(404).json({
      status: 'fail',
      message: err,
    });
  }
};

exports.createShinobi = async (req, res) => {
  try {
    const shinobi = await Naruto.create(req.body);
    res.status(201).json({
      status: 'success',
      data: {
        shinobi,
      },
    });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: 'invalid data sent',
    });
  }
};

exports.updateShinobi = async (req, res) => {
  try {
    const shinobi = await Naruto.findByIdAndUpdate(req.params.id, req.body, {
      runValidators: true,
      new: true,
    });
    res.status(200).json({
      status: 'success',
      data: {
        shinobi,
      },
    });
  } catch (err) {
    console.log(err.message);
    res.status(401).json({
      status: 'fail',
      message: 'invalid data sent',
    });
  }
};

exports.getShinobi = async (req, res) => {
  try {
    const shinobi = await Naruto.findById(req.params.id);
    res.status(200).json({
      status: 'success',
      data: {
        shinobi,
      },
    });
  } catch (err) {
    res.status(404).json({
      status: 'fail',
      message: 'requested data not found!',
    });
  }
};

exports.deleteShinobi = async (req, res) => {
  try {
    const shinobi = await Naruto.findByIdAndDelete(req.params.id);
    res.status(204).json({
      status: 'success',
      message: 'item deleted',
    });
  } catch (err) {
    res.status(404).json({
      status: 'fail',
      message: 'requested data not found!',
    });
  }
};
