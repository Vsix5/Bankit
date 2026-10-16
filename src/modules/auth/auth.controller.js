import AppError from '../../utils/AppError.js';
import { signupUser, findUserByEmail, verifyPassword } from './auth.service.js';

export async function signup(req, res) {
    const { name, email, password } = req.body;
    const user = await signupUser(name, email, password);

    res.status(201).json({
        message: `Account created successfully for ${user.email}`
    })
}

export async function signin(req, res, next) {
    const { email, password } = req.body;
    const user = await findUserByEmail(email);

    if (!user || !(await verifyPassword(password, user.password))) {
        throw new AppError('Check your login details', 401);
    }

    req.session.regenerate((error) => {
        if (error) return next(error);

        req.session.user = { name: user.name, email: user.email };

        req.session.save((error) => {
            if (error) return next(error);

            res.status(200).json({
                message: 'Logged in successfully'
            })
        });
    })
}

export function dashboard(req, res) {
    res.status(200).json({ user: req.session.user });
}

export function logout(req, res, next) {
    req.session.destroy((error) => {
        if (error) return next(error);

        res.clearCookie('connect.sid');
        res.status(200).json({ message: 'logged out successfully' });

    })
}
