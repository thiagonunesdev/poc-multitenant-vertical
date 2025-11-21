import express from "express";
import { createProxyMiddleware } from "http-proxy-middleware";

const app = express();

// ADMIN: tudo que começa com /admin vai para o Next admin (porta 3200)
app.use(
  "/admin",
  createProxyMiddleware({
    target: "http://localhost:3200",
    changeOrigin: true,
    pathRewrite: {
      "^/admin": "/", // /admin/org/acme_motors -> /org/acme_motors no app admin
    },
  })
);

// STOREFRONT: qualquer outra rota cai aqui (porta 3000)
app.use(
  "/",
  createProxyMiddleware({
    target: "http://localhost:3000",
    changeOrigin: true,
  })
);

const PORT = 4000;

app.listen(PORT, () => {
  console.log(`Gateway rodando em http://localhost:${PORT}`);
});
