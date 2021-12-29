import axios from "axios";
import { signIn, signOut, useSession } from "next-auth/react";
import { api } from "../services/axios";
import { getStripeJs } from "../services/stripe-front";

interface ResponseApi {
  sessionId: string;
}

export default function Home() {
  const { data: session } = useSession();

  const handleSold = async () => {
    try {
      const response = await axios.post<ResponseApi>("/api/sold");

      const stripe = await getStripeJs();

      await stripe.redirectToCheckout({ sessionId: response.data.sessionId });
    } catch (e) {
      alert(e.message);
    }
  };

  return (
    <>
      <h1>Hello world</h1>
      {!session ? (
        <button onClick={() => signIn("github")}>Auth with Github</button>
      ) : (
        <>
          <button onClick={() => signOut()}>SignOut</button>
          <button onClick={handleSold}>Sold now</button>
        </>
      )}
    </>
  );
}
