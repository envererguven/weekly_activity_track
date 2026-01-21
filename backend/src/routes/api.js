const express = require('express');
const router = express.Router();
const activityController = require('../controllers/activityController');
const userController = require('../controllers/userController');
const productController = require('../controllers/productController');
const adminController = require('../controllers/adminController');
const statsController = require('../controllers/statsController');
const multer = require('multer');
const upload = multer({ storage: multer.memoryStorage() });

// ... existing routes ...

// Admin / Bulk Import
router.post('/admin/import', upload.single('file'), adminController.bulkImport);


router.get('/activities/latest-week', activityController.getLatestWeek);
router.get('/activities', activityController.getAllActivities);
router.post('/activities', activityController.createActivity);
router.put('/activities/:id', activityController.updateActivity);

// Users
router.get('/users', userController.getUsers);
router.post('/users', userController.createUser);
router.put('/users/:id', userController.updateUser);
router.delete('/users/:id', userController.deleteUser);

// Products
router.get('/products', productController.getProducts);
router.post('/products', productController.createProduct);
router.put('/products/:id', productController.updateProduct);
router.delete('/products/:id', productController.deleteProduct);

// Stats
router.get('/stats', statsController.getStats);
router.get('/dashboard-stats', statsController.getDashboardStats);
router.post('/stats/summary', statsController.generateExecutiveSummary);

module.exports = router;
