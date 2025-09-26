# 🚗 VagaSC - Marketplace de Estacionamento Privado

Um marketplace completo de estacionamento privado para Florianópolis, conectando proprietários de vagas com motoristas.

## 🚀 Stack Tecnológico

- **Frontend:** Next.js 14 + TypeScript + Tailwind CSS + shadcn/ui
- **Backend:** Neon Database (PostgreSQL) + Prisma ORM
- **Auth:** NextAuth.js v5
- **Maps:** Google Maps API
- **Payments:** Stripe + PIX
- **Deploy:** Vercel
- **Real-time:** Pusher ou Socket.io

## 📋 Funcionalidades

### ✅ Implementadas
- [x] Setup inicial do projeto Next.js 14
- [x] Configuração do Prisma com schema completo
- [x] Sistema de autenticação com NextAuth.js v5
- [x] Interface com shadcn/ui e Tailwind CSS
- [x] Página inicial responsiva
- [x] Sistema de login e registro
- [x] Dashboard para proprietários
- [x] Página de busca de vagas
- [x] API de busca e filtros

### 🚧 Em Desenvolvimento
- [ ] Integração com Google Maps
- [ ] Sistema de pagamentos Stripe
- [ ] CRUD completo de vagas
- [ ] Sistema de reservas
- [ ] Sistema de avaliações
- [ ] Upload de imagens
- [ ] Notificações em tempo real

## 🛠️ Configuração do Ambiente

### 1. Clone o repositório
```bash
git clone <repository-url>
cd VagaSC
```

### 2. Instale as dependências
```bash
npm install
```

### 3. Configure as variáveis de ambiente
Crie um arquivo `.env.local` na raiz do projeto:

```env
# Database (Neon)
DATABASE_URL="postgresql://user:password@host/database?sslmode=require"
DIRECT_URL="postgresql://user:password@host/database?sslmode=require"

# NextAuth
NEXTAUTH_SECRET="your-secret-key"
NEXTAUTH_URL="http://localhost:3000"

# Google OAuth
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"

# Google Maps
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY="your-maps-api-key"

# Stripe
STRIPE_SECRET_KEY="sk_test_..."
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."

# Upload (Cloudinary)
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME="your-cloud-name"
CLOUDINARY_API_KEY="your-api-key"
CLOUDINARY_API_SECRET="your-api-secret"
```

### 4. Configure o banco de dados
```bash
# Gere o cliente Prisma
npx prisma generate

# Execute as migrações (quando configurar o banco)
npx prisma db push
```

### 5. Execute o projeto
```bash
npm run dev
```

Acesse [http://localhost:3000](http://localhost:3000) para ver a aplicação.

## 📁 Estrutura do Projeto

```
src/
├── app/
│   ├── (auth)/
│   │   ├── login/page.tsx
│   │   └── register/page.tsx
│   ├── (dashboard)/
│   │   └── dashboard/page.tsx
│   ├── api/
│   │   ├── auth/
│   │   ├── dashboard/
│   │   └── spaces/
│   ├── search/page.tsx
│   ├── layout.tsx
│   └── page.tsx
├── components/
│   ├── ui/ (shadcn components)
│   ├── layout/
│   └── providers/
├── lib/
│   ├── auth.ts
│   ├── db.ts
│   ├── stripe.ts
│   ├── utils.ts
│   └── validations.ts
├── types/
└── middleware.ts
```

## 🎨 Design System

### Cores
- **Primary:** #0077BE (Azul principal)
- **Secondary:** #00A86B (Verde)
- **Accent:** #FFB800 (Amarelo)

### Componentes
- Baseado no shadcn/ui
- Design responsivo mobile-first
- Acessibilidade WCAG 2.1

## 🔐 Autenticação

O sistema suporta:
- Login com email/senha
- Login com Google OAuth
- Registro de novos usuários
- Middleware de proteção de rotas

## 📊 Dashboard

O dashboard inclui:
- Estatísticas de vagas e reservas
- Ganhos e métricas
- Reservas recentes
- Gerenciamento de vagas

## 🔍 Busca de Vagas

Funcionalidades de busca:
- Filtros por localização, preço, tipo
- Filtros por comodidades
- Filtros por tipo de veículo
- Interface responsiva

## 🚀 Deploy

### Vercel (Recomendado)
1. Conecte seu repositório ao Vercel
2. Configure as variáveis de ambiente
3. Deploy automático

### Outras plataformas
- Netlify
- Railway
- DigitalOcean App Platform

## 📝 Próximos Passos

1. **Configurar banco de dados Neon**
2. **Integrar Google Maps API**
3. **Configurar Stripe para pagamentos**
4. **Implementar upload de imagens**
5. **Adicionar sistema de notificações**
6. **Implementar testes**
7. **Otimizar performance**

## 🤝 Contribuição

1. Fork o projeto
2. Crie uma branch para sua feature
3. Commit suas mudanças
4. Push para a branch
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

## 📞 Suporte

Para suporte, entre em contato:
- Email: suporte@vagasc.com
- Discord: [Link do servidor]
- Issues: [GitHub Issues]

---

**VagaSC** - Conectando Florianópolis através do estacionamento inteligente 🚗✨