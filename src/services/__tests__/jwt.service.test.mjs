import test from 'node:test';
import assert from 'node:assert/strict';
import { jwtService } from '../jwt.service.js';

const createToken = (payload) => {
    const encode = (value) =>
        Buffer.from(JSON.stringify(value)).toString('base64url');

    return `${encode({ alg: 'none', typ: 'JWT' })}.${encode(payload)}.signature`;
};

test('decodes a valid JWT payload', () => {
    const token = createToken({
        userId: 'user-123',
        email: 'student@example.com',
        name: 'Test Student',
        role: 'student',
        permissions: ['quiz:attempt'],
        exp: Math.floor(Date.now() / 1000) + 3600,
    });

    const decoded = jwtService.decode(token);

    assert.equal(decoded.userId, 'user-123');
    assert.equal(decoded.email, 'student@example.com');
    assert.equal(decoded.role, 'student');
});

test('extracts user information from a valid token', () => {
    const token = createToken({
        userId: 'user-123',
        email: 'student@example.com',
        name: 'Test Student',
        role: 'student',
        permissions: ['quiz:attempt'],
        exp: Math.floor(Date.now() / 1000) + 3600,
    });

    const user = jwtService.getUserInfo(token);

    assert.equal(user.userId, 'user-123');
    assert.equal(user.email, 'student@example.com');
    assert.equal(user.name, 'Test Student');
    assert.equal(user.role, 'student');
    assert.deepEqual(user.permissions, ['quiz:attempt']);
});

test('rejects malformed tokens', () => {
    assert.equal(jwtService.decode('invalid-token'), null);
    assert.equal(jwtService.getUserInfo('invalid-token'), null);
});

test('rejects expired tokens', () => {
    const token = createToken({
        userId: 'user-123',
        role: 'student',
        exp: Math.floor(Date.now() / 1000) - 60,
    });

    assert.equal(jwtService.isTokenExpired(token), true);

    assert.deepEqual(jwtService.validateToken(token), {
        valid: false,
        reason: 'Token expired',
    });
});

test('rejects tokens with missing required claims', () => {
    const token = createToken({
        email: 'student@example.com',
        exp: Math.floor(Date.now() / 1000) + 3600,
    });

    assert.deepEqual(jwtService.validateToken(token), {
        valid: false,
        reason: 'Missing required claims',
    });
});

test('supports subject as user ID', () => {
    const token = createToken({
        sub: 'user-456',
        role: 'trainer',
        exp: Math.floor(Date.now() / 1000) + 3600,
    });

    assert.equal(jwtService.getUserId(token), 'user-456');
});