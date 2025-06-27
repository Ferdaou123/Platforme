const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../utils/asyncHandler');
const Service = require('../models/Service');

exports.getServices = asyncHandler(async (req, res, next) => {
  res.status(200).json(res.advancedResults);
});

exports.getService = asyncHandler(async (req, res, next) => {
  const service = await Service.findById(req.params.id);

  if (!service) {
    return next(new ErrorResponse(`Service non trouvé avec l'id ${req.params.id}`, 404));
  }

  res.status(200).json({
    success: true,
    data: service
  });
});

exports.createService = asyncHandler(async (req, res, next) => {
  const service = await Service.create(req.body);

  res.status(201).json({
    success: true,
    data: service
  });
});

exports.updateService = asyncHandler(async (req, res, next) => {
  let service = await Service.findById(req.params.id);

  if (!service) {
    return next(new ErrorResponse(`Service non trouvé avec l'id ${req.params.id}`, 404));
  }

  service = await Service.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });

  res.status(200).json({
    success: true,
    data: service
  });
});

exports.deleteService = asyncHandler(async (req, res, next) => {
  const service = await Service.findById(req.params.id);

  if (!service) {
    return next(new ErrorResponse(`Service non trouvé avec l'id ${req.params.id}`, 404));
  }

  await service.deleteOne();

  res.status(200).json({
    success: true,
    data: {},
    message: 'Service supprimé avec succès'
  });
});