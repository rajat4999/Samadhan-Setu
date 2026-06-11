const student= require('./../models/student');
const complaint=require('./../models/complaint');
const notice=require('./../models/notice');
const sendEmail=require('./../services/emailService');
const express=require('express');
const router=express.Router();
const {jwtAuthMiddleware,generateToken}=require('./../middleware/jwt');
const checkCaretaker=require('./../middleware/checkCaretaker');
const upload=require('./../middleware/upload');
const { uploadToCloudinary } = require('../config/cloudinary');
const ReportService = require('../services/reportService');

const worker= require('./../models/worker');

// if user is caretaker then he can able to see all complaints

router.get('/view-all',jwtAuthMiddleware,checkCaretaker,async (req,res)=>{
  const id=req.user.id;
  try{
    const ct=await student.findById(id);
    if(!ct) return res.status(404).json({error:"token expired"});
    const hostel=ct.hostel;
    const complaints=await complaint.find({hostel:hostel}).populate('student','name room hostel mobNo').populate('worker').sort({createdAt:-1});

    complaints.sort((a,b)=>{
      if(a.status==='pending'  && b.status!=='pending') return -1;
      if(a.status!=='pending'  && b.status==='pending') return 1;
      return 0;

    });
    res.status(200).json(complaints);
                      

  }
  catch(err){
    res.status(500).json({error:"internal server error"});
  }

});



// add workers to their databases

router.post('/add-worker',jwtAuthMiddleware,checkCaretaker,async (req,res)=>{
  const id=req.user.id;
  const hostel=req.user.hostel;
  try{
    // const ct=await student.findById(id);
    // if(!ct) return res.status(404).json({error:"token expired"});
    let photoUrl = null;

        // If frontend sent a base64 string, upload it
        if (req.body.photoBase64) {
            photoUrl = await uploadToCloudinary(req.body.photoBase64, 'worker_profiles');
        }
    const newWorker=new worker({
      ...req.body,
      hostel:hostel,
      image:photoUrl
    });

    await newWorker.save();
    res.status(200).json({message:"worker added successfully",worker:newWorker});

  }
  catch(err){
    res.status(500).json({error:"internal server error"});
  }
});


// manage workers
router.delete('/worker/:id', jwtAuthMiddleware, checkCaretaker, async (req, res) => {
    try {
        const deletedWorker = await worker.findByIdAndDelete(req.params.id);
        if (!deletedWorker) return res.status(404).json({ error: "Worker not found" });
        
        res.status(200).json({ message: "Worker deleted successfully" });
    } catch (err) {
        res.status(500).json({ error: "Failed to delete worker" });
    }
});

router.put('/worker/:id', jwtAuthMiddleware, checkCaretaker, async (req, res) => {
    try {
        let updateData = {
            name: req.body.name,
            mobNo: req.body.mobNo,
            category: req.body.category
        };

        // If caretaker uploaded a NEW photo during edit
        if (req.body.photoBase64) {
            updateData.image = await uploadToCloudinary(req.body.photoBase64, 'worker_profiles');
        }

        const updatedWorker = await worker.findByIdAndUpdate(req.params.id, updateData, { new: true });
        if (!updatedWorker) return res.status(404).json({ error: "Worker not found" });

        res.status(200).json({ message: "Worker updated", worker: updatedWorker });
    } catch (err) {
        console.error("Update Worker Error:", err);
        res.status(500).json({ error: "Failed to update worker" });
    }
});





// view worker by category
router.get('/get-worker',jwtAuthMiddleware,checkCaretaker,async (req,res)=>{
  const id=req.user.id;
  const hostel=req.user.hostel;
  try{
    // const ct=await student.findById(id);
    // if(!ct) return res.status(404).json({error:"token expired"});

    const {category}=req.query;

    const filter={hostel:hostel};
    if(category){
      filter.category=category;
    }

    const workers=await worker.find(filter);
    res.status(200).json(workers);
  }
  catch(err){
    res.status(500).json({error:"internal server error"});
  }
})



// assigned the worker and update status 

router.patch('/:compId/assign',jwtAuthMiddleware,checkCaretaker,async(req,res)=>{

  const ctId=req.user.id;
  try{
    // const ct=await student.findById(ctId);
    // if(!ct) return res.status(404).json({error:"token expired"});

    const {compId}=req.params;
    const comp=await complaint.findById(compId).populate('student');
    if(!comp) res.status(404).json({error:"complaint not found"});

    const {workId}=req.body;
    const workers=await worker.findById(workId);
    if(!workers) return res.status(404).json({error:"worker not found"});

    if(comp.status==='assigned') return res.status(400).json({message:"worker already assigned"});
    if(comp.status==='resolved') return res.status(400).json({message:"complaint already resolved"});
    comp.status='assigned';
    comp.worker = workId;
    comp.assignAt=new Date();

    await comp.save();

    try{
      // email notification
      const subject=`Update: Worker Assigned for your Complaint`;
      const to=comp.student.email;
      const text=`Hello ${comp.student.name},\n\nA worker has been assigned to your complaint.\n\nComplaint Category: ${comp.category}\n\nWorker Name: ${workers.name}\nWorker Mobile: ${workers.mobNo}\n\nPlease be present in your room and coordinate with the worker.\n\nRegards,\nHostel Management`;
        
      await sendEmail(to,subject,text);
    }
    catch(err){
      console.log(err);
    }


    res.status(200).json({ message: "Worker Assigned Successfully", comp });

  }
  catch(err){
    console.log(err);
    res.status(500).json({error:"internal server error"});
  }


});




//routes to resolve the complaint

router.patch('/:compId/resolve',jwtAuthMiddleware,checkCaretaker,async (req,res)=>{
  try{
    const {compId}=req.params;
    const comp=await complaint.findById(compId).populate('student');
    if(!comp) res.status(404).json({error:"complaint not found"});

    if(comp.status==='resolved') return res.status(400).json({message:"complaint already resolved"});

    comp.status='resolved';
    comp.resolvedAt=new Date();
    await comp.save();

    try{
      // email notification
      const subject=`Complaint Resolved`;
      const to=comp.student.email;
      const text=`Hello ${comp.student.name},\n\nGood news! Your complaint regarding "${comp.category}" has been marked as RESOLVED.\n\nComplaint ID: ${comp._id}\nResolved Date: ${new Date().toLocaleDateString()}\n\nIf the issue persists, please contact the caretaker office.\n\nRegards,\nHostel Management`;
        
      await sendEmail(to,subject,text);
    }
    catch(err){
      console.log(err);
    }

    res.status(200).json({message:"Complaint resolved successfully",comp});
  }
  catch(err){
    res.status(500).json({error:"internal server error"});
  }

});



// routes to upload notice

router.post('/notice/upload',jwtAuthMiddleware,checkCaretaker,async(req,res)=>{
  try{

    

    const {title,description}=req.body;
    let imageUrl = null;

        // Check for the base64 string
        if (req.body.photoBase64) {
            imageUrl = await uploadToCloudinary(req.body.photoBase64, 'notices');
          }
          const newNotice=new notice({
            title,
            description,
            image:imageUrl,
            hostel:req.user.hostel
            
          });
          // console.log("Image uploaded to Cloudinary:", imageUrl);

    await newNotice.save();

    res.status(200).json({message:"notice uploaded",newNotice});
  }
  catch(err){
    res.status(500).json({error:"internal server error"});
  }
});

// view notices

router.get('/notices',jwtAuthMiddleware,checkCaretaker,async (req,res)=>{
  try{
    const stdId=req.user.id;
    const user=await student.findById(stdId);
    const notices=await notice.find({hostel:user.hostel}).sort({createdAt:-1});

    res.status(200).json(notices);


  }
  catch(err){
    res.status(500).json({error:"server error"});
  }
})



// router to delete notice 
router.delete('/notice/:notId/delete',jwtAuthMiddleware,checkCaretaker,async (req,res)=>{
  try{
    const {notId} =req.params;
    const response=await notice.findByIdAndDelete(notId);
    if(!response) return res.status(404).json({error:"notice not found"});
    res.status(200).json({message:"notice deleted successfully"});
  }
  catch(err){
    res.status(500).json({error:"internal server error"});
  }
});


// profile
router.get('/profile', jwtAuthMiddleware, checkCaretaker, async (req, res) => {
    try {
        const user = req.user; // verifyCaretaker middleware already attached this
        res.json({ 
            name: user.name, 
            email: user.email, 
            hostel: user.hostel,
            mobNo: user.mobNo 
        });
    } catch (err) {
        res.status(500).json({ error: "Server Error" });
    }
});



// generate monthly report
router.get('/report/download', jwtAuthMiddleware, checkCaretaker, async (req, res) => {
    try {
        const { month, year } = req.query;
        const hostel = req.user.hostel; // Extracted from JWT token via middleware

        if (!month || !year) {
            return res.status(400).json({ error: "Please provide both month and year" });
        }

        // Call the service to get the PDF Buffer
        const pdfBuffer = await ReportService.generateMonthlyReport(hostel, parseInt(month), parseInt(year));

        // Format the filename (e.g., SVBH_Report_10_2023.pdf)
        const filename = `${hostel}_Report_${month}_${year}.pdf`;

        // Set the required headers for PDF downloading
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
        res.setHeader('Content-Length', pdfBuffer.length);

        // Send the raw PDF buffer to the client
        res.status(200).send(pdfBuffer);

    } catch (err) {
        if (err.statusCode === 404) {
            return res.status(404).json({ message: err.message });
        }
        console.error("PDF Generation Error:", err);
        res.status(500).json({ error: "Failed to generate report" });
    }
});


module.exports=router;