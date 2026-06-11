const express=require('express');
const router=express.Router();
const {jwtAuthMiddleware,generateToken}=require('./../middleware/jwt');
const checkStudent=require('./../middleware/checkStudent');
const StudentController=require('./../controllers/studentController');


router.use(jwtAuthMiddleware, checkStudent);
router.post('/file', StudentController.fileComplaint);
router.get('/view', StudentController.getStudentComplaints);
router.put('/profile/update', StudentController.updateProfile);
router.patch('/:compId/reopen', StudentController.reopenComplaint);
router.get('/notices', StudentController.viewNotices);
router.get('/profile', StudentController.getProfile);

module.exports=router;