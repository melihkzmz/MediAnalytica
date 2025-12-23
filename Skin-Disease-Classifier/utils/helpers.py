"""
Helper utilities for common operations.
"""

from datetime import datetime
from firebase_admin import firestore
import logging

logger = logging.getLogger(__name__)


def serialize_firestore_timestamp(timestamp):
    """
    Convert Firestore timestamp to ISO format string or Unix timestamp.
    
    Args:
        timestamp: Firestore Timestamp, datetime, or None
        
    Returns:
        float: Unix timestamp, or None if timestamp is None
    """
    if timestamp is None:
        return None
    
    # If it's a Firestore Timestamp
    if hasattr(timestamp, 'timestamp'):
        return timestamp.timestamp()
    
    # If it's a datetime object
    if isinstance(timestamp, datetime):
        return timestamp.timestamp()
    
    # If it's already a number
    if isinstance(timestamp, (int, float)):
        return float(timestamp)
    
    logger.warning(f"Unexpected timestamp type: {type(timestamp)}")
    return None


def serialize_firestore_doc(doc):
    """
    Serialize a Firestore document to a dictionary with proper timestamp handling.
    
    Args:
        doc: Firestore document snapshot
        
    Returns:
        dict: Serialized document data
    """
    if not doc.exists:
        return None
    
    data = doc.to_dict()
    data['id'] = doc.id
    
    # Serialize timestamps
    for key, value in data.items():
        if isinstance(value, (firestore.Timestamp, datetime)):
            data[key] = serialize_firestore_timestamp(value)
        elif isinstance(value, dict):
            # Recursively handle nested dictionaries
            for nested_key, nested_value in value.items():
                if isinstance(nested_value, (firestore.Timestamp, datetime)):
                    value[nested_key] = serialize_firestore_timestamp(nested_value)
    
    return data


def sanitize_string(value, max_length=None):
    """
    Sanitize string input to prevent injection attacks.
    
    Args:
        value: String to sanitize
        max_length: Maximum allowed length
        
    Returns:
        str: Sanitized string
        
    Raises:
        ValueError: If value is not a string or exceeds max_length
    """
    if not isinstance(value, str):
        raise ValueError("Value must be a string")
    
    # Remove null bytes and control characters
    sanitized = ''.join(char for char in value if ord(char) >= 32 or char in '\n\r\t')
    
    # Trim whitespace
    sanitized = sanitized.strip()
    
    # Check length
    if max_length and len(sanitized) > max_length:
        raise ValueError(f"String exceeds maximum length of {max_length}")
    
    return sanitized


def get_user_id_from_token(request):
    """
    Extract and verify user ID from request token.
    
    Args:
        request: Flask request object
        
    Returns:
        str: User ID
        
    Raises:
        AuthenticationError: If token is invalid or missing
    """
    from firebase_admin import auth
    from utils.errors import AuthenticationError
    
    auth_header = request.headers.get('Authorization')
    if not auth_header or not auth_header.startswith('Bearer '):
        raise AuthenticationError("Authorization header missing or invalid")
    
    token = auth_header.split('Bearer ')[1].strip()
    if not token:
        raise AuthenticationError("Token is empty")
    
    try:
        decoded = auth.verify_id_token(token)
        return decoded['uid']
    except auth.InvalidIdTokenError:
        raise AuthenticationError("Invalid token")
    except auth.ExpiredIdTokenError:
        raise AuthenticationError("Token has expired")
    except Exception as e:
        logger.error(f"Token verification error: {str(e)}")
        raise AuthenticationError("Token verification failed")

