const express= require('express');
const mongoose=require('mongoose');
const bcrypt=require('bcrypt');
const crypto=require('crypto');


const studentSchema=new mongoose.Schema({
  email:{
    type: String,
    required: true,
    unique:true
  },
  password:{
    type: String,
    required: true,
    // select: false
  },
  regNo:{
    type: String,
    unique:true,
    sparse:true,
    required:function(){return this.role=='Student'}

  },
  name:{
    type: String,
    required: true
  },
  hostel:{
    type: String,
    enum: ['SVBH','Patel','Tilak','Tondon','NBH Block-A','NBH Block-B','NBH Block-C','Malviya'],
    required :true
  },
  room:{
    type: String,
    required:function(){return this.role=='Student'}
  },
  mobNo: {
    type: String,
    required: true,
    unique:true,
    validate:{
      validator: (v)=>{
        return /^[6-9]\d{9}$/.test(v);
      },
      message: props=>`{$props.value} is not a valid number`
    }
  },
  role:{
    type: String,
    enum:['Student','Caretaker'],
    default:'Student',
    required:true
  },

  resetOtp: String,
  resetOtpExpire: Date,
  lastOtpSentAt: Date
});


// hashing
studentSchema.pre('save',async function(){
  const student=this;
  if(!this.isModified('password')) return;
  try{
    const salt=await bcrypt.genSalt(10);
    const hashedPassword=await bcrypt.hash(this.password,salt);
    this.password=hashedPassword
  }
  catch(err){
    throw err;
  }
});

studentSchema.methods.comparePassword=async function(password){
  try{
    const isMatch=await bcrypt.compare(password,this.password);
    return isMatch;
  }
  catch(err){
    throw err;
  }
}


studentSchema.methods.generateOTP = function() {
  const otp = crypto.randomInt(100000, 1000000).toString();
  this.resetOtp = crypto.createHash('sha256').update(otp).digest('hex');
  this.resetOtpExpire = Date.now() + 10 * 60 * 1000;
  this.lastOtpSentAt = Date.now();
  return otp;
};




const student=mongoose.model('student',studentSchema);
module.exports=student;