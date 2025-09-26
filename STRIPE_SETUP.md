# 🚀 Configuração do Stripe - VagaSC

## 1. Configurar Banco de Dados (Neon)

### Opção A: Usar string de conexão existente
Se você já tem uma string de conexão do Neon, substitua no `.env.local`:

```bash
DATABASE_URL="sua_string_de_conexao_aqui"
```

### Opção B: Criar novo projeto Neon
1. Acesse: https://console.neon.tech/
2. Crie um novo projeto
3. Copie a string de conexão
4. Substitua no `.env.local`

## 2. Configurar Stripe

### Criar conta no Stripe:
1. Acesse: https://dashboard.stripe.com/
2. Crie uma conta (modo teste)
3. Vá em "Developers" > "API keys"
4. Copie as chaves de teste

### Adicionar no `.env.local`:
```bash
# Stripe (para pagamentos)
STRIPE_PUBLISHABLE_KEY="pk_test_..."
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."
```

## 3. Executar Migração do Banco

```bash
npx prisma migrate dev --name add-stripe-payment-fields
```

## 4. Configurar Webhook do Stripe

1. No dashboard do Stripe, vá em "Developers" > "Webhooks"
2. Clique em "Add endpoint"
3. URL: `http://localhost:3000/api/stripe/webhook`
4. Eventos para escutar:
   - `checkout.session.completed`
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
5. Copie o "Signing secret" para `STRIPE_WEBHOOK_SECRET`

## 5. Testar o Sistema

1. Inicie o servidor: `npm run dev`
2. Faça login na aplicação
3. Crie uma reserva
4. Teste o pagamento com cartão de teste: `4242 4242 4242 4242`

## Cartões de Teste Stripe

- **Sucesso**: 4242 4242 4242 4242
- **Falha**: 4000 0000 0000 0002
- **3D Secure**: 4000 0025 0000 3155

**Data**: Qualquer data futura
**CVC**: Qualquer 3 dígitos
