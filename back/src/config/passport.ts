import passport from "passport";
import { Strategy as GoogleStrategy, Profile, VerifyCallback } from "passport-google-oauth20";
import User, { IUser } from "../models/User";

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const GOOGLE_CALLBACK_URL = process.env.GOOGLE_CALLBACK_URL;

if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET || !GOOGLE_CALLBACK_URL) {
  throw new Error("Missing Google OAuth environment variables");
}

passport.use(
  new GoogleStrategy(
    {
      clientID: GOOGLE_CLIENT_ID,
      clientSecret: GOOGLE_CLIENT_SECRET,
      callbackURL: GOOGLE_CALLBACK_URL,
    },
    async (_accessToken, _refreshToken, profile: Profile, done) => {
      try {
        console.log("🟢 GOOGLE STRATEGY HIT");

        const email = profile.emails?.[0]?.value?.toLowerCase();
        if (!email) {
          console.error("❌ Google profile has no email");
          return done(null, false);
        }

        let user = await User.findOne({ email });

        if (!user) {
          user = await User.create({
            email,
            name: profile.displayName ?? null,
            googleId: profile.id,
            isEmailVerified: true, // ✅ FIXED field name
          });
        } else {
          let changed = false;

          if (!user.googleId) {
            user.googleId = profile.id;
            changed = true;
          }
          if (!user.isEmailVerified) {
            user.isEmailVerified = true; // ✅ FIXED field name
            changed = true;
          }
          if (!user.name && profile.displayName) {
            user.name = profile.displayName;
            changed = true;
          }

          if (changed) await user.save();
        }

        return done(null, user as IUser);
      } catch (err) {
        console.error("[auth] Google OAuth verify error:", err);
        return done(err as Error);
      }
    }
  )
);

export default passport;
