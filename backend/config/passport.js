const passport        = require("passport");
const GoogleStrategy  = require("passport-google-oauth20").Strategy;
const User            = require("../models/User");

// Only register Google strategy if credentials are actually set
if (
  process.env.GOOGLE_CLIENT_ID &&
  process.env.GOOGLE_CLIENT_ID !== "YOUR_GOOGLE_CLIENT_ID_HERE" &&
  process.env.GOOGLE_CLIENT_SECRET &&
  process.env.GOOGLE_CLIENT_SECRET !== "YOUR_GOOGLE_CLIENT_SECRET_HERE"
) {
  passport.use(
    new GoogleStrategy(
      {
        clientID:     process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL:  process.env.GOOGLE_CALLBACK_URL,
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          const email        = profile.emails?.[0]?.value;
          const profileImage = profile.photos?.[0]?.value;

          // 1. Check if a user with this Google ID already exists
          let user = await User.findOne({ googleId: profile.id });
          if (user) return done(null, user);

          // 2. Check if a user with the same email already exists (normal account)
          user = await User.findOne({ email });
          if (user) {
            user.googleId     = profile.id;
            user.profileImage = profileImage;
            if (!user.displayName) user.displayName = profile.displayName;
            await user.save();
            return done(null, user);
          }

          // 3. Brand new user — create from Google profile
          user = await User.create({
            email,
            displayName:  profile.displayName,
            googleId:     profile.id,
            profileImage,
            username:     email.split("@")[0],
          });

          return done(null, user);
        } catch (err) {
          return done(err, null);
        }
      }
    )
  );
  console.log("✅ Google OAuth strategy registered");
} else {
  console.warn("⚠️  Google OAuth credentials not set — /auth/google routes will return 501 until you add them to .env");
}

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (err) {
    done(err, null);
  }
});

module.exports = passport;


