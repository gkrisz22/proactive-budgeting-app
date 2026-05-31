"""
Unit tests for app.services.rule_engine.calculate_budget.

Covers the three canonical splits (60/20/20, 50/30/20, custom) and verifies
that rounding error is < 1 HUF / 0.01 EUR.
"""

import pytest
from app.services.rule_engine import calculate_budget


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def _total_amount(result):
    return sum(r["amount"] for r in result)


def _max_rounding_error(result, monthly_income):
    expected = sum(monthly_income * r["percentage"] / 100 for r in result)
    return abs(_total_amount(result) - expected)


# ---------------------------------------------------------------------------
# 60 / 20 / 20 split — HUF
# ---------------------------------------------------------------------------

class TestSplit602020HUF:
    rules = [
        {"label": "Needs", "percentage": 60},
        {"label": "Wants", "percentage": 20},
        {"label": "Savings", "percentage": 20},
    ]
    income = 500_000  # 500 000 HUF

    def test_labels_preserved(self):
        result = calculate_budget(self.rules, self.income, "HUF")
        labels = [r["label"] for r in result]
        assert labels == ["Needs", "Wants", "Savings"]

    def test_amounts_correct(self):
        result = calculate_budget(self.rules, self.income, "HUF")
        assert result[0]["amount"] == 300_000
        assert result[1]["amount"] == 100_000
        assert result[2]["amount"] == 100_000

    def test_sum_equals_income(self):
        result = calculate_budget(self.rules, self.income, "HUF")
        assert _total_amount(result) == self.income

    def test_rounding_error_less_than_one_huf(self):
        result = calculate_budget(self.rules, self.income, "HUF")
        assert _max_rounding_error(result, self.income) < 1

    def test_currency_set(self):
        result = calculate_budget(self.rules, self.income, "HUF")
        assert all(r["currency"] == "HUF" for r in result)


# ---------------------------------------------------------------------------
# 50 / 30 / 20 split — HUF
# ---------------------------------------------------------------------------

class TestSplit503020HUF:
    rules = [
        {"label": "Needs", "percentage": 50},
        {"label": "Wants", "percentage": 30},
        {"label": "Savings", "percentage": 20},
    ]
    income = 400_000  # 400 000 HUF

    def test_amounts_correct(self):
        result = calculate_budget(self.rules, self.income, "HUF")
        assert result[0]["amount"] == 200_000
        assert result[1]["amount"] == 120_000
        assert result[2]["amount"] == 80_000

    def test_sum_equals_income(self):
        result = calculate_budget(self.rules, self.income, "HUF")
        assert _total_amount(result) == self.income

    def test_rounding_error_less_than_one_huf(self):
        result = calculate_budget(self.rules, self.income, "HUF")
        assert _max_rounding_error(result, self.income) < 1


# ---------------------------------------------------------------------------
# Custom / uneven split — HUF (forces remainder distribution)
# ---------------------------------------------------------------------------

class TestCustomSplitHUF:
    rules = [
        {"label": "A", "percentage": 33.33},
        {"label": "B", "percentage": 33.33},
        {"label": "C", "percentage": 33.34},
    ]
    income = 100_000

    def test_percentages_sum_to_100(self):
        total_pct = sum(r["percentage"] for r in self.rules)
        assert abs(total_pct - 100.0) < 0.01

    def test_rounding_error_less_than_one_huf(self):
        result = calculate_budget(self.rules, self.income, "HUF")
        assert _max_rounding_error(result, self.income) < 1

    def test_total_sum_within_one_huf_of_income(self):
        result = calculate_budget(self.rules, self.income, "HUF")
        assert abs(_total_amount(result) - self.income) < 1


# ---------------------------------------------------------------------------
# 50/30/20 — EUR (2 decimal places)
# ---------------------------------------------------------------------------

class TestSplit503020EUR:
    rules = [
        {"label": "Needs", "percentage": 50},
        {"label": "Wants", "percentage": 30},
        {"label": "Savings", "percentage": 20},
    ]
    income = 3_000.00  # EUR

    def test_amounts_correct(self):
        result = calculate_budget(self.rules, self.income, "EUR")
        assert result[0]["amount"] == pytest.approx(1500.00, abs=0.01)
        assert result[1]["amount"] == pytest.approx(900.00, abs=0.01)
        assert result[2]["amount"] == pytest.approx(600.00, abs=0.01)

    def test_rounding_error_less_than_one_cent(self):
        result = calculate_budget(self.rules, self.income, "EUR")
        assert _max_rounding_error(result, self.income) < 0.01


# ---------------------------------------------------------------------------
# Edge: empty rules
# ---------------------------------------------------------------------------

def test_empty_rules_returns_empty_list():
    assert calculate_budget([], 100_000, "HUF") == []


# ---------------------------------------------------------------------------
# Error: percentages don't sum to 100
# ---------------------------------------------------------------------------

def test_invalid_sum_raises_value_error():
    rules = [{"label": "A", "percentage": 60}, {"label": "B", "percentage": 30}]
    with pytest.raises(ValueError, match="sum to 100"):
        calculate_budget(rules, 100_000, "HUF")
