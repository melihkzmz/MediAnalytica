"""
Input validation utilities for API endpoints.
"""

from utils.errors import ValidationError


# Allowed disease types
ALLOWED_DISEASE_TYPES = {'skin', 'bone', 'lung', 'eye'}

# Allowed image MIME types
ALLOWED_IMAGE_TYPES = {'image/jpeg', 'image/jpg', 'image/png'}

# Maximum file size (10MB)
MAX_FILE_SIZE = 10 * 1024 * 1024


def validate_disease_type(disease_type):
    """
    Validate disease type.
    
    Args:
        disease_type: Disease type string
        
    Returns:
        str: Validated disease type
        
    Raises:
        ValidationError: If disease type is invalid
    """
    if not disease_type:
        raise ValidationError("diseaseType is required")
    
    if disease_type not in ALLOWED_DISEASE_TYPES:
        raise ValidationError(
            f"Invalid diseaseType: {disease_type}. Allowed: {', '.join(ALLOWED_DISEASE_TYPES)}"
        )
    
    return disease_type


def validate_analysis_results(results):
    """
    Validate analysis results structure.
    
    Args:
        results: List of result dictionaries
        
    Returns:
        list: Validated results
        
    Raises:
        ValidationError: If results are invalid
    """
    if not results:
        raise ValidationError("results cannot be empty")
    
    if not isinstance(results, list):
        raise ValidationError("results must be a list")
    
    for i, result in enumerate(results):
        if not isinstance(result, dict):
            raise ValidationError(f"results[{i}] must be a dictionary")
        
        if 'class' not in result and 'className' not in result:
            raise ValidationError(f"results[{i}] must contain 'class' or 'className'")
        
        if 'confidence' not in result and 'probability' not in result:
            raise ValidationError(f"results[{i}] must contain 'confidence' or 'probability'")
    
    return results


def validate_image_file(file):
    """
    Validate uploaded image file.
    
    Args:
        file: File object from request
        
    Returns:
        None
        
    Raises:
        ValidationError: If file is invalid
    """
    if not file:
        raise ValidationError("Image file is required")
    
    # Check file size
    if hasattr(file, 'content_length') and file.content_length:
        if file.content_length > MAX_FILE_SIZE:
            raise ValidationError(
                f"File size exceeds maximum allowed size of {MAX_FILE_SIZE / (1024*1024)}MB"
            )
    
    # Check MIME type
    if hasattr(file, 'content_type') and file.content_type:
        if file.content_type not in ALLOWED_IMAGE_TYPES:
            raise ValidationError(
                f"Invalid file type: {file.content_type}. Allowed: {', '.join(ALLOWED_IMAGE_TYPES)}"
            )
    
    return None


def validate_pagination_params(page, per_page):
    """
    Validate pagination parameters.
    
    Args:
        page: Page number
        per_page: Items per page
        
    Returns:
        tuple: (validated_page, validated_per_page)
        
    Raises:
        ValidationError: If parameters are invalid
    """
    try:
        page = int(page) if page else 1
        per_page = int(per_page) if per_page else 20
    except (ValueError, TypeError):
        raise ValidationError("page and per_page must be integers")
    
    if page < 1:
        raise ValidationError("page must be >= 1")
    
    if per_page < 1 or per_page > 100:
        raise ValidationError("per_page must be between 1 and 100")
    
    return page, per_page

