const users = require('../Models/User.js');
const bcrypt = require('bcrypt');
const jwt = require('../middleware/jwt.js');

//GETUSERS
const getallusers = async(req,res)=>{
    try{
        return res.status(200).json(users.length > 0 ? users : []);
    }catch(error){
         return res.status(500).json({
      message: 'Failed to fetch users',
      error: error.message
    });
    }
}
// SIGNUP
const Signup = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Check if user already exists
    const existingUser = users.find(u => u.email === email);
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Add user to array
    users.push({
      name,
      email,
      password: hashedPassword
    });

    return res.status(201).json({ message: 'User created successfully' });

  } catch (error) {
    return res.status(500).json({ message: 'Signup failed', error: error.message });
  }
};


// LOGIN
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user
    const user = users.find(u => u.email === email);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Compare password
    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      return res.status(401).json({ message: 'Invalid password' });
    }

    // Generate JWT
    const token = await jwt.GenerateJWTToken(user);

    return res.status(200).json({
      message: 'Login successful',
      token
    });

  } catch (error) {
    return res.status(500).json({ message: 'Login failed', error: error.message });
  }
};


module.exports = {
  Signup,
  login,
  getallusers
};
