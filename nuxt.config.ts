// file: nuxt.config.ts
export default defineNuxtConfig({
  compatibilityDate: "2024-11-01",
  devtools: { enabled: true },

  runtimeConfig: {
    // Definisikan semua variabel database di sini
    //
    //
    databaseUrl: process.env.DATABASE_URL,
    // Anda bisa tetap menyimpan variabel lain di sini
    stackSecretServerKey: process.env.STACK_SECRET_SERVER_KEY,

    public: {
      stackProjectId: process.env.NUXT_PUBLIC_STACK_PROJECT_ID,
      stackPublishableClientKey:
        process.env.NUXT_PUBLIC_STACK_PUBLISHABLE_CLIENT_KEY,
    },
  },

  nitro: {
    publicAssets: [
      {
        dir: "public/uploads",
        baseURL: "/uploads",
        maxAge: 60 * 60 * 24 * 365, // 1 year
      },
    ],
    serveStatic: true,
  },
});
