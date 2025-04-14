from repositories.snacks_repository import fetch_snacks_grouped

def get_available_snacks():
    snacks = fetch_snacks_grouped()

    grouped = {
        "jedzenie": [],
        "picie": []
    }

    for snack in snacks:
        cat = snack["cathegory"].lower()
        if cat == "jedzenie":
            grouped["jedzenie"].append(snack)
        elif cat == "picie":
            grouped["picie"].append(snack)

    return grouped
