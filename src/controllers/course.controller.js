const httpStatus = require('http-status');
const pick = require('../utils/pick');
const ApiError = require('../utils/ApiError');
const catchAsync = require('../utils/catchAsync');
const { courseService, userService, myCourseService } = require('../services');
const { COURSE_IMAGE_UPLOAD_PRESET } = require('../constants/cloudinary');
const { cloudinary } = require('../utils/cloudinary');

const createCourse = catchAsync(async (req, res) => {
  const { teacherId } = req.body;

  const teacher = await userService.getUserById(teacherId);
  if (!teacher) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Teacher not found');
  }

  const { image } = req.body;

  const { secure_url } = await cloudinary.uploader.upload(image, {
    upload_preset: COURSE_IMAGE_UPLOAD_PRESET,
  });

  const newCourse = {
    ...req.body,
    image: secure_url,
  };

  const course = await courseService.createCourse(newCourse);
  res.status(httpStatus.CREATED).send(course);
});

const getCourses = catchAsync(async (req, res) => {
  const { query } = req.query;
  const filter = pick(req.query, ['name', 'subCategoryId', 'teacherId']);
  const options = pick(req.query, ['sortBy', 'limit', 'page']);
  const result = await courseService.queryCourses(query, filter, options);
  res.send(result);
});

const getAllCourses = catchAsync(async (req, res) => {
  const result = await courseService.getAllCourses();
  res.send(result);
});

const getCourse = catchAsync(async (req, res) => {
  const course = await courseService.getCourseById(req.params.courseId);
  if (!course) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Course not found');
  }
  courseService.increaseViewByCourseId(req.params.courseId);
  res.send(course);
});

const updateCourse = catchAsync(async (req, res) => {
  var newBody;

  if (!req.body.image) {
    newBody = { ...req.body };
  } else {
    const { image } = req.body;

    const { secure_url } = await cloudinary.uploader.upload(image, {
      upload_preset: COURSE_IMAGE_UPLOAD_PRESET,
    });

    newBody = {
      ...req.body,
      image: secure_url,
    };
  }

  const course = await courseService.updateCourseById(req.params.courseId, newBody);
  res.send(course);
});

const deleteCourse = catchAsync(async (req, res) => {
  const course = await courseService.getCourseById(req.params.courseId);
  if (!course) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Course not found');
  }
  await courseService.deleteCourseById(req.params.courseId);
  res.status(httpStatus.NO_CONTENT).send();
});

const getCourseDetails = catchAsync(async (req, res) => {
  const course = await courseService.getCourseDetailsById(req.params.courseId);
  if (!course) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Course not found');
  }
  res.send(course);
});

const getMostOutstandingCourses = catchAsync(async (req, res) => {
  const { limit, fromDate } = req.query;

  const results = await myCourseService.getMostOutstandingCourses(limit, fromDate);

  const courseIds = results.map((item) => item._id);

  const resultCourses = await courseService.getMostOutstandingCourses(courseIds);

  res.send(resultCourses);
});

module.exports = {
  createCourse,
  getAllCourses,
  getCourses,
  getCourse,
  updateCourse,
  deleteCourse,
  getCourseDetails,
  getMostOutstandingCourses,
};
