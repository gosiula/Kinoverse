# strategies/ticket_price_strategy.py

class TicketPriceStrategy:
    def get_price(self, showing_price_row, room_capacity):
        raise NotImplementedError

class NormalPriceStrategy(TicketPriceStrategy):
    def get_price(self, showing_price_row, room_capacity):
        return showing_price_row['normal']

class ReducedPriceStrategy(TicketPriceStrategy):
    def get_price(self, showing_price_row, room_capacity):
        return showing_price_row['reduced']

class SeniorPriceStrategy(TicketPriceStrategy):
    def get_price(self, showing_price_row, room_capacity):
        return showing_price_row['senior']

class SchoolPriceStrategy(TicketPriceStrategy):
    def get_price(self, showing_price_row, room_capacity):
        if room_capacity <= 0:
            return showing_price_row['school']  # Zabezpieczenie przed dzieleniem przez zero
        return round(showing_price_row['school'] / room_capacity, 2)