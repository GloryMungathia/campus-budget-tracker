EXPENSE_CATEGORIES = {
    "food",
    "transport",
    "rent",
    "airtime",
    "books",
    "entertainment",
    "health",
    "shopping",
    "other_expense",
}

INCOME_CATEGORIES = {
    "helb",
    "pocket_money",
    "side_hustle",
    "other_income",
}


def category_matches_type(category_id: str, tx_type: str) -> bool:
    if tx_type == "expense":
        return category_id in EXPENSE_CATEGORIES
    if tx_type == "income":
        return category_id in INCOME_CATEGORIES
    return False