from .ticket_price_strategy import (
    NormalPriceStrategy, ReducedPriceStrategy,
    SeniorPriceStrategy, SchoolPriceStrategy
)

def get_price_strategy(ticket_type):
    strategies = {
        'normal': NormalPriceStrategy(),
        'reduced': ReducedPriceStrategy(),
        'senior': SeniorPriceStrategy(),
        'school': SchoolPriceStrategy()
    }
    return strategies.get(ticket_type, NormalPriceStrategy())