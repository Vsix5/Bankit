import AppError from '../utils/AppError.js';

export default function requireAuth(req, res, next) {

    if(!req.session?.user) {
        return next(new AppError('Authentication required', 401));
    }
    next();
}