const student= require('./../models/student');
const complaint=require('./../models/complaint');
const notice=require('./../models/notice');
const sendEmail=require('./../services/emailService');
const { uploadToCloudinary } = require('../config/cloudinary');
const worker=require('./../models/worker');


// care taker get all complaints

const getAllComplaints=async(caretakerId)=>{
  const ct=await student.findById(caretakerId);
  if(!ct)throw { statusCode: 404, message: 'token expired' };
  const hostel=ct.hostel;
  const complaints=await complaint.find({hostel:hostel}).populate('student','name room hostel mobNo').populate('worker').sort({createdAt:-1});

  complaints.sort((a,b)=>{
    if(a.status==='pending'  && b.status!=='pending') return -1;
    if(a.status!=='pending'  && b.status==='pending') return 1;
    return 0;

  });
  return complaints;
}


//add workers to their databases

const addWorker=async(caretakerId,workerData)=>{
  const ct=await student.findById(caretakerId);
  if(!ct)throw { statusCode: 404, message: 'token expired' };
  const hostel=ct.hostel;
  let photoUrl = null;
  if (workerData.photoBase64) {
    photoUrl = await uploadToCloudinary(workerData.photoBase64, 'worker_profiles');
  }
  const newWorker=new worker({
    ...workerData,
    hostel:hostel,
    image:photoUrl
  });
  
  await newWorker.save();
  return { message: "worker added successfully", worker: newWorker };


}


// delete worker

const deleteWorker=async(workerId)=>{
  const deletedWorker = await worker.findByIdAndDelete(workerId);
  if (!deletedWorker) throw { statusCode: 404, message: "Worker not found" };      
  return { message: "Worker deleted successfully" } ;
}

// update worker data
const updateWorker=async(workerId,updateData)=>{

  // If caretaker uploaded a NEW photo during edit
  if (updateData.photoBase64) {
    updateData.image = await uploadToCloudinary(updateData.photoBase64, 'worker_profiles');
  }

  const updatedWorker = await worker.findByIdAndUpdate(workerId, updateData, { new: true });
  if (!updatedWorker) throw { statusCode: 404, message: "Worker not found" };

  return { message: "Worker updated", worker: updatedWorker };
}


// view workers by category

const viewWorkersByCategory=async(caretakerId,category)=>{
  const ct=await student.findById(caretakerId);
  if(!ct)throw { statusCode: 404, message: 'token expired' };
  const hostel=ct.hostel;


  const filter={hostel:hostel};
  if(category){
    filter.category=category;
  }

  const workers=await worker.find(filter);
  return workers;


};


// assign worker to complaint and update complaint status
const assignWorkerToComplaint=async(caretakerId,complaintId,workerId)=>{

  const ct=await student.findById(caretakerId);
  if(!ct)throw { statusCode: 404, message: 'token expired' };
  const hostel=ct.hostel;


  const comp=await complaint.findById(complaintId).populate('student');
  if(!comp) throw { statusCode: 404, message: "complaint not found" };

  const workers=await worker.findById(workerId);
  if(!workers) throw { statusCode: 404, message: "worker not found" };

  if(comp.status==='assigned') throw { statusCode: 400, message: "worker already assigned" };
  if(comp.status==='resolved') throw { statusCode: 400, message: "complaint already resolved" };
  comp.status='assigned';
  comp.worker = workerId;
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


  return { message: "Worker Assigned Successfully", comp };


};


// resolve complaint
const resolveComplaint=async(complaintId)=>{

  const comp=await complaint.findById(complaintId).populate('student');
  if(!comp) throw { statusCode: 404, message: "complaint not found" };

  if(comp.status==='resolved') throw { statusCode: 400, message: "complaint already resolved" };

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

  return { message: "Complaint resolved successfully", comp };

}


// upload notice
const uploadNotice=async(hostel,noticeData)=>{
  let imageUrl = null;

  // Check for the base64 string
  if (noticeData.photoBase64) {
    imageUrl = await uploadToCloudinary(noticeData.photoBase64, 'notices');
  }
  const newNotice=new notice({
    title: noticeData.title,
    description: noticeData.description,
    image: imageUrl,
    hostel: hostel
  });
  
  await newNotice.save();
  return { message: "notice uploaded", newNotice };


}

// view notice
const viewNotices=async(caretakerId)=>{
 const user=await student.findById(caretakerId);
  if(!user)throw { statusCode: 404, message: 'token expired' };

  const notices=await notice.find({hostel:user.hostel}).sort({createdAt:-1});

  return notices;
}


// delete notice
const deleteNotice=async(noticeId)=>{
  const response=await notice.findByIdAndDelete(noticeId);
  if(!response) return { error: "notice not found" };
  return { message: "notice deleted successfully" };
}


// get profile of caretaker
const getCaretakerProfile=async(user)=>{
  return ({ 
    name: user.name, 
    email: user.email, 
    hostel: user.hostel,
    mobNo: user.mobNo 
  });

}



module.exports={
  getAllComplaints,
  addWorker,
  deleteWorker,
  updateWorker,
  viewWorkersByCategory,
  assignWorkerToComplaint,
  resolveComplaint,
  uploadNotice,
  viewNotices,
  deleteNotice,
  getCaretakerProfile
}

