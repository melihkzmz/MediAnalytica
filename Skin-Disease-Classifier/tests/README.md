# Test Suite

## Running Tests

### Prerequisites

```bash
pip install pytest pytest-cov
```

### Run All Tests

```bash
# From Skin-Disease-Classifier directory
pytest tests/ -v
```

### Run Specific Test File

```bash
pytest tests/test_validators.py -v
pytest tests/test_helpers.py -v
```

### Run with Coverage

```bash
pytest tests/ --cov=utils --cov-report=html
```

## Test Structure

### Unit Tests

- `test_validators.py` - Input validation functions
- `test_helpers.py` - Utility helper functions
- `test_errors.py` - Error class behavior (if needed)

### Integration Tests

- `test_integration.py` - API endpoint integration tests

**Note:** Full integration tests require Firebase emulator or test environment setup.

## What Cannot Be Tested Without Runtime

1. **Firebase Operations** - Requires Firebase emulator or test project
2. **Model Inference** - Requires actual TensorFlow models
3. **File Uploads** - Requires file system access
4. **Jitsi Integration** - Requires actual Jitsi service (mock for tests)

## Test Coverage Goals

- **Critical Paths**: 80%+ coverage
- **Utilities**: 90%+ coverage
- **API Endpoints**: 60%+ coverage (integration tests)

## Adding New Tests

1. Create test file in `tests/` directory
2. Follow naming convention: `test_*.py`
3. Use pytest fixtures for setup/teardown
4. Mock external dependencies (Firebase, etc.)

