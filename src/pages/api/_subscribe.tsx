import { prisma } from "../../services/prisma";

interface IPaymentParams {
  custumerId: string;
  subscriptionId: string;
}

export async function PaymentSuccess({
  custumerId,
  subscriptionId,
}: IPaymentParams) {
  console.log(custumerId);
  console.log(subscriptionId);

  console.log("entrou na funcao do webhook");
  const findUser = await prisma.user.findFirst({
    where: {
      custumerId,
    },
  });
  console.log(findUser);

  if (findUser) {
    const result = await prisma.user.update({
      where: {
        id: findUser.id,
      },
      data: {
        solds: subscriptionId,
      },
    });
    console.log({ sucess: true });
    console.log(result);
  }

  return;
}
