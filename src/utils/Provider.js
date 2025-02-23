const { Strategy: GoogleStrategy } = require("passport-google-oauth20");
const { Strategy: GitHubStrategy } = require("passport-github2");
const passport = require("passport");
const User = require("../models/user");

const connectPassport = () => {
    passport.use(new GoogleStrategy({
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: process.env.GOOGLE_CALLBACK_URL,
        scope: ["openid", "profile", "email"]
    },
        async (accessToken, refreshToken, profile, done) => {
            try {
                const user = await User.findOne({
                    googleId: profile.id
                })
                if (!user) {
                    const newUser = await User.create({
                        firstName: profile.name.givenName,
                        lastName: profile.name.familyName,
                        googleId: profile.id,
                        profilePicture: profile.photos[0].value,
                        email: profile.emails[0].value,
                        provider: "google"
                    })
                    done(null, newUser);
                } else {
                    done(null, user);
                }
            } catch (err) {
                done(err, null);
            }
        }
    ))

    passport.use(new GitHubStrategy({
        clientID: process.env.GITHUB_CLIENT_ID,
        clientSecret: process.env.GITHUB_CLIENT_SECRET,
        callbackURL: process.env.GITHUB_CALLBACK_URL,
    },
    async (accessToken, refreshToken, profile, done) => {
        try{
            const user = await User.findOne({
                githubId: profile.id
            })
            if(!user) {
                const newUser = await User.create({
                    githubId: profile.id,
                    firstName: profile.displayName.split(" ")[0],
                    lastName: profile.displayName.split(" ")[1],
                    email: profile.emails[0].value,
                    profilePicture: profile.photos[0].value,
                    socialLinks: {
                        github: profile.profileUrl,
                    },
                    provider: "github"
                })
                done(null, newUser);
            } else {
                done(null, user);
            }
        } catch(err) {
            done(err, null);
        }
    }
    ))

    

    passport.serializeUser((user, done) => {
        done(null, user.id);
    });

    passport.deserializeUser(async (id, done) => {
        const user = await User.findById(id);
        done(null, user);
    });
};

module.exports = { connectPassport };
