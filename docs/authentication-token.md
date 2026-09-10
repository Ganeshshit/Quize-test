# JWT Authentication and User Information

## Overview

The application uses JSON Web Tokens (JWT) for authenticated user sessions.

The JWT service is responsible for:
- Decoding the JWT payload
- Validating required claims
- Checking token expiration
- Extracting user information for the application

## User Information Extracted

The authentication layer extracts the following information when available:

- User ID
- Email address
- Name / full name
- Role
- Permissions
- Token issued-at time (iat)
- Token expiration time (exp)

## Token Validation

Before user information is returned to the application, the token is checked for:

1. Valid JWT structure
2. Valid JSON payload
3. Token expiration
4. Required user ID claim
5. Required role claim
6. Issuer, when supplied
7. Audience, when supplied

Malformed, expired, or incomplete tokens are rejected safely.

## Authentication Flow

Access Token
    |
    v
JWT Service
    |
    +--> Decode payload
    |
    +--> Validate claims
    |
    +--> Check expiration
    |
    v
User Information
    |
    v
AuthService / useAuth
    |
    v
Application UI

## Security Considerations

The frontend performs JWT structure, claim, and expiration validation for client-side authentication state.

Cryptographic JWT signature verification must be performed by the backend/authentication server.

The frontend must not contain or expose a private signing secret.

Authentication tokens and sensitive authentication information must not be logged.

## Testing

JWT functionality is covered by unit tests for:

- Valid JWT decoding
- User information extraction
- Malformed token handling
- Expired token handling
- Missing required claims
- sub claim as a user ID

All current JWT unit tests pass successfully.