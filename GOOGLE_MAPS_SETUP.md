# Configuração do Google Maps API

## 1. Criar Projeto no Google Cloud Console

1. Acesse o [Google Cloud Console](https://console.cloud.google.com/)
2. Crie um novo projeto ou selecione um existente
3. Ative as seguintes APIs:
   - Maps JavaScript API
   - Geocoding API
   - Places API (opcional, para busca de endereços)

## 2. Configurar Credenciais

1. Vá para "APIs & Services" > "Credentials"
2. Clique em "Create Credentials" > "API Key"
3. Configure as restrições de segurança:
   - **Application restrictions**: HTTP referrers
   - **Website restrictions**: Adicione seus domínios:
     - `localhost:3000/*` (para desenvolvimento)
     - `seu-dominio.com/*` (para produção)

## 3. Configurar Variáveis de Ambiente

Adicione a chave da API ao seu arquivo `.env.local`:

```env
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=sua-chave-aqui
```

## 4. Funcionalidades Implementadas

### Componentes Disponíveis:

1. **GoogleMap**: Componente base do mapa
2. **LocationSelector**: Seletor de localização com busca
3. **ParkingSpacesMap**: Mapa com vagas de estacionamento

### Funcionalidades:

- ✅ Seleção de localização por clique no mapa
- ✅ Busca de endereços
- ✅ Geocodificação e reverse geocodificação
- ✅ Marcadores personalizados por tipo de vaga
- ✅ InfoWindows com detalhes das vagas
- ✅ Integração com formulário de criação de vagas
- ✅ Visualização em mapa na página de busca
- ✅ Botão de localização atual do usuário

### Páginas Integradas:

- ✅ `/user/spaces/create` - Seleção de localização
- ✅ `/search` - Visualização de vagas no mapa

## 5. Custos

O Google Maps API tem um plano gratuito que inclui:
- 28.000 carregamentos de mapa por mês
- 40.000 requisições de geocodificação por mês

Para mais informações, consulte: [Google Maps Pricing](https://cloud.google.com/maps-platform/pricing)

## 6. Troubleshooting

### Erro: "Google Maps não está carregado"
- Verifique se a chave da API está correta
- Verifique se as APIs estão ativadas no Google Cloud Console
- Verifique se as restrições de domínio estão configuradas corretamente

### Erro: "This page can't load Google Maps correctly"
- Verifique se o domínio está nas restrições de HTTP referrers
- Verifique se a chave da API tem as permissões necessárias

### Mapa não carrega
- Verifique a conexão com a internet
- Verifique o console do navegador para erros
- Verifique se a chave da API está no arquivo `.env.local`
