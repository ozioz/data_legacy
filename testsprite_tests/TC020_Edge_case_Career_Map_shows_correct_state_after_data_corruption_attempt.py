import requests

BASE_URL = "http://localhost:5173"
TIMEOUT = 30
HEADERS = {
    "Accept": "application/json",
    "Content-Type": "application/json",
}

def test_career_map_normal_load():
    """
    Test Case TC020:
    Verify Career Map loads correctly and returns the expected data.
    """
    session = requests.Session()
    try:
        response = session.get(f"{BASE_URL}/career-map", headers=HEADERS, timeout=TIMEOUT)
        assert response.status_code == 200, f"Expected 200 OK but got {response.status_code}"
        try:
            data = response.json()
        except ValueError:
            assert False, "Response is not valid JSON."
        assert isinstance(data, dict), "Response JSON is not an object as expected for career map."
    except requests.RequestException as e:
        assert False, f"HTTP request failed: {str(e)}"

test_career_map_normal_load()
