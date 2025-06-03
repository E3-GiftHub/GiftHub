export const forgotPasswordMessages = {
  emailRequired: "Email address is required",
  emailInvalid: "Invalid email address format",
  serverError: "An unexpected error occurred. Please try again.",
  success: "Reset email sent", // poți adăuga și mesajele pozitive aici
  userNotFound: "User not found",
};

export const resetPasswordMessages = {
  passwordRequired: "Password is required",
  passwordMinLength: "Password must be at least 8 characters",
  passwordStrengthDigit: "Password must contain at least one digit",
  passwordStrengthLowercase: "Password must contain at least one lowercase letter",
  passwordStrengthUppercase: "Password must contain at least one uppercase letter",
  passwordMismatch: "Passwords do not match",
  tokenInvalid: "Invalid or missing reset token. Please use the link from your email.",
  serverError: "An unexpected error occurred. Please try again.",
  success: "Your password has been successfully reset!",
};