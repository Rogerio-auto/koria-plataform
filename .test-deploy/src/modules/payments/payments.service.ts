import { Injectable } from '@nestjs/common';

/**
 * Payments service — handles Stripe and Wise payment processing.
 * TODO: Implement createPaymentIntent, handleStripeWebhook, handleWiseWebhook
 * TODO: Update payment_intents and create payment_events
 * TODO: Auto-create work_orders on successful payment
 */
@Injectable()
export class PaymentsService {
  // TODO: Inject database client, Stripe SDK, Wise client
}
