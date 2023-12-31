import { Request, Response, NextFunction } from 'express';
import jwt, { JwtPayload } from 'jsonwebtoken';

require('dotenv').config();

export interface AuthRequest extends Request {
    token: string | JwtPayload;
}

module.exports = function (req: Request, res: Response, next: NextFunction) {
    const token = req.header('x-auth-token');
    if (!token) {
        return res.status(400).json({ msg: 'No token, authorization denied' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET as jwt.Secret);
        (req as AuthRequest).token = decoded;
        next();
    } catch (err) {
        res.status(401).json({ msg: 'token is not valid' });
    }
};