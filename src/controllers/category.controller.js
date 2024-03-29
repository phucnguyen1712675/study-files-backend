const httpStatus = require('http-status');
const ApiError = require('../utils/ApiError');
const catchAsync = require('../utils/catchAsync');
const { categoryService, subCategoryService } = require('../services');

const createCategory = catchAsync(async (req, res) => {
  const category = await categoryService.createCategory(req.body);
  res.status(httpStatus.CREATED).send(category);
});

const getCategories = catchAsync(async (req, res) => {
  const result = await categoryService.queryCategories();
  res.send(result);
});

const getCategory = catchAsync(async (req, res) => {
  const category = await categoryService.getCategoryById(req.params.categoryId);
  if (!category) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Category not found');
  }
  res.send(category);
});

const updateCategory = catchAsync(async (req, res) => {
  const category = await categoryService.updateCategoryById(req.params.categoryId, req.body);
  res.send(category);
});

const deleteCategory = catchAsync(async (req, res) => {
  const subCategories = await subCategoryService.getSubCategoriesByCategoryId(req.params.categoryId);
  if (subCategories.length !== 0) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'cannot delete because of exists sub categories');
  }
  await categoryService.deleteCategoryById(req.params.categoryId);
  res.status(httpStatus.NO_CONTENT).send();
});

const getCategoriesDetails = catchAsync(async (req, res) => {
  const result = await categoryService.getCategoriesDetails();
  res.send(result);
});

module.exports = {
  createCategory,
  getCategories,
  getCategory,
  updateCategory,
  deleteCategory,
  getCategoriesDetails,
};
