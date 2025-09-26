#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Configurando banco de dados VagaSC...\n');

// Verificar se o arquivo .env.local existe
const envPath = path.join(process.cwd(), '.env.local');
if (!fs.existsSync(envPath)) {
  console.log('❌ Arquivo .env.local não encontrado!');
  console.log('📝 Crie o arquivo .env.local baseado no env.template');
  console.log('🔗 Configure a DATABASE_URL com sua string de conexão do Neon');
  process.exit(1);
}

// Ler o arquivo .env.local
const envContent = fs.readFileSync(envPath, 'utf8');
const databaseUrl = envContent.match(/DATABASE_URL="([^"]+)"/)?.[1];

if (!databaseUrl) {
  console.log('❌ DATABASE_URL não encontrada no .env.local');
  process.exit(1);
}

console.log('✅ DATABASE_URL encontrada');
console.log('🔄 Gerando cliente Prisma...');

try {
  // Gerar cliente Prisma
  execSync('npx prisma generate', { stdio: 'inherit' });
  console.log('✅ Cliente Prisma gerado com sucesso');
  
  console.log('🔄 Executando migração do banco...');
  execSync('npx prisma db push', { stdio: 'inherit' });
  console.log('✅ Migração executada com sucesso');
  
  console.log('🔄 Visualizando banco de dados...');
  execSync('npx prisma studio', { stdio: 'inherit' });
  
} catch (error) {
  console.error('❌ Erro durante a configuração:', error.message);
  process.exit(1);
}
