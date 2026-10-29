"""보존 중지, 다른 branch, 과거 조회 실패가 적용 허용 근거가 되지 않도록 검증한다."""
import copy
import datetime as dt
import unittest
from verify_recovery import verify


class RecoveryTest(unittest.TestCase):
    def setUp(self):
        self.now = dt.datetime(2026, 10, 29, 12, tzinfo=dt.timezone.utc)
        self.project = {"project": {"id": "test-project", "history_retention_seconds": 21600}}
        self.branch = {"branch": {"id": "br-test", "project_id": "test-project", "current_state": "ready"}}
        self.schema = {"sql": "CREATE TABLE public.concept (id bigint);"}
        self.calls = []

    def get(self, path):
        self.calls.append(path)
        return copy.deepcopy(self.schema if "/schema?" in path else self.branch if "/branches/" in path else self.project)

    def run_verification(self):
        return verify(self.get, "test-project", "br-test", "neondb", self.now)

    def test_retained_history_and_real_historical_read(self):
        evidence = self.run_verification()
        self.assertEqual("2026-10-29T12:00:00Z", evidence["verifiedAt"])
        self.assertIn("timestamp=2026-10-29T11%3A55%3A00Z", self.calls[-1])
        self.assertNotIn("CREATE TABLE", str(evidence))

    def test_disabled_history_blocks(self):
        self.project["project"]["history_retention_seconds"] = 0
        with self.assertRaises(ValueError): self.run_verification()
        self.assertEqual(1, len(self.calls))

    def test_wrong_branch_blocks(self):
        self.branch["branch"]["id"] = "br-other"
        with self.assertRaises(ValueError): self.run_verification()

    def test_missing_historical_schema_blocks(self):
        self.schema = {"sql": ""}
        with self.assertRaises(ValueError): self.run_verification()

    def test_provider_error_is_not_converted_to_success(self):
        def unavailable(path): raise TimeoutError("provider unavailable")
        with self.assertRaises(TimeoutError):
            verify(unavailable, "test-project", "br-test", "neondb", self.now)


if __name__ == "__main__": unittest.main()
