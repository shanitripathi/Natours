// This is an async function which takes in an async function as an argument and returns a promise which is then handled inside

module.exports = (fn) => {
  return async (req, res, next) => {
    try {
      await fn(req, res, next);
    } catch (err) {
      next(err);
    }
  };
};
