import { useEffect, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import AppLayout from "../components/layout/AppLayout";
import {
  bookParty,
  bookProperty,
  tripsQueryKey,
} from "../lib/bookings";
import { getErrorMessage, type ApiError } from "../lib/errors";
import { linkKey } from "../lib/privateLink";
import {
  clearCheckoutIntent,
  readCheckoutIntent,
} from "../lib/pedxoCheckout";

/** After Pedxo wallet checkout, finish the Hangaut booking that was held for payment. */
const PayReturnPage = () => {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [message, setMessage] = useState("Confirming your payment...");
  const ran = useRef(false);

  useEffect(() => {
    if (ran.current) return;
    ran.current = true;

    const orderId = params.get("order_id") || "";
    const paid =
      params.get("paid") === "1" ||
      params.get("status") === "success" ||
      Boolean(params.get("reference"));
    const intent = readCheckoutIntent(orderId || undefined);

    if (!intent) {
      setMessage("We couldn't find that checkout. Open Reservations or try booking again.");
      window.setTimeout(() => navigate("/reservations?tab=trips", { replace: true }), 2500);
      return;
    }

    if (!paid && !params.get("reference")) {
      // User came back without paying — keep intent briefly and send them to the listing.
      setMessage("Payment wasn't finished. Taking you back to the listing...");
      window.setTimeout(() => {
        navigate(
          intent.kind === "party"
            ? `/parties/${intent.listingId}`
            : `/homes/${intent.listingId}`,
          { replace: true },
        );
      }, 1800);
      return;
    }

    const finish = async () => {
      try {
        if (intent.kind === "party") {
          await bookParty({
            partyId: intent.listingId,
            guests: intent.choices.guests,
            friends: intent.choices.friends,
            hours: intent.choices.hours,
            days: intent.choices.days,
            key: linkKey(),
            withoutTicket: intent.choices.withoutTicket,
            ticketNames: intent.choices.withoutTicket
              ? undefined
              : intent.choices.ticketNames,
          });
        } else {
          await bookProperty({
            propertyId: intent.listingId,
            date: intent.choices.date,
            start_time: intent.choices.start_time,
            hours: intent.choices.hours,
            days: intent.choices.days,
            guests: intent.choices.guests,
            key: linkKey(),
          });
        }
        clearCheckoutIntent();
        await qc.invalidateQueries({ queryKey: tripsQueryKey });
        toast.success("Payment received. You're booked — check Reservations.");
        navigate("/reservations?tab=trips", { replace: true });
      } catch (err) {
        setMessage(
          getErrorMessage(err as ApiError, "Payment worked, but booking failed. Contact support with your order id."),
        );
        toast.error("Couldn't finish the booking after payment");
      }
    };

    void finish();
  }, [navigate, params, qc]);

  return (
    <AppLayout>
      <div className="mx-auto flex min-h-[50vh] max-w-lg flex-col items-center justify-center px-6 text-center">
        <h1 className="text-2xl font-semibold">Hangaut checkout</h1>
        <p className="mt-3 text-sm text-muted-foreground">{message}</p>
        {params.get("order_id") && (
          <p className="mt-2 text-xs text-muted-foreground">
            Order {params.get("order_id")}
          </p>
        )}
      </div>
    </AppLayout>
  );
};

export default PayReturnPage;
