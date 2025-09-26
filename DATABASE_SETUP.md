# 🗄️ Configuração do Banco de Dados

## Problema Atual
A `DATABASE_URL` está configurada com valores de exemplo, causando erro de conexão.

## Soluções

### Opção 1: Neon PostgreSQL (Recomendado)
1. Acesse: https://console.neon.tech/
2. Crie uma conta gratuita
3. Crie um novo projeto
4. Copie a string de conexão
5. Substitua no `.env.local`:

```bash
DATABASE_URL="postgresql://usuario:senha@host.neon.tech/database?sslmode=require"
```

### Opção 2: SQLite Local (Para teste rápido)
Se quiser testar rapidamente, posso configurar SQLite:

1. Instalar SQLite:
```bash
npm install sqlite3
```

2. Configurar `.env.local`:
```bash
DATABASE_URL="file:./dev.db"
```

3. Executar migração:
```bash
npx prisma migrate dev
```

### Opção 3: PostgreSQL Local
Se tiver PostgreSQL instalado localmente:

```bash
DATABASE_URL="postgresql://postgres:senha@localhost:5432/vagasc"
```

## Próximos Passos
1. Configure a DATABASE_URL
2. Execute: `npx prisma migrate dev`
3. Teste a aplicação

**Qual opção prefere?**
