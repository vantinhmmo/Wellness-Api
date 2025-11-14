import User from "../models/user.model.js";
import Subscription from "../models/subscription.model.js";
import { generateToken, verifyGoogleToken } from "../utils/token.js";

export const googleLogin = async (req, res) => {
  try {
    const { token } = req.body;
    if (!token) return res.status(400).json({ success: false, message: "Missing Google token" });

    // Verify token with Google
    const googleUser = await verifyGoogleToken(token);
    const { email, name, picture, sub } = googleUser;

    let user = await User.findOne({ email });

    if (!user) {
      user = await User.create({
        name,
        email,
        avatar: picture,
        googleId: sub,
      });

      console.log(user);
      const subscription = await Subscription.create({
        userId: user._id,
        plan: "free",
        status: "active",
      });
      user.subscription = subscription._id;
      await user.save();
    } else {
      user.name = name || user.name;
      user.avatar = picture || user.avatar;
      await user.save();
    }

    const jwtToken = generateToken(user);
    res.status(200).json({
      success: true,
      token: jwtToken,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        plan: user.subscription ? "free" : "none",
      },
    });
  } catch (err) {
    console.error(err.message);
    res.status(400).json({ success: false, message: "Google login failed" });
  }
};
