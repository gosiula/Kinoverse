from repositories.finalize_order_with_snacks_repository import get_showing_type, create_school_order
from services.finalize_order_with_snacks_service import FinalizeOrderBase, SnacksOrderDecorator, set_order_email_and_status, add_snacks_to_order


class OrderFinalizationFacade:
    @staticmethod
    def finalize_order(showing_id, email, snack_quantities=None, order_id=None):
        try:
            showing_type = get_showing_type(showing_id)

            if showing_type == "school":
                new_order_id = create_school_order(showing_id)
                if new_order_id is None:
                    raise ValueError("Nie udało się utworzyć zamówienia szkolnego")
                base = FinalizeOrderBase(new_order_id, email)

            elif showing_type == "normal":
                if not order_id:
                    raise ValueError("Brak orderId dla seansu typu 'normal'")
                base = FinalizeOrderBase(order_id, email)
            else:
                raise ValueError(f"Nieobsługiwany typ seansu: {showing_type}")

            if snack_quantities and any(int(qty) > 0 for qty in snack_quantities.values()):
                decorated = SnacksOrderDecorator(base, snack_quantities)
                return decorated.finalize()
            else:
                return base.finalize()

        except Exception as e:
            print(f"Błąd fasady podczas finalizacji zamówienia: {e}")
            return False, None
