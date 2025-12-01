/**
 * Centralized JWT Configuration
 * This file eliminates duplication of JWT_SECRET across the codebase
 */
export const jwtConfig = {
  secret: process.env.JWT_SECRET,
  expiresIn: '7d',
};

