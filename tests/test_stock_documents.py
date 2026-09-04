"""
Stock Document API Integration Tests
=====================================
Tests stock document endpoints:
- POST /api/v1/stock-gestionnaire/documents
- GET /api/v1/stock-gestionnaire/documents
- GET /api/v1/stock-gestionnaire/documents/{document_id}/file
"""

import pytest
import bcrypt
from datetime import date, datetime
from fastapi.testclient import TestClient
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.stock_document import StockDocument
from app.models.user import User, Role
from app.auth.jwt_handler import create_access_token


@pytest.fixture
async def sample_stock_document(async_db: AsyncSession, stock_gestionnaire_user: User):
    """Create a sample stock document for testing."""
    doc = StockDocument(
        id="TEST_DOC_001",
        depot_code="BA",
        distributor_code="AB",  # Different from different marketer's "TF"
        uploaded_by=stock_gestionnaire_user.id,
        file_name="test_stock_report.pdf",
        storage_path="uploads/test_document.pdf",
        mime_type="application/pdf",
        file_size=1024,
        document_date=datetime.utcnow(),
        statement_type="JOURNALIER",
        statement_start_date=date(2021, 10, 12),
        statement_end_date=date(2022, 1, 18),
    )
    async_db.add(doc)
    await async_db.commit()
    await async_db.refresh(doc)
    return doc


@pytest.fixture
async def sample_monthly_document(async_db: AsyncSession, stock_gestionnaire_user: User):
    """Create a sample monthly stock document for testing."""
    doc = StockDocument(
        id="TEST_DOC_002",
        depot_code="YC",
        distributor_code="TF",
        uploaded_by=stock_gestionnaire_user.id,
        file_name="monthly_stock_report.pdf",
        storage_path="uploads/monthly_document.pdf",
        mime_type="application/pdf",
        file_size=2048,
        document_date=datetime.utcnow(),
        statement_type="MENSUEL",
        statement_start_date=date(2022, 1, 1),
        statement_end_date=date(2022, 1, 31),
    )
    async_db.add(doc)
    await async_db.commit()
    await async_db.refresh(doc)
    return doc


def test_upload_document_missing_statement_type(client: TestClient, stock_gestionnaire_headers: dict):
    """Test that upload fails when statement type is missing."""
    # This would require a real PDF file upload, so we'll test the API validation
    # by checking the endpoint expects the required fields
    res = client.post(
        "/api/v1/stock-gestionnaire/documents",
        headers=stock_gestionnaire_headers,
        data={
            "depot_code": "BA",
            "distributor_code": "AB",
            # Missing statement_type, statement_start_date, statement_end_date
        }
    )
    # Should fail due to missing required fields
    assert res.status_code in [400, 422]  # Bad Request or Unprocessable Entity


def test_get_documents_unauthorized(client: TestClient):
    """Test that getting documents requires authentication."""
    res = client.get("/api/v1/stock-gestionnaire/documents")
    assert res.status_code == 401


def test_get_documents_stock_gestionnaire(client: TestClient, stock_gestionnaire_headers: dict, sample_stock_document):
    """Test that stock gestionnaire can get documents."""
    res = client.get("/api/v1/stock-gestionnaire/documents", headers=stock_gestionnaire_headers)
    assert res.status_code == 200
    data = res.json()
    assert "items" in data
    assert len(data["items"]) >= 1


def test_get_documents_marketer(client: TestClient, marketer_headers: dict, sample_stock_document):
    """Test that marketer can get documents (filtered by their distributor)."""
    res = client.get("/api/v1/stock-gestionnaire/documents", headers=marketer_headers)
    assert res.status_code == 200
    data = res.json()
    assert "items" in data


def test_filter_by_statement_type(client: TestClient, stock_gestionnaire_headers: dict, sample_stock_document, sample_monthly_document):
    """Test filtering by statement type."""
    # Filter for JOURNALIER only
    res = client.get(
        "/api/v1/stock-gestionnaire/documents",
        headers=stock_gestionnaire_headers,
        params={"statement_type": "JOURNALIER"}
    )
    assert res.status_code == 200
    data = res.json()
    assert "items" in data
    # Should only return documents with JOURNALIER type
    for item in data["items"]:
        assert item["statementType"] == "JOURNALIER"


def test_filter_by_statement_period_overlap(client: TestClient, stock_gestionnaire_headers: dict, sample_stock_document):
    """Test filtering by statement period with overlap logic."""
    # Document has period: 2021-10-12 to 2022-01-18
    # Search for overlap with: 2021-12-01 to 2021-12-31
    res = client.get(
        "/api/v1/stock-gestionnaire/documents",
        headers=stock_gestionnaire_headers,
        params={
            "statement_start_date": "2021-12-01",
            "statement_end_date": "2021-12-31"
        }
    )
    assert res.status_code == 200
    data = res.json()
    assert "items" in data
    # Should return the document since periods overlap
    assert len(data["items"]) >= 1


def test_filter_by_statement_period_no_overlap(client: TestClient, stock_gestionnaire_headers: dict, sample_stock_document):
    """Test filtering by statement period with no overlap."""
    # Document has period: 2021-10-12 to 2022-01-18
    # Search for non-overlapping period: 2022-03-01 to 2022-03-31
    res = client.get(
        "/api/v1/stock-gestionnaire/documents",
        headers=stock_gestionnaire_headers,
        params={
            "statement_start_date": "2022-03-01",
            "statement_end_date": "2022-03-31"
        }
    )
    assert res.status_code == 200
    data = res.json()
    assert "items" in data
    # Should not return the document since periods don't overlap
    document_ids = [item["id"] for item in data["items"]]
    assert sample_stock_document.id not in document_ids


def test_filter_by_upload_date(client: TestClient, stock_gestionnaire_headers: dict, sample_stock_document):
    """Test filtering by upload date."""
    # Filter by upload date (using created_at)
    today = datetime.utcnow().date()
    res = client.get(
        "/api/v1/stock-gestionnaire/documents",
        headers=stock_gestionnaire_headers,
        params={
            "start_date": today.isoformat(),
            "end_date": today.isoformat()
        }
    )
    assert res.status_code == 200
    data = res.json()
    assert "items" in data


def test_combined_filters(client: TestClient, stock_gestionnaire_headers: dict, sample_stock_document, sample_monthly_document):
    """Test combined filtering with multiple parameters."""
    res = client.get(
        "/api/v1/stock-gestionnaire/documents",
        headers=stock_gestionnaire_headers,
        params={
            "statement_type": "JOURNALIER",
            "depot_code": "BA",
            "statement_start_date": "2021-01-01",
            "statement_end_date": "2022-12-31"
        }
    )
    assert res.status_code == 200
    data = res.json()
    assert "items" in data
    # All returned documents should match all filters
    for item in data["items"]:
        assert item["statementType"] == "JOURNALIER"
        assert item["depotCode"] == "BA"


def test_reset_filters(client: TestClient, stock_gestionnaire_headers: dict, sample_stock_document, sample_monthly_document):
    """Test that resetting filters returns all documents."""
    # First apply a filter
    res_filtered = client.get(
        "/api/v1/stock-gestionnaire/documents",
        headers=stock_gestionnaire_headers,
        params={"statement_type": "JOURNALIER"}
    )
    filtered_count = len(res_filtered.json()["items"])
    
    # Then reset filters (no parameters)
    res_all = client.get(
        "/api/v1/stock-gestionnaire/documents",
        headers=stock_gestionnaire_headers
    )
    all_count = len(res_all.json()["items"])
    
    # All should be >= filtered (resetting should return more or equal)
    assert all_count >= filtered_count


def test_get_document_file_unauthorized(client: TestClient, sample_stock_document):
    """Test that downloading document requires authentication."""
    res = client.get(f"/api/v1/stock-gestionnaire/documents/{sample_stock_document.id}/file")
    assert res.status_code == 401


@pytest.fixture
async def different_marketer_user(async_db: AsyncSession) -> User:
    """Create a marketer with a different distributor code for testing."""
    pwd_hash = bcrypt.hashpw("password123".encode("utf-8"), bcrypt.gensalt()).decode("utf-8")
    user = User(
        name="Different Marketer",
        email="different_marketer@scdp.com",
        password_hash=pwd_hash,
        role=Role.MARKETER,
        distributor_code="TF",  # Different from the document's "AB"
        is_active=True,
    )
    async_db.add(user)
    await async_db.commit()
    await async_db.refresh(user)
    return user


@pytest.fixture
def different_marketer_headers(different_marketer_user: User) -> dict:
    """Authorization headers for the different marketer user."""
    token = create_access_token({"sub": different_marketer_user.id, "email": different_marketer_user.email, "role": different_marketer_user.role.value})
    return {"Authorization": f"Bearer {token}"}


def test_get_document_file_marketer_wrong_distributor(client: TestClient, different_marketer_headers: dict, sample_stock_document, different_marketer_user):
    """Test that marketer cannot access documents from other distributors."""
    res = client.get(
        f"/api/v1/stock-gestionnaire/documents/{sample_stock_document.id}/file",
        headers=different_marketer_headers
    )
    # Should be forbidden since marketer's distributor doesn't match
    assert res.status_code in [403, 404]


def test_document_metadata_fields(client: TestClient, stock_gestionnaire_headers: dict, sample_stock_document):
    """Test that document response includes all required metadata fields."""
    res = client.get("/api/v1/stock-gestionnaire/documents", headers=stock_gestionnaire_headers)
    assert res.status_code == 200
    data = res.json()
    
    if data["items"]:
        item = data["items"][0]
        # Check for new metadata fields
        assert "statementType" in item
        assert "statementStartDate" in item
        assert "statementEndDate" in item
        assert "uploadedAt" in item
        assert "fileName" in item
        assert "depotCode" in item
        assert "distributorCode" in item