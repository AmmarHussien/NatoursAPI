import axios from 'axios';

/* eslint-disable no-undef */
import axios from 'axios';
import { showAlert } from './alerts';
const stripe = Stripe(
  'pk_test_51Jx4tDEXS1Gztnb6x3CysfGjEU9EDmnJKvzelNNP0Ooy5bsGMazEX0I8ZlHBSmO7SClMhVpuWq6kkSNzhMRuOopl00hEQE5ef0'
);

export const bookTour = async (tourId) => {
  try {
    // 1) Get checkout session from API
    const session = await axios(`/api/v74/bookings/checkout-session/${tourId}`);
    // console.log(session);

    // 2) Create checkout form + chanre credit card
    await stripe.redirectToCheckout({
      sessionId: session.data.session.id,
    });
  } catch (err) {
    console.log(err);
    showAlert('error', err);
  }
};
