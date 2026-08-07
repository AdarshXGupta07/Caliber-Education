from pydantic import BaseModel, EmailStr


class RegisterInitRequest(BaseModel):
    email: EmailStr
    turnstileToken: str = ""


class VerifyOTPRequest(BaseModel):
    email: EmailStr
    otp: str


class RegisterRequest(BaseModel):
    email: EmailStr
    password: str
    tempToken: str


class LoginRequest(BaseModel):
    email: EmailStr
    password: str
    turnstileToken: str = ""


class ForgotPasswordRequest(BaseModel):
    email: EmailStr
    turnstileToken: str = ""


class ResetPasswordRequest(BaseModel):
    accessToken: str
    refreshToken: str
    newPassword: str


class UserResponse(BaseModel):
    id: str
    email: str
    role: str
    profileComplete: bool = False


class TokenResponse(BaseModel):
    token: str
    user: UserResponse
