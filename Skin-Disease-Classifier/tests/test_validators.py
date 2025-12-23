"""
Unit tests for validation utilities.
"""

import pytest
from utils.validators import (
    validate_disease_type,
    validate_analysis_results,
    validate_pagination_params
)
from utils.errors import ValidationError


class TestValidateDiseaseType:
    """Tests for validate_disease_type function."""
    
    def test_valid_disease_types(self):
        """Test that all valid disease types pass validation."""
        assert validate_disease_type('skin') == 'skin'
        assert validate_disease_type('bone') == 'bone'
        assert validate_disease_type('lung') == 'lung'
        assert validate_disease_type('eye') == 'eye'
    
    def test_invalid_disease_type(self):
        """Test that invalid disease types raise ValidationError."""
        with pytest.raises(ValidationError) as exc_info:
            validate_disease_type('invalid')
        assert 'Invalid diseaseType' in exc_info.value.message
    
    def test_empty_disease_type(self):
        """Test that empty disease type raises ValidationError."""
        with pytest.raises(ValidationError) as exc_info:
            validate_disease_type('')
        assert 'required' in exc_info.value.message.lower()
    
    def test_none_disease_type(self):
        """Test that None disease type raises ValidationError."""
        with pytest.raises(ValidationError):
            validate_disease_type(None)


class TestValidateAnalysisResults:
    """Tests for validate_analysis_results function."""
    
    def test_valid_results(self):
        """Test that valid results pass validation."""
        results = [
            {'class': 'melanoma', 'confidence': 0.95},
            {'className': 'benign', 'probability': 0.05}
        ]
        assert validate_analysis_results(results) == results
    
    def test_empty_results(self):
        """Test that empty results raise ValidationError."""
        with pytest.raises(ValidationError) as exc_info:
            validate_analysis_results([])
        assert 'empty' in exc_info.value.message.lower()
    
    def test_not_list(self):
        """Test that non-list results raise ValidationError."""
        with pytest.raises(ValidationError) as exc_info:
            validate_analysis_results({'class': 'test'})
        assert 'list' in exc_info.value.message.lower()
    
    def test_missing_class(self):
        """Test that results without class/className raise ValidationError."""
        with pytest.raises(ValidationError) as exc_info:
            validate_analysis_results([{'confidence': 0.95}])
        assert 'class' in exc_info.value.message.lower()
    
    def test_missing_confidence(self):
        """Test that results without confidence/probability raise ValidationError."""
        with pytest.raises(ValidationError) as exc_info:
            validate_analysis_results([{'class': 'test'}])
        assert 'confidence' in exc_info.value.message.lower() or 'probability' in exc_info.value.message.lower()


class TestValidatePaginationParams:
    """Tests for validate_pagination_params function."""
    
    def test_valid_params(self):
        """Test that valid pagination params pass validation."""
        page, per_page = validate_pagination_params(1, 20)
        assert page == 1
        assert per_page == 20
    
    def test_default_values(self):
        """Test that None values use defaults."""
        page, per_page = validate_pagination_params(None, None)
        assert page == 1
        assert per_page == 20
    
    def test_string_numbers(self):
        """Test that string numbers are converted."""
        page, per_page = validate_pagination_params('2', '30')
        assert page == 2
        assert per_page == 30
    
    def test_invalid_page(self):
        """Test that invalid page numbers raise ValidationError."""
        with pytest.raises(ValidationError):
            validate_pagination_params(0, 20)
        
        with pytest.raises(ValidationError):
            validate_pagination_params(-1, 20)
    
    def test_invalid_per_page(self):
        """Test that invalid per_page values raise ValidationError."""
        with pytest.raises(ValidationError):
            validate_pagination_params(1, 0)
        
        with pytest.raises(ValidationError):
            validate_pagination_params(1, 101)
    
    def test_invalid_types(self):
        """Test that non-numeric values raise ValidationError."""
        with pytest.raises(ValidationError):
            validate_pagination_params('invalid', 20)
        
        with pytest.raises(ValidationError):
            validate_pagination_params(1, 'invalid')

