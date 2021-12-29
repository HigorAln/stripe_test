import NextAuth from "next-auth";
import Github from "next-auth/providers/github";
import { prisma } from "../../../services/prisma";

export default NextAuth({
  providers: [
    Github({
      clientId: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_SECRET,
    }),
  ],
  callbacks: {
    async signIn({ user }) {
      const userAlReadyExists = await prisma.user.findFirst({
        where: {
          email: user.email,
        },
      });

      if (!userAlReadyExists) {
        await prisma.user.create({
          data: {
            name: user.name,
            email: user.email,
            avatar_url: user.image,
          },
        });
        return true;
      }
      return true;
    },
  },
});
