import mongoose from 'mongoose';

const { Schema } = mongoose;

// Login Schema
const loginSchema = new Schema({
  sno: {
    type: Number,
    unique: true,
    required: true
  },
  userName: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  Pwd: {
    type: String,
    required: true
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    required: true
  }
}, { collection: 'login' }); // Explicitly define the collection name as 'login'

// Employee Schema
const employeeSchema = new Schema({
  Id: {
    type: Number,
    required: true,
    unique: true
  },
  Image: {
    type: String,
    },

  Name: {
    type: String,
    required: true
  },
  Email: {
    type: String,
    required: true
  },
  Mobile: {
    type: String,
    required: true
  },
  Designation: {
    type: String,
    enum: ['HR', 'Sales', 'Manager'],
    required: true
  },
  gender: {
    type: String,
    enum: ['M', 'F'],
    required: true
  },
  Course: {
    type: String,
    enum: ['MCA', 'BCA', 'BSC'],
    required: true
  },
  Createdate: {
    type: Date,
    default: Date.now,
    required: true,
  }
}, { collection: 'Employee' }); // Explicitly define the collection name as 'Employee'

export const login = mongoose.model('login', loginSchema);
export const Employee = mongoose.model('Employee', employeeSchema);
