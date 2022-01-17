const fs = require('fs');

// READING THE RESOURCE FILE

const tours = JSON.parse(fs.readFileSync('./dev-data/data/tours-simple.json'));

const getTourWithId = (id) => tours.find((tour) => tour.id === id);

exports.checkRequestBody = (req, res, next) => {
  if (req.body.name && req.body.difficulty && req.body.duration) {
    next();
  } else {
    res.status(400).json({
      status: 'fail',
      message: 'Invalid Body',
    });
  }
};

// It is a good practice to check for errors in middleware like invaild id so the request doesn't go the the next phase! it keeps the controllers clean
exports.checkValidId = (req, res, next, val) => {
  const id = val * 1;
  const tour = getTourWithId(id);
  if (!tour)
    return res.status(404).json({
      status: 'fail',
      data: 'Invalid ID',
    });
  next();
};

exports.getTours = (req, res) => {
  res.status(200).json({
    status: 'success',
    results: tours.length,
    data: {
      tours,
    },
  });
};

exports.getTour = (req, res) => {
  const tour = getTourWithId(req.params.id * 1);
  res.json({
    status: 'success',
    data: {
      tour,
    },
  });
};

exports.updateTour = (req, res) => {
  const body = req.body;
  const tour = getTourWithId(req.params.id * 1);

  if (Object.keys(body).every((field) => Object.keys(tour).includes(field))) {
    const updatedTour = {
      ...tour,
      ...body,
    };

    res.json({
      status: 'success',
      data: {
        tour: updatedTour,
      },
    });
  } else {
    res.status(404).json({
      status: 'fail',
      message: 'Incorrect Field',
    });
  }
};

exports.deleteTour = (req, res) => {
  // const tour = getTourWithId(req.params.id * 1);
  //add logic to delete the resource
  res.status(204).json({
    //204 means no content in body
    status: 'success',
    data: null,
  });
};

exports.createTour = (req, res) => {
  const newId = tours[tours.length - 1].id + 1;

  const newTour = {
    ...tours[1],
    ...req.body,
    id: newId,
  };

  tours.push(newTour);

  fs.writeFile(
    './dev-data/data/tours-simple.json',
    JSON.stringify(tours),
    (err) => {
      res.status(201).json({
        message: 'success',
        data: {
          tour: newTour,
        },
      });
    }
  );
};
