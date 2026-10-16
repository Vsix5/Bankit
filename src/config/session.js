import session from 'express-session';

if(!process.env.SESSION_SECRET) {
    throw new Error('SESSION_SECRET environment variable is required');

}

const sessionMiddleware = session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
        httpOnly: true,
        secure:process.env.NODE_ENV === 'production',
        sameSite: 'lax'
    }
})

export default sessionMiddleware;