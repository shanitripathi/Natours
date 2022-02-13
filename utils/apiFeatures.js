module.exports = class APIFeatures {
  constructor(query, reqQuery) {
    this.query = query;
    this.reqQuery = reqQuery;
  }

  filter() {
    const queryObj = { ...this.reqQuery };
    // removing the sort limit fields and page properties from the query object
    const excludedFields = ['page', 'sort', 'limit', 'fields'];
    excludedFields.forEach((ele) => {
      return delete queryObj[ele];
    });

    // 2. Advance Filtering -     //replace all the operators with a $ in front of them

    let queryString = JSON.stringify(queryObj);
    queryString = queryString.replace(
      /\b(gte|gt|lt|lte)\b/g,
      (match) => `$${match}`
    );

    this.query = this.query.find(JSON.parse(queryString));
    return this;
  }
  sort() {
    if (this.reqQuery.sort) {
      const sortBy = this.reqQuery.sort.split(',').join('');
      this.query = this.query.sort(sortBy);
    } else {
      this.query = this.query.sort('-createdAt'); //sort by date
    }
    return this;
  }
  limitFields() {
    if (this.reqQuery.fields) {
      const fields = this.reqQuery.fields.split(',').join(' ');
      this.query = this.query.select(fields);
    } else {
      this.query = this.query.select('-__v');
    }
    return this;
  }
  pagination() {
    const page = this.reqQuery.page * 1 || 1;
    const limit = this.reqQuery.limit * 1 || 100;
    const skip = (page - 1) * limit;

    this.query = this.query.skip(skip).limit(limit); //skips the skip number and sends the limit number
    return this;
    // if (queryObj.page) {
    //   const numTours = await Tour.countDocuments();
    //   if (skip >= numTours) throw new Error('the page doesnt exist');
    // }
  }
};
