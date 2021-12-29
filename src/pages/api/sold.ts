import { NextApiRequest, NextApiResponse } from "next";
import { getSession } from "next-auth/react";
import { prisma } from "../../services/prisma";
import { stripe } from "../../services/stripe-SSR";

export default async function handle(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method != "POST") {
    res.setHeader("Allow", "POST");
    res.status(405).end("Method not allowed");
  }
  // Pegando o session do Next-Auth
  const session = await getSession({ req });

  // pegando o custumerId do usuario para usar dentro do stripe
  const user = await prisma.user.findFirst({
    where: {
      email: session.user.email,
    },
  });

  let custumerId = user.custumerId;
  // Vendo se o csutumerId ainda nao existe... e criando
  if (!custumerId) {
    const stripeCustumer = await stripe.customers.create({
      email: session.user.email,
    });

    // Atualizando o banco de dados desse novo usaurio para colocar o novo custumerId
    await prisma.user.update({
      where: {
        email: session.user.email,
      },
      data: {
        custumerId: stripeCustumer.id,
      },
    });

    custumerId = stripeCustumer.id;
  }
  // Criando a sessao de chakout no stripe para enviar o usuario para pagamento
  const stripeCheckoutSession = await stripe.checkout.sessions.create({
    customer: custumerId,
    payment_method_types: ["card"],
    billing_address_collection: "auto",
    line_items: [{ price: "price_1KBNynEE1bGb2DEzaeQFNUrU", quantity: 1 }],
    mode: "payment",
    allow_promotion_codes: true,
    success_url: process.env.URL_SUCESS,
    cancel_url: process.env.URL_CANCEL,
  });
  // retornando apenas o id que e necessario para fazer a chamada
  return res.json({ sessionId: stripeCheckoutSession.id });
}
