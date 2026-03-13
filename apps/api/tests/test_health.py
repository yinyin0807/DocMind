from io import BytesIO

from fastapi.testclient import TestClient

from app.main import app

client = TestClient(app)


def test_healthcheck() -> None:
    response = client.get("/health")

    assert response.status_code == 200
    assert response.json() == {"status": "ok"}


def test_list_papers() -> None:
    response = client.get("/api/papers")

    assert response.status_code == 200
    payload = response.json()
    assert payload["total"] >= 3
    assert any(item["id"] == "paper-1" for item in payload["items"])
    assert all("title" in item for item in payload["items"])


def test_import_paper() -> None:
    response = client.post(
        "/api/papers/import",
        data={
            "title": "Uploaded Test Paper",
            "authors": "Tester One",
            "year": "2026",
            "venue": "Local Upload",
            "focus": "导入接口测试",
            "tags": "测试,上传",
        },
        files={"file": ("uploaded-test-paper.pdf", BytesIO(b"%PDF-1.4 mock file"), "application/pdf")},
    )

    assert response.status_code == 200
    payload = response.json()
    assert payload["title"] == "Uploaded Test Paper"
    assert payload["status"] == "待解析"
    assert payload["stored_filename"].endswith("uploaded-test-paper.pdf")

    list_response = client.get("/api/papers")
    assert any(item["id"] == payload["id"] for item in list_response.json()["items"])


def test_get_paper_detail() -> None:
    response = client.get("/api/papers/paper-1")

    assert response.status_code == 200
    payload = response.json()
    assert payload["id"] == "paper-1"
    assert payload["venue"] == "ACL Findings"
    assert payload["focus"]


def test_get_paper_analysis() -> None:
    response = client.get("/api/papers/paper-1/analysis")

    assert response.status_code == 200
    payload = response.json()
    assert payload["paper_id"] == "paper-1"
    assert payload["translations"]["title_zh"]
    assert payload["citations"]["apa"]


def test_get_chat_history() -> None:
    response = client.get("/api/papers/paper-1/chat")

    assert response.status_code == 200
    payload = response.json()
    assert payload["session"]["paper_id"] == "paper-1"
    assert len(payload["messages"]) >= 1


def test_ask_about_paper() -> None:
    response = client.post(
        "/api/papers/paper-1/chat",
        json={"question": "这篇论文的核心贡献是什么？"},
    )

    assert response.status_code == 200
    payload = response.json()
    assert payload["user_message"]["role"] == "user"
    assert payload["assistant_message"]["role"] == "assistant"
    assert payload["assistant_message"]["content"]


def test_create_and_get_task() -> None:
    create_response = client.post("/api/papers/paper-1/summary-tasks")

    assert create_response.status_code == 200
    created = create_response.json()
    assert created["task_type"] == "summary"

    detail_response = client.get(f"/api/tasks/{created['task_id']}")

    assert detail_response.status_code == 200
    detail = detail_response.json()
    assert detail["id"] == created["task_id"]
    assert detail["status"] == "done"
