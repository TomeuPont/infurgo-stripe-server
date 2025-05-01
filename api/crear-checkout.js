
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).send({ message: 'Only POST requests allowed' });
  }

  const { carrito } = req.body;

  const line_items = carrito.map(item => ({
    price_data: {
      currency: 'eur',
      product_data: {
        name: item.nombre,
        description: item.opciones.join(', ')
      },
      unit_amount: item.precio * 100
    },
    quantity: 1
  }));

  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items,
      mode: 'payment',
      success_url: 'https://infurgo.vercel.app/success.html',
      cancel_url: 'https://infurgo.vercel.app/cancel.html'
    });

    res.status(200).json({ id: session.id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
