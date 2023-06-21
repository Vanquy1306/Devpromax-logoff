import jwt from "jsonwebtoken";
import argon2 from "argon2";
import User from "../models/User.js";
import Role from "../models/Role.js";

export const checkUser = async (req, res) => {
  try {
    const user = await User.findById(req.userId).select("-password");
    if (!user)
      return res
        .status(400)
        .json({ success: false, message: "User not found" });
    res.json({ success: true, user });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

export const register = async (req, res) => {
  const { username, password, email, role } = req.body;
  // Simple validation
  if (!username || !password)
    return res
      .status(400)
      .json({ success: false, message: "Missing information" });
  try {
    // Check for existing user
    const user = await User.findOne({ username });
    if (user)
      return res
        .status(400)
        .json({ success: false, message: "Username already taken" });
    // All good
    const hashedPassword = await argon2.hash(password);
    const newUser = new User({
      username,
      email,
      password: hashedPassword,
      role,
    });
    // Return token
    const accessToken = jwt.sign(
      { userId: newUser._id },
      process.env.ACCESS_TOKEN_SECRET,
      { expiresIn: "2h" }
    );
    //save
    await newUser.save();
    res.json({
      msg: "Register Success!",
      success: true,
      accessToken,
      accessTokenLifeTime: jwt.decode(accessToken).exp,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

export const login = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res
      .status(400)
      .json({ success: false, message: "Missing email or password" });
  }

  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res
        .status(400)
        .json({ success: false, message: "Incorrect email or password" });
    }

    const passwordValid = await argon2.verify(user.password, password);
    if (!passwordValid) {
      return res
        .status(400)
        .json({ success: false, message: "Incorrect email or password" });
    }

    const accessToken = jwt.sign(
      {
        userId: user._id,
        email: user.email,
      },
      process.env.ACCESS_TOKEN_SECRET,
      { expiresIn: "2h" }
    );

    const refreshToken = jwt.sign(
      {
        userId: user._id,
      },
      process.env.ACCESS_TOKEN_SECRET,
      { expiresIn: "2d" }
    );

    const permissions = user.permission_id?.map(
      (item) => item.permission_detail
    );

    res.json({
      success: true,
      message: "User logged in successfully",
      accessToken,
      accessTokenLifeTime: jwt.decode(accessToken).exp,
      refreshToken,
      name: user.username,
      role: user.role_id?.role_name,
      permissions: permissions,
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

export const loginGoogle = async (req, res) => {
  try {
    const { photoURL, displayName, email } = req.body;

    const user = await User.findOne({ email }, null, { timeout: 10000 });

    if (user) {
      const accessToken = jwt.sign(
        { username: user.username },
        process.env.ACCESS_TOKEN_SECRET,
        { expiresIn: "12h" }
      );

      const refreshToken = jwt.sign(
        {
          userId: user._id,
        },
        process.env.ACCESS_TOKEN_SECRET,
        { expiresIn: "2d" }
      );

      const permissions = user.permission_id?.map(
        (item) => item.permission_detail
      );
      return res.status(200).json({
        success: true,
        message: "User logged in successfully",
        accessToken,
        accessTokenLifeTime: jwt.decode(accessToken).exp,
        refreshToken,
        role: user.role_id?.role_name,
        permissions: permissions,
      });
    } else {
      const hashedPassword = await argon2.hash("password");
      const newUser = new User({
        username: displayName,
        email: email,
        password: hashedPassword,
        avatar: photoURL,
        role: "",
        permission_id: [],
      });
      await newUser.save();

      const accessToken = jwt.sign(
        { userId: newUser._id },
        process.env.ACCESS_TOKEN_SECRET,
        { expiresIn: "12h" }
      );

      const refreshToken = jwt.sign(
        {
          userId: newUser._id,
        },
        process.env.ACCESS_TOKEN_SECRET,
        { expiresIn: "2d" }
      );

      const permissions = user.permission_id?.map(
        (item) => item.permission_detail
      );

      res.json({
        success: true,
        message: "User created successfully",
        accessToken,
        accessTokenLifeTime: jwt.decode(accessToken).exp,
        refreshToken,
        role: user.role_id.role_name,
        permissions: permissions,
      });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

export const addRole = async (req, res) => {
  const { role_id } = req.body;
  try {
    const addRole = await User.findByIdAndUpdate(req.params.id, {
      role_id: role_id,
    });
    await addRole.save();
    res.json({
      success: true,
      message: "Done !",
      user: addRole,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};
export const getRole = async (req, res) => {
  try {
    const role = await Role.find().sort([["createdAt", -1]]);
    res.json({ success: true, role });
  } catch (error) {
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};
export const addPermission = async (req, res) => {
  const { permission_id } = req.body;
  try {
    const user = await User.findById(req.params.id);
    const permission_ids = user.permission_id.map((permission_id) =>
      permission_id._id.toString()
    );
    const condition = permission_ids.includes(permission_id.toString());
    if (condition) {
      return res.status(400).json({ msg: "Permission already exists" });
    }
    const addPermission = user.permission_id.push(permission_id);
    await user.save();
    res.json({
      success: true,
      message: "Done !",
      permission: addPermission,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

export const removePermission = async (req, res) => {
  const { permission_id } = req.body;
  try {
    const user = await User.findById(req.params.id);
    // const condition = user.permission_id.includes(permission_id);
    // if (condition) {
    //   return res.status(400).json({ msg: "Permission already exists" });
    // }
    const removedPermission = user.permission_id.pop(permission_id);
    await user.save();
    res.json({
      success: true,
      message: "Done !",
      permission: removedPermission,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

export const getNewAccessToken = (req, res) => {
  const { refreshToken } = req.body;
  if (!refreshToken)
    return res
      .status(404)
      .json({ success: false, message: " Refresh token not found" });
  try {
    const decoded = jwt.verify(refreshToken, process.env.ACCESS_TOKEN_SECRET);
    const expTime = decoded.exp;
    if (Date.now() < expTime * 1000) {
      const user_id = decoded.userId;
      const accessToken = jwt.sign(
        { userId: user_id },
        process.env.ACCESS_TOKEN_SECRET,
        { expiresIn: "12h" }
      );
      return res.status(200).json({
        message: "New access token created successfully",
        accessToken,
        accessTokenLifeTime: jwt.decode(accessToken).exp,
      });
    } else {
      return res.status(400);
    }
  } catch (error) {
    console.log(error);
    return res.status(403).json({ success: false, message: "Invalid token" });
  }
};
export const ResetPass = async (req, res) => {
  try {
    const hashedPassword = await argon2.hash("password123");
    let ResetPass = {
      password: hashedPassword,
    };
    const resetPassCondition = { _id: req.params.id };
    ResetPass = await User.findByIdAndUpdate(resetPassCondition, ResetPass, {
      new: true,
    });
    if (!ResetPass)
      return res.status(401).json({
        success: false,
        message: "User Not Found",
      });

    res.json({
      success: true,
      message: "Excellent progress!",
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};
