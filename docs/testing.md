# Testing Strategy

This document outlines the testing approach for the S.H.I.E.L.D. Operations Request Portal.

## Testing Levels

### 1. Unit Testing

#### Backend (Python/pytest)
```python
# Example test case for mission creation
def test_create_mission():
    mission_data = {
        "mission_type": "drone-surveillance",
        "details": {
            "drone_id": "test-drone",
            "operation_area": "test-area",
            "payload": "test-payload"
        }
    }
    response = client.post("/missions/submit", json=mission_data)
    assert response.status_code == 200
    assert response.json()["message"] == "Mission request submitted successfully"
```

#### Frontend (Jest/React Testing Library)
```typescript
// Example test case for mission form
describe('MissionRequest', () => {
  it('should validate required fields', () => {
    render(<MissionRequest />);
    const submitButton = screen.getByText('Submit Request');
    fireEvent.click(submitButton);
    expect(screen.getByText('Drone Id is required')).toBeInTheDocument();
  });
});
```

### 2. Integration Testing

#### API Integration Tests
```python
def test_mission_workflow():
    # Create mission
    mission = create_test_mission()
    
    # Update mission
    updated_data = {"details": {"status": "completed"}}
    response = client.put(f"/missions/{mission['id']}", json=updated_data)
    assert response.status_code == 200
    
    # Delete mission
    response = client.delete(f"/missions/{mission['id']}")
    assert response.status_code == 200
```

#### Frontend Integration Tests
```typescript
describe('Mission Management Flow', () => {
  it('should handle full mission lifecycle', async () => {
    render(<App />);
    // Login
    await userLogin();
    // Create mission
    await createMission();
    // Verify mission in list
    expect(screen.getByText('test-mission')).toBeInTheDocument();
    // Delete mission
    await deleteMission();
  });
});
```

## Test Categories

### 1. Functional Testing

#### Authentication Tests
- Login functionality
- Token validation
- Authorization checks
- Session management

#### Mission Management Tests
- Mission creation
- Mission updates
- Mission deletion
- List retrieval
- Filtering and sorting

#### Form Validation Tests
- Required fields
- Field formats
- Error messages
- Submit behavior

### 2. Non-Functional Testing

#### Performance Tests
```bash
# Using k6 for load testing
k6 run performance-tests.js
```

#### Security Tests
```bash
# Using OWASP ZAP for security scanning
zap-cli quick-scan --self-contained --start-options '-config api.disablekey=true' http://localhost:8000
```

## Test Environment Setup

### Local Development
```bash
# Backend test setup
cd backend
python -m venv test-venv
source test-venv/bin/activate
pip install -r requirements-test.txt
pytest

# Frontend test setup
cd frontend
npm install
npm test
```

### CI/CD Pipeline
```yaml
# Example GitHub Actions workflow
name: Test Suite
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Run Backend Tests
        run: |
          cd backend
          python -m pytest
      - name: Run Frontend Tests
        run: |
          cd frontend
          npm test
```

## Test Data Management

### 1. Test Fixtures
```python
# Backend fixtures
@pytest.fixture
def test_mission():
    return {
        "mission_type": "drone-surveillance",
        "details": {
            "drone_id": "test-drone",
            "operation_area": "test-area",
            "payload": "test-payload"
        }
    }
```

### 2. Mock Data
```typescript
// Frontend mocks
const mockMissionData = {
  id: '123',
  type: 'drone-surveillance',
  details: {
    drone_id: 'mock-drone',
    operation_area: 'mock-area',
    payload: 'mock-payload'
  }
};
```

## Test Coverage Requirements

### Backend Coverage
- Minimum 80% code coverage
- 100% coverage for critical paths
- All API endpoints tested
- Error handlers tested

### Frontend Coverage
- All components tested
- User interactions covered
- Error states tested
- Form validation tested

## Testing Tools

### Backend Testing
- pytest for unit tests
- pytest-cov for coverage
- pytest-mock for mocking
- requests for API testing

### Frontend Testing
- Jest for unit tests
- React Testing Library
- MSW for API mocking
- jest-dom for DOM assertions

## Continuous Testing

### Pre-commit Hooks
```bash
# Install pre-commit hooks
pre-commit install

# Run tests before commit
npm test
pytest
```

### Automated Testing
```yaml
# Example test automation schedule
name: Nightly Tests
on:
  schedule:
    - cron: '0 0 * * *'
jobs:
  full-test-suite:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Run Full Test Suite
        run: |
          make test-all
```

## Test Reports

### Coverage Reports
```bash
# Generate backend coverage report
pytest --cov=app --cov-report=html

# Generate frontend coverage report
npm test -- --coverage
```

### Test Results
```bash
# Generate test results report
pytest --junitxml=test-results.xml
```

## Debugging Tests

### Backend Debugging
```python
# Using pytest debug mode
pytest --pdb

# Using logging
import logging
logging.debug("Test debug info")
```

### Frontend Debugging
```typescript
// Using debug mode in Jest
test.only('specific test', () => {
  // Test code
});
```

## Performance Benchmarks

### Response Time Tests
```javascript
// k6 performance test script
export default function() {
  const response = http.get('http://localhost:8000/missions');
  check(response, {
    'is status 200': (r) => r.status === 200,
    'response time < 200ms': (r) => r.timings.duration < 200
  });
}
```

## Security Testing

### Authentication Tests
```python
def test_invalid_token():
    response = client.get(
        "/missions",
        headers={"Authorization": "Bearer invalid-token"}
    )
    assert response.status_code == 401
```

### Input Validation Tests
```python
def test_sql_injection():
    response = client.post(
        "/missions/submit",
        json={"details": {"field": "'; DROP TABLE missions;--"}}
    )
    assert response.status_code == 400
``` 