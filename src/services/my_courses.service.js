const httpStatus = require('http-status');
const { MyCourse } = require('../models');
const ApiError = require('../utils/ApiError');

/**
 * create a myCourse // add a course to a student Mycourse
 * @param {Object} myCourseBody
 * @returns {Promise<MyCourse>}
 */
const createMyCourse = async (myCourseBody) => {
  if (await MyCourse.isExists(myCourseBody.courseId, myCourseBody.studentId)) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Already exists');
  }

  const newMyCourse = {
    ...myCourseBody,
    created_at: Date.now(),
  };

  const myCourse = await MyCourse.create(newMyCourse);
  return myCourse;
};

/**
 * get all courses of student
 * @param {ObjectId} studentId
 * @returns {Promise<QueryResult>}
 */
const getAllMyCourseOfStudent = async (studentId) => {
  const allMyCourse = await MyCourse.find({ studentId });
  return allMyCourse;
};

/**
 * Query for myCourse
 * @param {Object} filter - Mongo filter
 * @param {Object} options - Query options
 * @param {string} [options.sortBy] - Sort option in the format: sortField:(desc|asc)
 * @param {number} [options.limit] - Maximum number of results per page (default = 10)
 * @param {number} [options.page] - Current page (default = 1)
 * @returns {Promise<QueryResult>}
 */
const queryMyCourse = async (filter, options) => {
  const resultMyCourse = await MyCourse.paginate(filter, options);
  return resultMyCourse;
};

/**
 * get my course by myCourseId
 * @param {ObjectId} id
 * @returns {Promise<MyCourse>}
 */
const getMyCourseById = async (id) => {
  return MyCourse.findById(id);
};

/**
 * delete my course by id
 * @param {ObjectId} myCourseId
 * @returns {Promise<MyCourse>}
 */
const deleteMyCourseById = async (myCourseId) => {
  const myCourse = await getMyCourseById(myCourseId);
  if (!myCourse) {
    throw new ApiError(httpStatus.NOT_FOUND, 'my course not found');
  }
  await myCourse.remove();
  return myCourse;
};

/**
 * get top course by myCourseId
 * @param {number} limit
 * @param {Date} fromDate
 * @return {Promise<Object>}
 */
const getMostOutstandingCourses = async (limit, fromDate) => {
  const results = await MyCourse.aggregate([
    {
      $match: { created_at: { $gte: new Date(fromDate), $lt: Date.now } },
    },
    { $group: { _id: '$courseId', count: { $sum: 1 } } },
    { $sort: { count: -1 } },
  ]).limit(limit);
  return results;
};

/**
 * get top sub categories by myCourseId
 * @param {number} limit
 * @param {Date} fromDate
 * @return {Promise<Object>}
 */
const getMostSaleSubCategories = async (limit, fromDate) => {
  const results = await MyCourse.aggregate([
    {
      $match: { created_at: { $gte: new Date(fromDate), $lt: Date.now } },
    },
    { $project: { courseObjId: { $toObjectId: '$courseId' } } },
    {
      $lookup: {
        localField: 'courseObjId',
        from: 'courses',
        foreignField: '_id',
        as: 'course',
      },
    },
    {
      $replaceRoot: { newRoot: { $mergeObjects: [{ $arrayElemAt: ['$course', 0] }, '$$ROOT'] } },
    },
    { $project: { course: 0 } },
    { $group: { _id: '$subCategoryId', count: { $sum: 1 } } },
    { $sort: { count: -1 } },
  ]).limit(limit);
  return results;
};

module.exports = {
  createMyCourse,
  getAllMyCourseOfStudent,
  getMyCourseById,
  queryMyCourse,
  deleteMyCourseById,
  getMostOutstandingCourses,
  getMostSaleSubCategories,
};
