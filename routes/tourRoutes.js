const express = require('express');
const tourController = require('./../controller/tourController');
const authController = require('./../controller/authController');
const router = express.Router();

// router.param('id', tourController.checkId);

// Create a checkBody middleware
// check if body contains the name and price property
//if not, send back 400 ( bad request)
// and it to the post handler stack
router
  .route('/top-5-cheap')
  .get(tourController.aliasTopTours, tourController.getAllTour);

router.route('/tour-stats').get(tourController.getTourStats);
router.route('/monthly-plan/:year').get(tourController.getMonthlyPlan);
router
  .route('/')
  .get(authController.protect, tourController.getAllTour)
  .post(tourController.createTour);

router
  .route('/:id')
  .get(tourController.getTour)
  .patch(tourController.updateTour)
  .delete(
    authController.protect,
    authController.restrictTo('admin', 'lead-guide'),
    tourController.deleteTour
  );

module.exports = router;
