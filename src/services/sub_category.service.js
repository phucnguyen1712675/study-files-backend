/* eslint-disable no-unused-vars */
const httpStatus = require('http-status');
const { SubCategory, Course, Category } = require('../models');
const ApiError = require('../utils/ApiError');

/**
 * create a sub category
 * @param {Object} subCategoryBody
 * @returns {Promise<SubCategory>}
 */
const createSubCategory = async (subCategoryBody) => {
  if (await SubCategory.isNameTaken(subCategoryBody.name)) {
    throw new ApiError(httpStatus.BAD_REQUEST, ' Name already taken');
  }
  const subCategory = await SubCategory.create(subCategoryBody);
  const result = await SubCategory.findById(subCategory.id).populate({ path: 'category', select: 'name' });
  return result;
};

/**
 * query for sub categories
 * @returns {Promise<QueryResult>}
 */
const querySubCategories = async () => {
  const subCategories = await SubCategory.find()
    .sort({ subscriberNumber: 'desc' })
    .populate({ path: 'category', select: 'name' });
  return subCategories;
};

/**
 * get sub category by subcategoryId
 * @param {ObjectId} id
 * @returns {Promise<SubCategory>}
 */
const getSubCategoryById = async (id) => {
  // return SubCategory.findById(id);
  return SubCategory.findById(id).populate({ path: 'category', select: 'name' });
};

/**
 * get sub category by name
 * @param {String} name
 * @return {Promise<SubCategory>}
 */
const getSubCategoryByName = async (name) => {
  return SubCategory.findOne({ name });
};

/**
 * get sub categories by categoryId
 * @param {ObjectId} categoryId
 * @returns {Promise<QueryResult>}
 */
const getSubCategoriesByCategoryId = async (categoryId) => {
  const subCategories = await SubCategory.find({ categoryId });
  return subCategories;
};

/**
 * update sub category by id
 * @param {ObjectId} subCategoryId
 * @param {object} updateBody
 * @returns {Promise<SubCategory>}
 */
const updateSubCategoryById = async (subCategoryId, updateBody) => {
  const subCategory = await getSubCategoryById(subCategoryId);
  if (!subCategory) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Sub category not found');
  }
  if (updateBody.name && (await SubCategory.isNameTaken(updateBody.name, subCategoryId))) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Name already taken');
  }
  if (updateBody.categoryId && !(await Category.findById(updateBody.categoryId))) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Cannot find categoryId');
  }
  Object.assign(subCategory, updateBody);
  await subCategory.save();
  const result = await SubCategory.findById(subCategory.id).populate({ path: 'category', select: 'name' });
  return result;
};

/**
 * increase sub category subcriberNumber
 * @param {ObjectId} subCategoryId
 * @returns {Promise<SubCategory>} result
 */
const increaseSubcriberNumberSubCategory = async (subCategoryId) => {
  const subCategory = await getSubCategoryById(subCategoryId);
  if (!subCategory) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Sub category not found');
  }
  const newSubscriberNumber = subCategory.subscriberNumber + 1;
  Object.assign(subCategory, { subscriberNumber: newSubscriberNumber });
  await subCategory.save();
  return subCategory;
};

/**
 * increase sub category subcriberNumber by courseId
 * @param {ObjectId} courseId
 * @returns {Promise<SubCategory>} result
 */
const increaseSubcriberNumberSubCategoryBycourseId = async (courseId) => {
  const course = await Course.findById(courseId);
  const { subCategoryId } = course;
  const resultSubCategory = await getSubCategoryById(subCategoryId);
  if (!resultSubCategory) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Sub category not found');
  }
  const newSubscriberNumber = resultSubCategory.subscriberNumber + 1;
  Object.assign(resultSubCategory, { subscriberNumber: newSubscriberNumber });
  await resultSubCategory.save();
  return resultSubCategory;
};

/**
 * delete sub category by id
 * @param {ObjectId} subCategoryId
 * @returns {Promise<SubCategory>}
 */
const deleteSubCategoryById = async (subCategoryId) => {
  const subCategory = await getSubCategoryById(subCategoryId);
  if (!subCategory) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Sub category not found');
  }
  await subCategory.remove();
  return subCategory;
};

/**
 * get top sub categories by subCategoryId
 * @param {Array<ObjectId>} array
 * @return {Promise<QueryResult>}
 */
const getMostSaleSubCategories = async (array) => {
  const results = await Promise.all(
    array.map(async (item) => {
      const subCate = await SubCategory.findById(item._id).populate({ path: 'category', select: 'name' }).lean();

      const result = {
        ...subCate,
        count: item.count,
      };

      return result;
    })
  );
  return results;
};

module.exports = {
  createSubCategory,
  querySubCategories,
  getSubCategoriesByCategoryId,
  increaseSubcriberNumberSubCategory,
  increaseSubcriberNumberSubCategoryBycourseId,
  getSubCategoryById,
  getSubCategoryByName,
  deleteSubCategoryById,
  updateSubCategoryById,
  getMostSaleSubCategories,
};
