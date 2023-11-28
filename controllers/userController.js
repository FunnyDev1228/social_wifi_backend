import User from "../models/userModel.js";
import asyncHandler from "express-async-handler";
import generateToken from "../utils/generateToken.js";
import geolib from "geolib";

//@desc     Auth User & Get Token
//@route    POST api/users/login
//@access   Public
const login = asyncHandler(async (req, res) => {
  console.log("$$$$$$$$$$", req.body);
  const { email, password } = req.body;
  const user = await User.findOne({ email });

  if (user && (await user.matchPassword(password))) {
    return res.json({
      // _id: user._id,
      // name: user.name,
      // email: user.email,
      code: 200,
      accessToken: generateToken(user._id),
      message: "SUCESS",
    });
  } else {
    res.status(401);
    throw new Error("Invalid email or Password");
  }
});

//@desc     REGISTER User & Get Token
//@route    POST api/users/register
//@access   Public
const register = asyncHandler(async (req, res) => {
  console.log("%%%%%%", req.body);
  const { username, tictok, instagram, facebook, snapchat, email, password } =
    req.body;
  const userExist = await User.findOne({ email });

  if (userExist) {
    res.status(400);
    throw new Error("User already Exist");
  }
  const location = { lat: "", lon: "" };

  const user = await User.create({
    username,
    tictok,
    instagram,
    facebook,
    snapchat,
    email,
    location,
    password,
  });

  if (user) {
    res.status(201).json({
      // _id: user._id,
      status_code: 201,
      // username: user.username,
      message: "SUCESS",
      // email: user.email,
      accessToken: generateToken(user._id),
    });
  } else {
    res.status(400);
    throw new Error("Invalid User Data");
  }
});

//@desc     Get all Users
//@route    GET api/users
//@access   Private/Admin
const getUsers = asyncHandler(async (req, res) => {
  const users = await User.find({});
  res.json(users);
});

//@desc     Update User Profile
//@route    PUT api/users/profile/:id
//@access   Private
const updateUserProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  if (user) {
    user.name = req.body.name || user.name;
    user.email = req.body.email || user.email;
    if (req.body.password) {
      user.password = req.body.password;
    }

    const updatedUser = await user.save();
    return res.json({
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,

      token: generateToken(updatedUser._id),
    });
  } else {
    res.status(404);
    throw new Error("User not Found");
  }
});

//
const searchUsers = asyncHandler(async (req, res) => {
  console.log("#$#$#$", req.body);
  const userLocation = req.body.location;
  const email = req.body.email;
  console.log("#$#$#----------", userLocation);
  const user = await User.findOne({ email });
  if (user) {
    user.location = userLocation;
    const updatedUser = await user.save();
    const nearbyUsers = await User.find(); // Fetch all users
    const usersWithinRadius = nearbyUsers.filter((user) => {
      if (user.email != email && user.location && userLocation) {
        const distance = geolib.getDistance(
          { latitude: user.location.lat, longitude: user.location.lon },
          { latitude: userLocation.lat, longitude: userLocation.lon }
        );
        return distance <= 50;
      } else {
        return false;
      }
    });
    console.log("#########", usersWithinRadius);
    res.json(usersWithinRadius);
  } else {
    res.status(404);
    throw new Error("User not found");
  }
});

export { login, register, getUsers, updateUserProfile, searchUsers };
