import { describe, it, expect } from 'vitest';
import request from 'supertest';
import app from './app.js';
import express from 'express';
import crypto from 'crypto';
import rateLimit from 'express-rate-limit';

const testApp = express();

testApp.use(express.json());

const testRateLimit = rateLimit({
  windowMs: 2 * 60 * 1000,
  max: 2,
  message: { error: 'Too many login attempts, please try again after 5 minutes' },
  standardHeaders: 'draft-8',
  legacyHeaders: false,
});

testApp.post('/test-limit', testRateLimit, (req, res) => {
  res.status(200).json({
    message: 'OK'
  }); 
});

describe('Auth Endpoints', () => {
  
  // Verify that accessing the dashboard without a session returns 401 Unauthorized.
  it('should return 401 unauthorised when accessing dashboard without a session', async () => {
    const response = await request(app).get('/dashboard');
    expect(response.status).toBe(401);
    expect(response.body).toHaveProperty('error');
  });
  
  // Verify that a new user can successfully sign up.
  it('should return 201 successfully created a user', async () => {
    const uniqueEmail = `user_${crypto.randomUUID()}@example.com`.toLowerCase();
    
    const response = await request(app)
      .post('/signup')
      .send({
        name: 'Priyanka',
        email: uniqueEmail,
        password: 'Password123'
      });
      
    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty('message');
  });

  // Verify that signing up with an already registered email returns 409 Conflict.
  it('should return 409 conflict when trying to register with an already registered email', async () => {
    const uniqueEmail = `user_${crypto.randomUUID()}@example.com`.toLowerCase();
    
    await request(app)
      .post('/signup')
      .send({
        name: 'Pavithra',
        email: uniqueEmail,
        password: 'Password123'
      });

    const response = await request(app)
      .post('/signup')
      .send({
        name: 'Praveena',
        email: uniqueEmail,
        password: 'Password1234'
      });

    expect(response.status).toBe(409);
    expect(response.body).toHaveProperty('error');
  });

  // Verify that a registered user can successfully sign in with valid credentials.
  it('Successfully signed in', async () => {
    const uniqueEmail = `user${crypto.randomUUID()}@example.com`.toLowerCase();
    
    await request(app)
      .post('/signup')
      .send({
        name: 'Rashmi',
        email: uniqueEmail,
        password: 'Rashmi123'
      });

    const response = await request(app)
      .post('/signin')
      .send({
        name: 'Rashmi',
        email: uniqueEmail,
        password: 'Rashmi123'
      });

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('message');
  });

  // Verify that signing in with an incorrect password returns 401 Unauthorized.
  it('Password is wrong, Please enter a valid password', async () => {
    const uniqueEmail = `user${crypto.randomUUID()}@example.com`.toLowerCase();
    
    const res = await request(app)
      .post('/signup')
      .send({
        name: 'Sangeetha',
        email: uniqueEmail,
        password: 'Password123'
      });
      
    expect(res.status).toBe(201); 

    const response = await request(app)
      .post('/signin')
      .send({
        name: 'Sangeetha',
        email: uniqueEmail,
        password: 'Sangeetha123'
      });

    expect(response.status).toBe(401);
    expect(response.body).toHaveProperty('error');
  });

  // Verify that a successfully signed-in user can access the dashboard.
  it('Welcome user', async () => {
    const uniqueEmail = `user_${crypto.randomUUID()}@example.com`.toLowerCase();
    const agent = request.agent(app);
    
    const signupRes = await agent
      .post('/signup')
      .send({
        name: 'Sindhu',
        email: uniqueEmail,
        password: 'Sindhu123'
      });

    expect(signupRes.status).toBe(201);
    expect(signupRes.body).toHaveProperty('message');

    const signinRes = await agent
      .post('/signin')
      .send({
        email: uniqueEmail,
        password: 'Sindhu123'
      });

    expect(signinRes.status).toBe(200);
    expect(signinRes.body).toHaveProperty('message');

    const dashboardRes = await agent
      .get('/dashboard')
      .send({
        email: uniqueEmail
      });

    expect(dashboardRes.status).toBe(200);
    expect(dashboardRes.body).toHaveProperty('user');
    expect(dashboardRes.body.user).toHaveProperty('email', uniqueEmail);
  });

  // Verify that signing in with an invalid email format returns 400 Bad Request.
  it('Invalid Email, please check you email.', async () => {
    const res = await request(app)
      .post('/signin')
      .send({
        email: 'test@@@example.com',
        password: 'Password123'
      });

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('error');
  });

  // Verify that signing in with an unregistered email returns 401 Unauthorized.
  it('Email is not registered yet, Please signup to continue.', async () => {
    const uniqueEmail = `unknown_user_${crypto.randomUUID()}@example.com`.toLowerCase();
    
    const res = await request(app)
      .post('/signin')
      .send({
        email: uniqueEmail,
        password: 'Priya123'
      });

    expect(res.status).toBe(401);
    expect(res.body).toHaveProperty('error');
  });

  // Verify that signing up with invalid input data returns 400 Bad Request.
  it('Please check the signup inputs and try again', async () => {
    const res = await request(app)
      .post('/signup')
      .send({
        name: 'Pallavi/',
        email: 'pallavi/@example.com',
        password: 'Pallavi123/'
      });

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('error');
  });

  // Verify that a signed-in user can successfully log out.
  it('Logged out Successfully.', async () => {
    const agent = request.agent(app);
    const uniqueEmail = `user_${crypto.randomUUID()}@example.com`.toLowerCase();
    
    const signupRes = await agent
      .post('/signup')
      .send({
        name: 'Saranya',
        email: uniqueEmail,
        password: 'Saranya123'
      });
      
    expect(signupRes.status).toBe(201);
    expect(signupRes.body).toHaveProperty('message');

    const signinRes = await agent
      .post('/signin')
      .send({
        email: uniqueEmail,
        password: 'Saranya123'
      });

    expect(signinRes.status).toBe(200);
    expect(signinRes.body).toHaveProperty('message');

    const logoutRes = await agent.post('/logout');

    expect(logoutRes.status).toBe(200);
    expect(logoutRes.body).toHaveProperty('message');
  });

  // Verify that accessing the dashboard after logging out returns 401 Unauthorized.
  it('Login to continue', async () => {
    const uniqueEmail = `user_${crypto.randomUUID()}@example.com`.toLowerCase();
    const agent = request.agent(app);

    const signupRes = await agent
      .post('/signup')
      .send({
        name: 'Reshma',
        email: uniqueEmail,
        password: 'Reshma123'
      });

    expect(signupRes.status).toBe(201);
    expect(signupRes.body).toHaveProperty('message');

    const signinRes = await agent
      .post('/signin')
      .send({
        email: uniqueEmail,
        password: 'Reshma123'
      });

    expect(signinRes.status).toBe(200);
    expect(signinRes.body).toHaveProperty('message');

    const logoutRes = await agent.post('/logout');

    expect(logoutRes.status).toBe(200);
    expect(logoutRes.body).toHaveProperty('message');

    const dashboardRes = await agent.get('/dashboard');

    expect(dashboardRes.status).toBe(401);
    expect(dashboardRes.body).toHaveProperty('error');
  });
});

// Rate limiter test
describe('Rate Limiter Isolated Test', () => {
  it('Too many login attempts, try again after sometimes', async () => {
    const firstRes = await request(testApp).post('/test-limit');
    expect(firstRes.status).toBe(200);

    const secondRes = await request(testApp).post('/test-limit');
    expect(secondRes.status).toBe(200);
     
    const thirdRes = await request(testApp).post('/test-limit');
    expect(thirdRes.status).toBe(429);
    expect(thirdRes.body).toHaveProperty('error');
  });
});
