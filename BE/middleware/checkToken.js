import jwt from "jsonwebtoken";

export const checkToken = (req, res, next) => {
  const { refreshToken } = req.body;
  if (!refreshToken)
    return res
      .status(404)
      .json({ success: false, message: " Refresh token not found" });
  try {
    const decoded = jwt.verify(refreshToken, process.env.ACCESS_TOKEN_SECRET);
    const expTime = decoded.exp;
    console.log(expTime);
    console.log(new Date.now());

    if (new Date.now() < expTime * 1000) {
      const user_id = decoded.userId;
      const accessToken = jwt.sign(
        { userId: user_id },
        process.env.ACCESS_TOKEN_SECRET,
        { expiresIn: "2d" }
      );
      req.userId = decoded.userId;
      return res
        .status(200)
        .json({ message: "New access token created successfully", accessToken });
      next();
    } else {
      req.userId = decoded.userId;
    }
  } catch (error) {
    console.log(error);
    return res.status(403).json({ success: false, message: "Invalid token" });
  }
};
