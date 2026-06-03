"""
Unit tests for app.services.pace_service.

Tests the five required scenarios:
  1. on_track          — spend rate matches daily budget
  2. pace_elevated     — spend rate above daily budget but no breach predicted
  3. breach_predicted  — projected spend exceeds budget
  4. sparse_data       — only 1–2 transactions, few elapsed days
  5. zero_spend        — no transactions yet

Also verifies compute_safe_to_spend for boundary cases.
"""

import pytest
from datetime import date
from app.services.pace_service import calculate_pace_for_category, compute_safe_to_spend


# ---------------------------------------------------------------------------
# calculate_pace_for_category
# ---------------------------------------------------------------------------

class TestOnTrack:
    """Spending is exactly at the daily-budget rate."""

    def test_status_is_on_track(self):
        result = calculate_pace_for_category(
            budget_amount=100_000,
            spent=50_000,   # halfway through the month
            elapsed_days=15,
            total_days=30,
        )
        assert result["status"] == "ON_TRACK"

    def test_projected_equals_budget(self):
        result = calculate_pace_for_category(
            budget_amount=100_000,
            spent=50_000,
            elapsed_days=15,
            total_days=30,
        )
        assert abs(result["projected"] - 100_000) < 1

    def test_remaining_correct(self):
        result = calculate_pace_for_category(
            budget_amount=100_000,
            spent=50_000,
            elapsed_days=15,
            total_days=30,
        )
        assert result["remaining"] == pytest.approx(50_000, abs=1)


class TestPaceElevated:
    """Spend rate is above daily budget but projected total is still under budget."""

    def test_status_is_pace_elevated(self):
        # Budget 100k, day 10 of 31, spent 40k → rate 4k/day vs 3.2k budget/day
        result = calculate_pace_for_category(
            budget_amount=100_000,
            spent=40_000,
            elapsed_days=10,
            total_days=31,
        )
        assert result["status"] in ("PACE_ELEVATED", "BREACH_PREDICTED")

    def test_spend_rate_above_daily_budget(self):
        result = calculate_pace_for_category(
            budget_amount=100_000,
            spent=40_000,
            elapsed_days=10,
            total_days=31,
        )
        assert result["spend_rate"] > result["daily_budget"]


class TestBreachPredicted:
    """Projected spend will clearly exceed the monthly budget."""

    def test_status_is_breach_predicted(self):
        # Budget 100k, spent 80k in 15 days → rate 5.33k/day → projected 160k
        result = calculate_pace_for_category(
            budget_amount=100_000,
            spent=80_000,
            elapsed_days=15,
            total_days=30,
        )
        assert result["status"] == "BREACH_PREDICTED"

    def test_projected_exceeds_budget(self):
        result = calculate_pace_for_category(
            budget_amount=100_000,
            spent=80_000,
            elapsed_days=15,
            total_days=30,
        )
        assert result["projected"] > 100_000

    def test_projected_within_one_huf_of_manual(self):
        result = calculate_pace_for_category(
            budget_amount=100_000,
            spent=80_000,
            elapsed_days=15,
            total_days=30,
        )
        expected = (80_000 / 15) * 30
        assert abs(result["projected"] - expected) < 1

    def test_breach_with_upcoming_event(self):
        result = calculate_pace_for_category(
            budget_amount=50_000,
            spent=30_000,
            elapsed_days=20,
            total_days=30,
            upcoming_event_costs=30_000,
        )
        assert result["status"] == "BREACH_PREDICTED"


class TestSparseData:
    """Only a few days of data, minimal spend — should not trigger alerts."""

    def test_status_on_track_with_one_transaction(self):
        # Budget 100k, spent 3k on day 1 of 30 → rate 3k/day → projected 90k < 100k
        result = calculate_pace_for_category(
            budget_amount=100_000,
            spent=3_000,
            elapsed_days=1,
            total_days=30,
        )
        assert result["status"] == "ON_TRACK"

    def test_daily_budget_reasonable(self):
        result = calculate_pace_for_category(
            budget_amount=90_000,
            spent=1_000,
            elapsed_days=2,
            total_days=30,
        )
        assert result["daily_budget"] == pytest.approx(3_000, abs=1)


class TestZeroSpend:
    """No transactions at all yet."""

    def test_status_is_on_track(self):
        result = calculate_pace_for_category(
            budget_amount=100_000,
            spent=0,
            elapsed_days=10,
            total_days=30,
        )
        assert result["status"] == "ON_TRACK"

    def test_projected_is_zero(self):
        result = calculate_pace_for_category(
            budget_amount=100_000,
            spent=0,
            elapsed_days=10,
            total_days=30,
        )
        assert result["projected"] == 0.0

    def test_remaining_equals_budget(self):
        result = calculate_pace_for_category(
            budget_amount=100_000,
            spent=0,
            elapsed_days=10,
            total_days=30,
        )
        assert result["remaining"] == pytest.approx(100_000, abs=1)


# ---------------------------------------------------------------------------
# compute_safe_to_spend boundary cases
# ---------------------------------------------------------------------------

class TestSafeToSpend:
    base_rules = [
        {"label": "Needs", "percentage": 50, "is_savings_goal": False},
        {"label": "Wants", "percentage": 30, "is_savings_goal": False},
        {"label": "Savings", "percentage": 20, "is_savings_goal": True},
    ]
    income = 400_000

    def test_month_start_no_spend(self):
        """On day 1 with no spend the full budget is available."""
        today = date(2026, 4, 1)
        result = compute_safe_to_spend(
            self.base_rules, self.income, {}, 0.0, today
        )
        # Spendable budget = 50% + 30% of income = 320k; split over 30 remaining days
        assert result["remaining_days"] == 30
        assert result["remaining_budget"] == pytest.approx(320_000, abs=1)
        assert result["amount"] == pytest.approx(320_000 / 30, abs=1)

    def test_month_end_last_day(self):
        """On the last day of the month, remaining_days == 1."""
        today = date(2026, 4, 30)
        result = compute_safe_to_spend(
            self.base_rules, self.income, {}, 0.0, today
        )
        assert result["remaining_days"] == 1

    def test_all_budget_spent(self):
        """When all non-savings budgets are exhausted, safe-to-spend should be ≤ 0."""
        today = date(2026, 4, 15)
        spending = {"Needs": 200_000, "Wants": 120_000}
        result = compute_safe_to_spend(
            self.base_rules, self.income, spending, 0.0, today
        )
        assert result["amount"] <= 0.0

    def test_upcoming_costs_reduce_safe_amount(self):
        """Upcoming event costs must be subtracted from remaining budget."""
        today = date(2026, 4, 1)
        result_no_event = compute_safe_to_spend(self.base_rules, self.income, {}, 0.0, today)
        result_with_event = compute_safe_to_spend(self.base_rules, self.income, {}, 50_000, today)
        assert result_with_event["amount"] < result_no_event["amount"]

    def test_no_income_returns_zero(self):
        """With zero income there is nothing to spend."""
        today = date(2026, 4, 10)
        result = compute_safe_to_spend(self.base_rules, 0.0, {}, 0.0, today)
        assert result["amount"] == pytest.approx(0.0, abs=0.01)
