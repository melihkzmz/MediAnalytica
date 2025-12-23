"""
Custom error classes for consistent error handling across the API.
"""


class APIError(Exception):
    """Base exception for API errors."""
    
    def __init__(self, message, status_code=500, error_code=None):
        self.message = message
        self.status_code = status_code
        self.error_code = error_code
        super().__init__(self.message)


class AuthenticationError(APIError):
    """Authentication/authorization errors."""
    
    def __init__(self, message="Authentication failed", error_code="AUTH_ERROR"):
        super().__init__(message, status_code=401, error_code=error_code)


class ValidationError(APIError):
    """Input validation errors."""
    
    def __init__(self, message="Invalid input", error_code="VALIDATION_ERROR"):
        super().__init__(message, status_code=400, error_code=error_code)


class NotFoundError(APIError):
    """Resource not found errors."""
    
    def __init__(self, message="Resource not found", error_code="NOT_FOUND"):
        super().__init__(message, status_code=404, error_code=error_code)


class RateLimitError(APIError):
    """Rate limit exceeded errors."""
    
    def __init__(self, message="Rate limit exceeded", error_code="RATE_LIMIT"):
        super().__init__(message, status_code=429, error_code=error_code)

