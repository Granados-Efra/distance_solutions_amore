import User from "../models/User.js";

export const createUser = async (req, res) => {
  try {
    console.log('Body received:', req.body);
    const { username, email, password , adminPassword } = req.body;
    console.log({ username, email, password , adminPassword });

    let role = 'user';
    const isAdmin = isAdminAccount(adminPassword)

    if(isAdmin){ 
        role='admin'
    }

    // Create new user
    const user = new User({
      username,
      email,
      password,
      roles: [role]
    });

    // encrypting password
    user.password = await User.encryptPassword(user.password);

    // saving the new user
    const savedUser = await user.save();

    return res.status(200).json({message:'User created succesfully', savedUser});
  }  catch (error) {
    res.status(500).json({ error: "Error interno del servidor: " + error });
  }
};

export const getAllUsers = async (req, res) => {
  const users = await User.find();
  return res.json(users);
};

export const getUserById = async (req, res) => {
    try {
      const { id } = req.params;
      const user = await User.findById(id);
  
      if (!user) {
        return res.status(404).json({ error: 'Usuario no encontrado' });
      }
  
      return res.json(user);
    } catch (error) {
      console.error('Error al obtener el usuario por ID:', error);
      res.status(500).json({ error: 'Error interno del servidor' });
    }
};
  
const isAdminAccount = (reveivedPassword)=>{
    if(!reveivedPassword) return;
    return reveivedPassword === process.env.ADMIN_PASSWORD;
}