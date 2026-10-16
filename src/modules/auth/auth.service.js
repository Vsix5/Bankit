import bcrypt from 'bcrypt';
import pool from '../../../utils/db.js';
import AppError from '../../utils/AppError.js';

const rounds = 10;

export async function signupUser(name, email, password) {
    const hashedPassword = await bcrypt.hash(password, rounds);

    try {
        const result = await pool.query(
            'INSERT INTO bankit_table(name, email, password) VALUES ($1, $2, $3) RETURNING name, email',
            [name, email, hashedPassword]
        );
        return result.rows[0];
    }
    catch (error) {

        if (error.code === '23505') {
            throw new AppError('Please use an email that is not already registered', 409);
        }
        throw error;

    }

}

export async function findUserByEmail(email) {
    const result = await pool.query(
        'SELECT name, email, password FROM bankit_table WHERE email = $1',
        [email]
    );
    return result.rows[0];
}

export async function verifyPassword(password, hashedPassword) {
    return bcrypt.compare(password, hashedPassword);
}
