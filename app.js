import express from 'express';
import session from 'express-session';
import pool from './utils/db.js';
import cors from 'cors';
const app = express();

import bcrypt from 'bcrypt';
import rateLimit from 'express-rate-limit';
import { z } from 'zod';
const rounds = 10;
app.use(express.json());


const signupSchema = z.object({
  name: z.string()
    .min(2, {message: 'Name must be at least 2 characters long'})
    .max(30, {message: 'Name cannot exceed 30 characters'})
    .trim(),
   email: z.string()
     .email({message: 'Please provide a valid email address'})
     .toLowerCase()
     .trim(),
  password: z.string()
     .min(8, {message: 'Password must be at least 8 characters long'})
     .max(100, {message: 'Password is to long'})
     .regex(/[A-Z]/, {message: 'Password must contain at least one uppercase letter'})
     .regex(/[0-9]/, {message: 'Password must contain at least one number'})
     })
  
     const signinSchema = z.object({
      email: z
        .string({required_error: "Email is required"})
        .email("Invalid email format")
        .toLowerCase()
        .trim(),
        password: z
          .string({required_error: "Password is required"})
          .min(1, "Password is required")
     })
//startup check
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: process.env.NODE_ENV === 'test' ? 100 : 5,
  message: {error: 'Too many login attempts, please try again after 15 minutes'},
  standardHeaders: 'draft-8',
  legacyHeaders: false,
})

if(!process.env.SESSION_SECRET){
  console.error('FATAL ERROR: SESSION_SECRET is not defined in the environmental variables.');
  process.exit(1);
}
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax'
  }
}))
const hashingPassword = async(password) => {
    const hashedPassword = await bcrypt.hash(password, rounds)
    return hashedPassword;
   }
   
   app.use(cors({
    credentials: true,
  origin: 'http://127.0.0.1:5500'
}));

const validate = (schema) => (req, res, next) => {
  const result = schema.safeParse(req.body);
  if(!result.success){
    const formattedErrors = result.error.issues.map(err => ({
      field: err.path.join('.'),
      message: err.message
    }))
    return res.status(400).json({
      error: 'Bad Request',
      details: formattedErrors
    })
  }
  req.body = result.data;
  next()
}
app.post('/signup', validate(signupSchema), async (req, res) => {

  
  try{
      
    const { name, email, password } = req.body;
  
  const hashedPassword = await hashingPassword(password);

   const query = await pool.query(
    'INSERT INTO bankit_table(name, email, password) VALUES($1, $2, $3) RETURNING name, email',
    [name, email, hashedPassword]
   )
   console.log('Inserted user:', query.rows[0]);


   return res
             .status(201)
             .json({
              message: `Entered ${name}, ${email} are valid.`
             })
  }
  catch(error){
    if(error.code === '23505'){
      return res
                .status(409)
                .json({
                  error: 'Please use the email which is not already used'
                })
    }
    console.error(error);
    return res
              .status(500)
              .json({
                error: "Internal Server Error"
              })
  }
})

app.post('/signin', validate(signinSchema), authLimiter, async (req, res) => {
 try { 
  const { email, password }  = req.body;

 const query = await pool.query('SELECT name, email, password FROM bankit_table WHERE email = $1', [email]);

 if(query.rows.length === 0){
  return res
            .status(401)
            .json({
              error: 'Check your login details'
            })
 }

const hashedPassword = query.rows[0].password;

const loginPassword = await bcrypt.compare(password, hashedPassword);

const user = query.rows[0];


if(loginPassword){
  
  req.session.regenerate((error) => {
    if(error){
     return res
                .status(500)
                .json({
                  error: 'Could not login'
                })
    }

    req.session.user = {
    name: user.name,
    email: user.email
    }

    req.session.save((error) => {
      if(error){
        return res
                  .status(500)
                  .json({
                    error: 'Could not save the session'
                  })
      }
  return res
            .status(200)
            .json({
              message: 'Logged in successfully'
            })
            })
    })
  
  }
  else {
  return res
            .status(401)
            .json({
              error: "Check your login details"
            })

        }
      }
catch(error) {
  console.error(error);
  return res
            .status(500)
            .json({
            error: 'Internal Server Error'
            })
}
});
app.get('/dashboard', async (req, res) => {

  const user = req.session.user;

  if(!user){
    return res
              .status(401)
              .json({
                error: 'You are unauthorized, Please sign in first'
              })
  }
  return res
            .status(200)
            .json({
              user
            })
})

app.post('/logout', (req, res) => {
  req.session.destroy((err) => {

    if(err){
      return res
                .status(500)
                .json({
                  error: 'Could not logout, Please try again!'
                })
    }
    res.clearCookie('connect.sid');
    return res
              .status(200)
              .json({
                message: 'Logged out successfully'
              })
  })
})


export default app;