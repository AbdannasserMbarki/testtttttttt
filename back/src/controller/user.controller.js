import {User} from '../models/user.model.js';

const regesterUser = async (req, res) => {
    try {
        const {username, email, password, isadmin} = req.body;

        // Check required fields
        if(!username || !email || !password){
            console.log(req.body);
            return res.status(400).json({message: "username, email and password are required"});
        }

        // Check if user already exists
        const existing = await User.findOne( {email: email.toLowerCase()}  )
        if(existing){
            return res.status(400).json({message: "User already exists"});
        }

        // Create new user
        const newUser = await User.create({
            username: username.toLowerCase(),
            email: email.toLowerCase(),
            password,
            isadmin: isadmin || false
        });
        return res.status(201).json({
            message: "User registered successfully", 
            newUser:{
                id: newUser._id,
                username: newUser.username,
                email: newUser.email,
                password: newUser.password,
                isadmin: newUser.isadmin,}
            });
        


    } catch (error) {
        return res.status(500).json({message: "Server error :", error: error.message});

    }};

const authUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: "email and password are required" });
        }

        const user = await User.findOne({ email: email.toLowerCase() });
        if (!user) {
            return res.status(400).json({ message: "Invalid email or password" });
        }
        if (user.password !== password) {
            return res.status(400).json({ message: "Invalid email or password" });
        }

        return res.status(200).json({
            message: "User authenticated successfully",
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
                isadmin: user.isadmin
            }
        });

    } catch (error) {
        return res.status(500).json({ message: "Server error :", error: error.message });
    }
};

const getAllUsers = async (req, res) => {
    try {
        const users = await User.find().select("-password");

        return res.status(200).json({
            message: "Users fetched successfully",
            users
        });
    } catch (error) {
        return res.status(500).json({message: "Server error :", error: error.message});
    }
};

const getUserById = async (req, res) => {
    try {
        const {id} = req.params;

        const user = await User.findById(id).select("-password");
        if(!user){
            return res.status(404).json({message: "User not found"});
        }

        return res.status(200).json({
            message: "User fetched successfully",
            user
        });
    } catch (error) {
        return res.status(500).json({message: "Server error :", error: error.message});
    }
};

const updateUserById = async (req, res) => {
    try {
        const {id} = req.params;
        const {username, email, password, isadmin} = req.body;

        const user = await User.findById(id);
        if(!user){
            return res.status(404).json({message: "User not found"});
        }

        if(username !== undefined){
            user.username = username.toLowerCase();
        }
        if(email !== undefined){
            const existing = await User.findOne({email: email.toLowerCase(), _id: {$ne: id}});
            if(existing){
                return res.status(400).json({message: "Email already in use"});
            }
            user.email = email.toLowerCase();
        }
        if(password !== undefined){
            user.password = password;
        }
        if(isadmin !== undefined){
            user.isadmin = isadmin;
        }

        await user.save();

        return res.status(200).json({
            message: "User updated successfully",
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
                isadmin: user.isadmin
            }
        });
    } catch (error) {
        return res.status(500).json({message: "Server error :", error: error.message});
    }
};

const deleteUserById = async (req, res) => {
    try {
        const {id} = req.params;

        const deleted = await User.findByIdAndDelete(id);
        if(!deleted){
            return res.status(404).json({message: "User not found"});
        }

        return res.status(200).json({
            message: "User deleted successfully",
            user: {
                id: deleted._id,
                username: deleted.username,
                email: deleted.email,
                isadmin: deleted.isadmin
            }
        });
    } catch (error) {
        return res.status(500).json({message: "Server error :", error: error.message});
    }
};







export {
    regesterUser,
    getAllUsers,
    getUserById,
    updateUserById,
    deleteUserById,
    authUser
}