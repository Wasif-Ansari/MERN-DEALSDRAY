import express from 'express';
import mongoose from 'mongoose';
import multer from 'multer';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { login, Employee } from './Models.js';

const app = express();
const port = 8081;

// Path setup for static file serving
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Connect to MongoDB
const mongoURI = 'mongodb://localhost:27017/dealsDray';
mongoose.connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true });

// Check MongoDB connection
mongoose.connection.on('connected', () => {
  console.log('Mongoose is connected to the database');
});
mongoose.connection.on('error', (err) => {
  console.error('Mongoose connection error:', err);
});
mongoose.connection.on('disconnected', () => {
  console.log('Mongoose is disconnected from the database');
});

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Multer setup for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/'); // Save the file in 'uploads/' directory
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname)); // Save file with a unique name
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // Limit file size to 10MB
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png') {
      cb(null, true); // Accept .jpeg and .png files
    } else {
      cb(new Error('Only .jpeg and .png files are allowed!'), false); // Reject other files
    }
  }
});

// Middleware for role-based access control
const roleBasedAccess = (roles) => {
  return (req, res, next) => {
    const role = req.headers['role']; // Get role from headers
    if (!role) {
      return res.status(403).json({ error: 'Role is required' });
    }
    if (roles.includes(role)) {
      return next();
    } else {
      return res.status(403).json({ error: 'Access denied' });
    }
  };
};

// Route to register a new user
app.post('/register', async (req, res) => {
  try {
    const { userName, email, Pwd, role } = req.body;

    // Validate required fields
    if (!userName || !email || !Pwd || !role) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    // Validate role
    if (!['admin', 'user'].includes(role)) {
      return res.status(400).json({ error: 'Invalid role' });
    }

    // Email validation regex
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: 'Invalid email format' });
    }

    // Check if email already exists
    const existingUser = await login.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'Email already in use' });
    }

    // Check if an admin already exists
    if (role === 'admin') {
      const adminExists = await login.findOne({ role: 'admin' });
      if (adminExists) {
        return res.status(400).json({ message: 'An admin already exists' });
      }
    }

    // Find the last sno and increment
    const lastUser = await login.findOne().sort({ sno: -1 }); // Find the user with the highest sno
    const newSno = lastUser ? lastUser.sno + 1 : 1; // Increment sno or start with 1 if no users exist

    // Create the new user with auto-incremented sno
    const newLogin = new login({
      userName,
      email,
      Pwd,
      role,
      sno: newSno, // Automatically generated sno
    });

    await newLogin.save();
    res.status(201).json({ message: 'User registered successfully', newLogin });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


// Route to login a user
app.post('/login', async (req, res) => {
  try {
    const { userName, email, Pwd } = req.body;
    if (!userName || !email || !Pwd) {
      return res.status(400).json({ error: 'All fields are required' });
    }
    const user = await login.findOne({ userName, email });
    if (!user || Pwd !== user.Pwd) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    res.status(200).json({ message: 'Login successful', user });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
app.post('/admin-dashboard/check-duplicate', async (req, res) => {
  const { Email, Mobile } = req.body;

  try {
      const emailExists = await Employee.findOne({ Email });
      const mobileExists = await Employee.findOne({ Mobile });

      if (emailExists) {
          return res.status(200).json({ exists: true, message: 'Email is already in use.' });
      }
      if (mobileExists) {
          return res.status(200).json({ exists: true, message: 'Mobile number is already in use.' });
      }

      return res.status(200).json({ exists: false });
  } catch (error) {
      return res.status(500).json({ message: 'Error checking duplicates' });
  }
});



// Route to add a new employee with file upload
app.post('/admin-dashboard/create', upload.single('Image'), async (req, res) => {
  try {
    const { Name, Email, Mobile, Designation, gender, Course } = req.body;
    if (!Name || !Email || !Mobile || !Designation || !gender || !Course) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    // Check if email or mobile number already exists
    const emailExists = await Employee.findOne({ Email });
    const mobileExists = await Employee.findOne({ Mobile });

    if (emailExists) {
        return res.status(400).json({ error: 'Email is already in use' });
    }

    if (mobileExists) {
        return res.status(400).json({ error: 'Mobile number is already in use' });
    }

    if (!Name || !Email || !Mobile || !Designation || !gender || !Course) {
        return res.status(400).json({ error: 'All fields are required' });
    }

    // Find the last Id and increment
    const lastEmployee = await Employee.findOne().sort({ Id: -1 });
    const newId = lastEmployee ? lastEmployee.Id + 1 : 1;

    // File path for the uploaded image
    let imageUrl = null;
    if (req.file) {
      imageUrl = `/uploads/${req.file.filename}`; // URL for accessing the image
    }

    // Save the employee record
    const newEmployee = new Employee({
      Id: newId,
      Name,
      Email,
      Mobile,
      Designation,
      gender,
      Course,
      Image: imageUrl,
      Createdate: new Date(),
    });

    await newEmployee.save();
    res.status(201).json({ message: 'Employee created successfully', newEmployee });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Route to get all employees
app.get('/admin-dashboard/employees-list', roleBasedAccess(['admin']), async (req, res) => {
  try {
    const employees = await Employee.find();
    res.status(200).json({ employees });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
app.get('/admin-dashboard/employees-list/:Id', roleBasedAccess(['admin']), async (req, res) => {
  const { Id } = req.params; // Correct way to access Id from req.params

  try {
    // Check if the Id is a valid ObjectId
    if (mongoose.Types.ObjectId.isValid(Id)) {
      // If valid, search by MongoDB ObjectId
      const employee = await Employee.findById(Id);
      if (!employee) {
        return res.status(404).json({ message: 'Employee not found' });
      }
      return res.status(200).json(employee);
    } else {
      // Otherwise, search by custom Id field
      const employee = await Employee.findOne({ Id });
      if (!employee) {
        return res.status(404).json({ message: 'Employee not found' });
      }
      return res.status(200).json(employee);
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Route to delete an employee
app.delete('/admin-dashboard/employees-list/delete/:Id', roleBasedAccess(['admin']), async (req, res) => {
  try {
    const { Id } = req.params;
    
    // Use your custom Id field (assuming it's a number)
    const employee = await Employee.findOneAndDelete({ Id: Number(Id) });
    
    if (!employee) {
      return res.status(404).json({ error: 'Employee not found' });
    }
    
    res.status(200).json({ message: 'Employee deleted successfully' });
  } catch (error) {
    console.error('Error deleting employee:', error); // Log the error for debugging
    res.status(500).json({ error: error.message });
  }
});

app.put('/admin-dashboard/check-duplicate', async (req, res) => {
  const { Email, Mobile } = req.body;

  try {
      const emailExists = await Employee.findOne({ Email });
      const mobileExists = await Employee.findOne({ Mobile });

      if (emailExists) {
          return res.status(200).json({ exists: true, message: 'Email is already in use.' });
      }
      if (mobileExists) {
          return res.status(200).json({ exists: true, message: 'Mobile number is already in use.' });
      }

      return res.status(200).json({ exists: false });
  } catch (error) {
      return res.status(500).json({ message: 'Error checking duplicates' });
  }
});

// Route to update an employee
app.put('/admin-dashboard/employees-list/update/:Id', upload.single('Image'), roleBasedAccess(['admin']), async (req, res) => {
  try {
      const { Id } = req.params; // This is the numeric Id
      const { Name, Email, Mobile, Designation, gender, Course } = req.body;
      // Check if email or mobile number already exists
    const emailExists = await Employee.findOne({ Email });
    const mobileExists = await Employee.findOne({ Mobile });

    if (emailExists) {
        return res.status(400).json({ error: 'Email is already in use' });
    }

    if (mobileExists) {
        return res.status(400).json({ error: 'Mobile number is already in use' });
    }

      // Find employee by number Id
      const employee = await Employee.findOne({ Id: Number(Id) }); // Convert Id to Number
      if (!employee) {
          return res.status(404).json({ error: 'Employee not found' });
      }

      // Update fields
      employee.Name = Name || employee.Name;
      employee.Email = Email || employee.Email;
      employee.Mobile = Mobile || employee.Mobile;
      employee.Designation = Designation || employee.Designation;
      employee.gender = gender || employee.gender;
      employee.Course = Course || employee.Course;

      // Update image if provided
      if (req.file) {
          employee.Image = `/uploads/${req.file.filename}`;
      }

      await employee.save();
      res.status(200).json({ message: 'Employee updated successfully', employee });
  } catch (error) {
      res.status(500).json({ error: error.message });
  }
});

// User dashboard route to fetch employee data by email
app.get('/user-dashboard', async (req, res) => {
  try {
    const { email } = req.query; // Assuming email is sent in the query

    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    // Find the user in the login table
    const user = await login.findOne({ email });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Find the employee data by matching the email
    const employeeData = await Employee.find({ Email: email });
    if (!employeeData || employeeData.length === 0) {
      return res.status(404).json({ error: 'No employee data found for this user' });
    }

    res.status(200).json(employeeData);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Serve static files from the 'uploads' directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
