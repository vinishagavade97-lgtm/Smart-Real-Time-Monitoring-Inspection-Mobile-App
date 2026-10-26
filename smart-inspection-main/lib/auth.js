import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
    throw new Error("JWT_SECRET is not defined in .env.local");
}

export function createToken(user) {
    return jwt.sign(
        {
            userId: user._id.toString(),
            role: user.role,
        },
        JWT_SECRET,
        {
            expiresIn: "7d",
        }
    );
}

export function verifyToken(token) {
    try {
        return jwt.verify(token, JWT_SECRET);
    } catch (error) {
        console.error("❌ [JWT] Token verification failed");
        return null;
    }
}