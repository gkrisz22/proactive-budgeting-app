"""
Rule engine: converts budget rules + income into per-category currency amounts.

Each rule has a label and a percentage.  The engine multiplies the monthly
income by each percentage and returns a list of dicts with the computed amount.
Rounding is done with banker's rounding and a final correction pass so that the
sum of all amounts equals exactly (income * total_pct / 100) to within 1 unit.
"""

from typing import List


def calculate_budget(
    rules: List[dict],
    monthly_income: float,
    currency: str = "HUF",
) -> List[dict]:
    """
    Args:
        rules: list of {"label": str, "percentage": float}
        monthly_income: gross monthly income in the given currency
        currency: currency code (e.g. "HUF", "EUR")

    Returns:
        list of {"label": str, "percentage": float, "amount": float, "currency": str}

    Raises:
        ValueError: if percentages do not sum to 100 (±0.01 tolerance)
    """
    if not rules:
        return []

    total_pct = sum(r["percentage"] for r in rules)
    if abs(total_pct - 100.0) > 0.01:
        raise ValueError(f"Rule percentages must sum to 100. Got: {round(total_pct, 4)}")

    # Compute raw (unrounded) amounts
    raw_amounts = [monthly_income * r["percentage"] / 100.0 for r in rules]

    # Floor each amount
    floored = [_huf_floor(a, currency) for a in raw_amounts]

    # The total we expect
    expected_total = _huf_floor(monthly_income * total_pct / 100.0, currency)

    # Distribute leftover cents/forints by largest remainder
    remainders = [raw_amounts[i] - floored[i] for i in range(len(rules))]
    deficit = round(expected_total - sum(floored), _decimal_places(currency))

    # Give +1 unit to the items with the largest remainders first
    unit = 10 ** -_decimal_places(currency)
    indices_by_remainder = sorted(range(len(rules)), key=lambda i: remainders[i], reverse=True)
    units_to_distribute = round(deficit / unit)
    for i in range(int(units_to_distribute)):
        floored[indices_by_remainder[i]] += unit

    result = []
    for i, rule in enumerate(rules):
        result.append(
            {
                "label": rule["label"],
                "percentage": rule["percentage"],
                "amount": round(floored[i], _decimal_places(currency)),
                "currency": currency,
            }
        )

    return result


def _decimal_places(currency: str) -> int:
    """Return sensible decimal places for a currency."""
    return 0 if currency == "HUF" else 2


def _huf_floor(value: float, currency: str) -> float:
    """Floor to the smallest unit for the given currency."""
    import math
    places = _decimal_places(currency)
    factor = 10 ** places
    return math.floor(value * factor) / factor
