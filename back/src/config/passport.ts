import passport from "passport";
import { Strategy as GoogleStrategy, type Profile, type VerifyCallback } from "passport-google-oauth20";
import User from "../models/User";

// Fail fast if required env vars are missing (prevents runtime "undefined" config)
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;

// Prefer an explicit env callback URL; fall back to your current route.
const GOOGLE_CALLBACK_URL = process.env.GOOGLE_CALLBACK_URL ?? "/api/auth/google/callback";

if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET) {
  throw new Error("Missing GOOGLE_CLIENT_ID / GOOGLE_CLIENT_SECRET environment variables.");
}

function assertNonEmptyArray<T>(arr: readonly T[]): asserts arr is readonly [T, ...T[]] {
  if (arr.length === 0) throw new Error("User.create() returned an empty array.");
}

// Normalize Mongoose create() return type (it can be Doc or Doc[] depending on overload inference)
function firstOrSelf<T>(value: T | readonly T[]): T {
  if (Array.isArray(value)) {
    if (value.length === 0) {
      throw new Error("User.create() returned an empty array.");
    }
    return value[0] as T;
  }
  return value as T;
}


passport.use(
  new GoogleStrategy(
    {
      clientID: GOOGLE_CLIENT_ID,
      clientSecret: GOOGLE_CLIENT_SECRET,
      callbackURL: GOOGLE_CALLBACK_URL,
    },
    async (_accessToken: string, _refreshToken: string, profile: Profile, done: VerifyCallback) => {
      try {
        const email = profile.emails?.[0]?.value?.toLowerCase();
        if (!email) return done(null, false);

        let user = await User.findOne({ email });

        if (!user) {
          // Work around mismatched/unfinished User typings (googleId/isVerified)
          const createPayload = {
            email,
            name: profile.displayName,
            googleId: profile.id,
            isVerified: true,
          } as const;

          // Force a stable return type (Doc | Doc[]) without TS overload noise
          const created = await (User as any).create(createPayload);
          user = firstOrSelf(created);
        } else {
          const updates: Record<string, unknown> = {};

          if (!(user as any).googleId) updates.googleId = profile.id;
          if (!(user as any).name && profile.displayName) updates.name = profile.displayName;
          if ((user as any).isVerified !== true) updates.isVerified = true;

          if (Object.keys(updates).length > 0) {
            await (User as any).updateOne({ _id: (user as any)._id }, { $set: updates });
            user = await User.findById((user as any)._id);
          }
        }

        return done(null, user ?? false);
      } catch (err) {
        return done(err as Error);
      }
    }
  )
);

// If you use sessions with passport, these prevent "Failed to serialize user".
passport.serializeUser((user: any, done) => done(null, user?.id ?? user?._id));
passport.deserializeUser(async (id: string, done) => {
  try {
    const user = await User.findById(id);
    done(null, user ?? false);
  } catch (err) {
    done(err as Error);
  }
});

export default passport;
