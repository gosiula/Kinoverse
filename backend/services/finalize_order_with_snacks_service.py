from repositories.finalize_order_with_snacks_repository import (
    set_order_email_and_status,
    add_snacks_to_order,
    get_showing_type,
    create_school_order
)

class FinalizeOrderBase:
    def __init__(self, order_id, email):
        self.order_id = order_id
        self.email = email

    def finalize(self):
        success = set_order_email_and_status(self.order_id, self.email)
        return success, self.order_id


class OrderDecorator(FinalizeOrderBase):
    def __init__(self, wrapped):
        self._wrapped = wrapped

    def finalize(self):
        return self._wrapped.finalize()


class SnacksOrderDecorator(OrderDecorator):
    def __init__(self, wrapped, snack_quantities):
        super().__init__(wrapped)
        self.snack_quantities = snack_quantities

    def finalize(self):
        base_success, order_id = self._wrapped.finalize()
        if not base_success:
            return False, order_id

        success = add_snacks_to_order(order_id, self.snack_quantities)
        return success, order_id


# class FinalizeOrderFactory:
#     @staticmethod
#     def create(showing_id, email, snack_quantities, order_id=None):
#         showing_type = get_showing_type(showing_id)

#         # Dla SCHOOL tworzymy zamówienie dopiero teraz
#         if showing_type == "school":
#             new_order_id = create_school_order(showing_id)
#             base = FinalizeOrderBase(new_order_id, email)
#         elif showing_type == "normal":
#             if not order_id:
#                 raise ValueError("Brak orderId dla seansu typu 'normal'")
#             base = FinalizeOrderBase(order_id, email)
#         else:
#             raise ValueError(f"Nieobsługiwany typ seansu: {showing_type}")

#         # if snack_quantities and any(int(qty) > 0 for qty in snack_quantities.values()):
#         #     return SnacksOrderDecorator(base, snack_quantities)
#         # else:
#         #     return base
#         return SnacksOrderDecorator(base, snack_quantities)
