"""
Unit tests for helper utilities.
"""

import pytest
from datetime import datetime
from utils.helpers import (
    serialize_firestore_timestamp,
    sanitize_string
)


class TestSerializeFirestoreTimestamp:
    """Tests for serialize_firestore_timestamp function."""
    
    def test_datetime_object(self):
        """Test that datetime objects are converted to timestamps."""
        dt = datetime(2024, 1, 1, 12, 0, 0)
        result = serialize_firestore_timestamp(dt)
        assert isinstance(result, float)
        assert result > 0
    
    def test_none_value(self):
        """Test that None returns None."""
        assert serialize_firestore_timestamp(None) is None
    
    def test_numeric_value(self):
        """Test that numeric values are returned as float."""
        assert serialize_firestore_timestamp(1234567890) == 1234567890.0
        assert serialize_firestore_timestamp(1234567890.5) == 1234567890.5
    
    def test_firestore_timestamp(self):
        """Test that Firestore Timestamp objects are converted."""
        # Mock Firestore Timestamp
        class MockTimestamp:
            def __init__(self, seconds):
                self.seconds = seconds
            
            def timestamp(self):
                return float(self.seconds)
        
        mock_ts = MockTimestamp(1234567890)
        result = serialize_firestore_timestamp(mock_ts)
        assert result == 1234567890.0


class TestSanitizeString:
    """Tests for sanitize_string function."""
    
    def test_normal_string(self):
        """Test that normal strings pass through unchanged."""
        assert sanitize_string("hello world") == "hello world"
    
    def test_whitespace_trimming(self):
        """Test that leading/trailing whitespace is trimmed."""
        assert sanitize_string("  hello  ") == "hello"
    
    def test_control_characters_removed(self):
        """Test that control characters are removed."""
        # String with null byte and control characters
        dirty = "hello\x00\x01\x02world"
        clean = sanitize_string(dirty)
        assert '\x00' not in clean
        assert '\x01' not in clean
        assert '\x02' not in clean
        assert 'hello' in clean
        assert 'world' in clean
    
    def test_allowed_control_chars(self):
        """Test that newline, tab, carriage return are preserved."""
        text = "hello\nworld\tagain\r"
        result = sanitize_string(text)
        assert '\n' in result
        assert '\t' in result
        assert '\r' in result
    
    def test_max_length(self):
        """Test that max_length is enforced."""
        long_string = "a" * 100
        with pytest.raises(ValueError) as exc_info:
            sanitize_string(long_string, max_length=50)
        assert 'maximum length' in str(exc_info.value).lower()
    
    def test_non_string_input(self):
        """Test that non-string inputs raise ValueError."""
        with pytest.raises(ValueError) as exc_info:
            sanitize_string(123)
        assert 'string' in str(exc_info.value).lower()
        
        with pytest.raises(ValueError):
            sanitize_string(None)
        
        with pytest.raises(ValueError):
            sanitize_string([])

