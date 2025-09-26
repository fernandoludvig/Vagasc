import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { MapPin, Clock, Shield, Star, Car, Users, Zap, Globe, Heart, TrendingUp, DollarSign, CheckCircle, AlertTriangle, ArrowRight } from 'lucide-react'
import { LayoutWrapper } from '@/components/layout/layout-wrapper'

export default function Home() {
  return (
    <LayoutWrapper>
      <div className="min-h-screen">
      {/* Hero Section Persuasivo */}
      <section className="relative bg-gradient-to-br from-blue-600 via-blue-700 to-blue-800 text-white overflow-hidden">
        {/* Elementos decorativos de fundo */}
        <div className="absolute inset-0">
          <div className="absolute top-20 left-10 w-72 h-72 bg-yellow-400/10 rounded-full blur-3xl floating-animation"></div>
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-green-400/10 rounded-full blur-3xl floating-animation" style={{animationDelay: '2s'}}></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-orange-400/10 rounded-full blur-3xl floating-animation" style={{animationDelay: '4s'}}></div>
        </div>
        
        <div className="relative container mx-auto px-4 py-20">
          <div className="text-center space-y-8">
            <div className="space-y-6">
              <Badge variant="secondary" className="px-6 py-3 text-base font-medium bg-yellow-400 text-blue-900">
                🏝️ Ilha da Magia • Florianópolis
              </Badge>
              <h1 className="text-4xl md:text-6xl font-bold leading-tight">
                <span className="text-yellow-400">Transforme sua vaga ociosa</span>
                <br />
                <span className="text-white">em renda extra</span>
              </h1>
              <p className="text-xl md:text-2xl text-blue-100 max-w-4xl mx-auto leading-relaxed">
                Conectamos proprietários de vagas com motoristas que precisam estacionar em Florianópolis
              </p>
            </div>
            
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 max-w-2xl mx-auto">
              <p className="text-lg font-semibold text-yellow-300 mb-2">
                💰 Mais de 400 mil carros circulam pela Grande Florianópolis todos os dias
              </p>
              <p className="text-xl font-bold text-white">
                Sua vaga parada pode gerar até <span className="text-yellow-400">R$ 800/mês</span> enquanto você não usa
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-6 justify-center pt-4">
              <Button size="lg" className="h-16 px-10 text-lg font-bold bg-green-500 hover:bg-green-600 text-white shadow-2xl" asChild>
                <Link href="/user/spaces/create">
                  <DollarSign className="mr-3 h-6 w-6" />
                  Cadastrar Minha Vaga Grátis
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="h-16 px-10 text-lg font-bold border-2 border-white text-blue-600 bg-white hover:bg-blue-50 hover:text-blue-700 transition-all duration-300 cursor-pointer" asChild>
                <Link href="/search">
                  <MapPin className="mr-3 h-6 w-6" />
                  Encontrar Vaga Agora
                </Link>
              </Button>
            </div>
            
            {/* Estatísticas de Impacto */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8 pt-16">
              <div className="text-center space-y-2">
                <div className="text-4xl font-bold text-yellow-400">2.000+</div>
                <div className="text-blue-100">Vagas Cadastradas</div>
              </div>
              <div className="text-center space-y-2">
                <div className="text-4xl font-bold text-green-400">10.000+</div>
                <div className="text-blue-100">Reservas Realizadas</div>
              </div>
              <div className="text-center space-y-2">
                <div className="text-4xl font-bold text-orange-400">R$ 500k+</div>
                <div className="text-blue-100">Gerados para Proprietários</div>
              </div>
              <div className="text-center space-y-2">
                <div className="text-4xl font-bold text-white">4.8⭐</div>
                <div className="text-blue-100">Avaliação Média</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Seção Para Proprietários - Problema + Agitação */}
      <section className="py-20 bg-gradient-to-br from-red-50 to-orange-50">
        <div className="container mx-auto px-4">
          <div className="text-center space-y-6 mb-16">
            <Badge variant="outline" className="px-6 py-3 text-base font-medium bg-yellow-100 text-orange-800 border-orange-300">
              💰 Sua Vaga Vale Ouro em Floripa
            </Badge>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900">
              Transforme aquele espaço que fica vazio em uma <span className="text-orange-600">máquina de fazer dinheiro</span>
            </h2>
          </div>

          {/* Problemas */}
          <div className="max-w-4xl mx-auto mb-16">
            <div className="bg-white rounded-2xl p-8 shadow-xl border-l-4 border-red-500">
              <h3 className="text-2xl font-bold text-red-600 mb-6 flex items-center">
                <AlertTriangle className="mr-3 h-8 w-8" />
                PARE de deixar dinheiro parado na sua garagem!
              </h3>
              
              <div className="grid md:grid-cols-3 gap-6 mb-8">
                <div className="text-center p-4 bg-red-50 rounded-xl">
                  <div className="text-4xl mb-2">🤔</div>
                  <p className="font-semibold text-gray-800">Sua vaga fica vazia enquanto você está no trabalho?</p>
                </div>
                <div className="text-center p-4 bg-red-50 rounded-xl">
                  <div className="text-4xl mb-2">🤔</div>
                  <p className="font-semibold text-gray-800">Tem espaço sobrando na garagem no final de semana?</p>
                </div>
                <div className="text-center p-4 bg-red-50 rounded-xl">
                  <div className="text-4xl mb-2">🤔</div>
                  <p className="font-semibold text-gray-800">Vizinhos pedem para usar e você não sabe como cobrar?</p>
                </div>
              </div>

              <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white p-6 rounded-xl">
                <h4 className="text-xl font-bold mb-4">Em Florianópolis, uma vaga bem localizada pode gerar:</h4>
                <div className="grid md:grid-cols-3 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold">R$ 20-50</div>
                    <div className="text-sm">por dia em eventos</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold">R$ 200-400</div>
                    <div className="text-sm">por mês na alta temporada</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold">R$ 100-250</div>
                    <div className="text-sm">por mês o ano todo</div>
                  </div>
                </div>
                <p className="text-center mt-4 text-lg font-semibold">
                  Isso é dinheiro REAL saindo do seu bolso todos os meses!
                </p>
              </div>
            </div>
          </div>

          {/* Solução + Benefícios */}
          <div className="max-w-6xl mx-auto">
            <h3 className="text-3xl font-bold text-center mb-12 text-gray-900">
              ✅ A Solução que Você Estava Procurando
            </h3>
            
            <div className="grid md:grid-cols-2 gap-8">
              <Card className="gradient-card border-0 p-8">
                <CardHeader className="pb-6">
                  <div className="flex items-center mb-4">
                    <div className="w-12 h-12 bg-green-500 rounded-xl flex items-center justify-center mr-4">
                      <DollarSign className="h-6 w-6 text-white" />
                    </div>
                    <CardTitle className="text-xl font-bold text-green-600">RENDA EXTRA AUTOMÁTICA</CardTitle>
                  </div>
                  <CardDescription className="text-base leading-relaxed">
                    Ganhe de R$ 200 a R$ 800 por mês sem fazer nada. Você define preço, horário e disponibilidade.
                  </CardDescription>
                </CardHeader>
              </Card>

              <Card className="gradient-card border-0 p-8">
                <CardHeader className="pb-6">
                  <div className="flex items-center mb-4">
                    <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center mr-4">
                      <Shield className="h-6 w-6 text-white" />
                    </div>
                    <CardTitle className="text-xl font-bold text-blue-600">SEGURANÇA TOTAL</CardTitle>
                  </div>
                  <CardDescription className="text-base leading-relaxed">
                    Seguro incluído para todos os carros. Sistema de avaliações e verificação de usuários. Suporte 24h.
                  </CardDescription>
                </CardHeader>
              </Card>

              <Card className="gradient-card border-0 p-8">
                <CardHeader className="pb-6">
                  <div className="flex items-center mb-4">
                    <div className="w-12 h-12 bg-purple-500 rounded-xl flex items-center justify-center mr-4">
                      <Zap className="h-6 w-6 text-white" />
                    </div>
                    <CardTitle className="text-xl font-bold text-purple-600">CONTROLE TOTAL</CardTitle>
                  </div>
                  <CardDescription className="text-base leading-relaxed">
                    Você decide quando, para quem e por quanto alugar. Cancele reservas com 1 clique se precisar usar.
                  </CardDescription>
                </CardHeader>
              </Card>

              <Card className="gradient-card border-0 p-8">
                <CardHeader className="pb-6">
                  <div className="flex items-center mb-4">
                    <div className="w-12 h-12 bg-orange-500 rounded-xl flex items-center justify-center mr-4">
                      <CheckCircle className="h-6 w-6 text-white" />
                    </div>
                    <CardTitle className="text-xl font-bold text-orange-600">ZERO TRABALHO</CardTitle>
                  </div>
                  <CardDescription className="text-base leading-relaxed">
                    App cuida de tudo: pagamento, comunicação, suporte. Você só precisa disponibilizar a vaga. 75% de toda reserva vai direto para você.
                  </CardDescription>
                </CardHeader>
              </Card>
            </div>
          </div>

          {/* CTA para Proprietários */}
          <div className="text-center mt-16">
            <Button size="lg" className="h-16 px-12 text-xl font-bold bg-green-500 hover:bg-green-600 text-white shadow-2xl" asChild>
              <Link href="/register">
                <DollarSign className="mr-3 h-6 w-6" />
                Quero Ganhar Dinheiro com Minha Vaga
              </Link>
            </Button>
            <p className="text-sm text-gray-600 mt-4">
              Cadastro grátis • Primeiros R$ 100 são seus • Comece hoje mesmo
            </p>
          </div>
        </div>
      </section>

      {/* Seção Para Usuários - Problema + Agitação */}
      <section className="py-20 bg-gradient-to-br from-blue-50 to-indigo-50">
        <div className="container mx-auto px-4">
          <div className="text-center space-y-6 mb-16">
            <Badge variant="outline" className="px-6 py-3 text-base font-medium bg-blue-100 text-blue-800 border-blue-300">
              🎯 Acabou o Pesadelo de Estacionar em Floripa
            </Badge>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900">
              Encontre vaga garantida em segundos, pelo celular, <span className="text-blue-600">onde você quiser</span>
            </h2>
          </div>

          {/* Problemas dos Usuários */}
          <div className="max-w-4xl mx-auto mb-16">
            <div className="bg-white rounded-2xl p-8 shadow-xl border-l-4 border-red-500">
              <h3 className="text-2xl font-bold text-red-600 mb-6 flex items-center">
                <AlertTriangle className="mr-3 h-8 w-8" />
                CHEGA de estresse, tempo perdido e dinheiro jogado fora!
              </h3>
              
              <div className="grid md:grid-cols-2 gap-6 mb-8">
                <div className="text-center p-4 bg-red-50 rounded-xl">
                  <div className="text-4xl mb-2">😤</div>
                  <p className="font-semibold text-gray-800">Cansado de rodar 30 minutos procurando vaga?</p>
                </div>
                <div className="text-center p-4 bg-red-50 rounded-xl">
                  <div className="text-4xl mb-2">😤</div>
                  <p className="font-semibold text-gray-800">Pagou R$ 195 de multa por estacionar no lugar errado?</p>
                </div>
                <div className="text-center p-4 bg-red-50 rounded-xl">
                  <div className="text-4xl mb-2">😤</div>
                  <p className="font-semibold text-gray-800">Perdeu compromisso porque não achou onde parar?</p>
                </div>
                <div className="text-center p-4 bg-red-50 rounded-xl">
                  <div className="text-4xl mb-2">😤</div>
                  <p className="font-semibold text-gray-800">Estacionamento cheio bem na hora que você mais precisa?</p>
                </div>
              </div>

              <div className="bg-gradient-to-r from-red-500 to-orange-500 text-white p-6 rounded-xl">
                <h4 className="text-xl font-bold mb-4">Só em Florianópolis:</h4>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <div className="flex items-center">
                      <div className="w-2 h-2 bg-yellow-400 rounded-full mr-3"></div>
                      <span>Mais de 400 mil carros disputam poucas vagas todos os dias</span>
                    </div>
                    <div className="flex items-center">
                      <div className="w-2 h-2 bg-yellow-400 rounded-full mr-3"></div>
                      <span>Centro tem apenas 2.400 vagas para toda a demanda</span>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center">
                      <div className="w-2 h-2 bg-yellow-400 rounded-full mr-3"></div>
                      <span>Multa por estacionar errado custa R$ 195,23</span>
                    </div>
                    <div className="flex items-center">
                      <div className="w-2 h-2 bg-yellow-400 rounded-full mr-3"></div>
                      <span>Tempo médio procurando vaga: 20-30 minutos</span>
                    </div>
                  </div>
                </div>
                <p className="text-center mt-4 text-lg font-semibold">
                  Isso é dinheiro, tempo e paz de espírito saindo da sua vida!
                </p>
              </div>
            </div>
          </div>

          {/* Solução para Usuários */}
          <div className="max-w-6xl mx-auto">
            <h3 className="text-3xl font-bold text-center mb-12 text-gray-900">
              ✅ A Solução Definitiva para Seus Problemas
            </h3>
            
            <div className="grid md:grid-cols-2 gap-8">
              <Card className="gradient-card border-0 p-8">
                <CardHeader className="pb-6">
                  <div className="flex items-center mb-4">
                    <div className="w-12 h-12 bg-green-500 rounded-xl flex items-center justify-center mr-4">
                      <Zap className="h-6 w-6 text-white" />
                    </div>
                    <CardTitle className="text-xl font-bold text-green-600">VAGA GARANTIDA EM SEGUNDOS</CardTitle>
                  </div>
                  <CardDescription className="text-base leading-relaxed">
                    Veja vagas disponíveis em tempo real no mapa. Reserve antecipadamente pelo celular. Chegue e estacione direto, sem procurar.
                  </CardDescription>
                </CardHeader>
              </Card>

              <Card className="gradient-card border-0 p-8">
                <CardHeader className="pb-6">
                  <div className="flex items-center mb-4">
                    <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center mr-4">
                      <DollarSign className="h-6 w-6 text-white" />
                    </div>
                    <CardTitle className="text-xl font-bold text-blue-600">PREÇOS JUSTOS</CardTitle>
                  </div>
                  <CardDescription className="text-base leading-relaxed">
                    Pague só pelo tempo que usar. Sem taxa de entrada ou mensalidade. Muitas vezes mais barato que estacionamento tradicional.
                  </CardDescription>
                </CardHeader>
              </Card>

              <Card className="gradient-card border-0 p-8">
                <CardHeader className="pb-6">
                  <div className="flex items-center mb-4">
                    <div className="w-12 h-12 bg-purple-500 rounded-xl flex items-center justify-center mr-4">
                      <MapPin className="h-6 w-6 text-white" />
                    </div>
                    <CardTitle className="text-xl font-bold text-purple-600">LOCALIZAÇÕES ÚNICAS</CardTitle>
                  </div>
                  <CardDescription className="text-base leading-relaxed">
                    Vagas em casas e prédios onde você nunca imaginou. Pertinho de onde você realmente quer ir. Opções em toda Grande Florianópolis.
                  </CardDescription>
                </CardHeader>
              </Card>

              <Card className="gradient-card border-0 p-8">
                <CardHeader className="pb-6">
                  <div className="flex items-center mb-4">
                    <div className="w-12 h-12 bg-orange-500 rounded-xl flex items-center justify-center mr-4">
                      <Shield className="h-6 w-6 text-white" />
                    </div>
                    <CardTitle className="text-xl font-bold text-orange-600">SEGURANÇA E TRANQUILIDADE</CardTitle>
                  </div>
                  <CardDescription className="text-base leading-relaxed">
                    Todas as vagas são verificadas e avaliadas. Proprietários identificados e confiáveis. Suporte 24h se precisar de ajuda. Seguro incluso para sua total proteção.
                  </CardDescription>
                </CardHeader>
              </Card>
            </div>
          </div>

          {/* Casos de Uso Específicos */}
          <div className="max-w-6xl mx-auto mt-16">
            <h3 className="text-2xl font-bold text-center mb-8 text-gray-900">
              🎯 Casos de Uso Específicos para Florianópolis
            </h3>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="gradient-card border-0 p-6 text-center">
                <CardHeader className="pb-4">
                  <div className="text-4xl mb-3">🏖️</div>
                  <CardTitle className="text-lg font-bold text-blue-600">PRAIAS E TURISMO</CardTitle>
                </CardHeader>
                <CardDescription className="text-sm">
                  &ldquo;Vaga a 2 quadras da Joaquina por R$ 15/dia&rdquo;<br/>
                  &ldquo;Estacione na Lagoa sem estresse no verão&rdquo;
                </CardDescription>
              </Card>

              <Card className="gradient-card border-0 p-6 text-center">
                <CardHeader className="pb-4">
                  <div className="text-4xl mb-3">🎪</div>
                  <CardTitle className="text-lg font-bold text-purple-600">EVENTOS E SHOWS</CardTitle>
                </CardHeader>
                <CardDescription className="text-sm">
                  &ldquo;Vaga garantida para show no P12&rdquo;<br/>
                  &ldquo;Estacione perto do Centrosul para eventos&rdquo;
                </CardDescription>
              </Card>

              <Card className="gradient-card border-0 p-6 text-center">
                <CardHeader className="pb-4">
                  <div className="text-4xl mb-3">🏢</div>
                  <CardTitle className="text-lg font-bold text-green-600">TRABALHO E CENTRO</CardTitle>
                </CardHeader>
                <CardDescription className="text-sm">
                  &ldquo;Vaga mensal no Centro por R$ 200&rdquo;<br/>
                  &ldquo;Estacione perto do trabalho sem pressa&rdquo;
                </CardDescription>
              </Card>

              <Card className="gradient-card border-0 p-6 text-center">
                <CardHeader className="pb-4">
                  <div className="text-4xl mb-3">✈️</div>
                  <CardTitle className="text-lg font-bold text-orange-600">AEROPORTO E VIAGENS</CardTitle>
                </CardHeader>
                <CardDescription className="text-sm">
                  &ldquo;Deixe seu carro seguro enquanto viaja&rdquo;<br/>
                  &ldquo;Vaga no aeroporto por R$ 25/dia&rdquo;
                </CardDescription>
              </Card>
            </div>
          </div>

          {/* Urgência */}
          <div className="text-center mt-16">
            <div className="bg-gradient-to-r from-red-500 to-orange-500 text-white p-8 rounded-2xl max-w-2xl mx-auto">
              <h3 className="text-2xl font-bold mb-4">⚡ OFERTA DE LANÇAMENTO</h3>
              <p className="text-lg mb-6">Primeiras 1.000 reservas com 50% de desconto</p>
              <p className="text-sm opacity-90">Cadastre-se hoje e garante preço especial para sempre</p>
            </div>
          </div>

          {/* CTA para Usuários */}
          <div className="text-center mt-12">
            <Button size="lg" className="h-16 px-12 text-xl font-bold bg-blue-500 hover:bg-blue-600 text-white shadow-2xl" asChild>
              <Link href="/search">
                <MapPin className="mr-3 h-6 w-6" />
                Encontrar Vaga Agora
              </Link>
            </Button>
            <p className="text-sm text-gray-600 mt-4">
              Grátis para baixar • Vaga em menos de 1 minuto • Disponível 24h
            </p>
          </div>
        </div>
      </section>

      {/* Seção de Prova Social - Depoimentos */}
      <section className="py-20 bg-gradient-to-br from-green-50 to-blue-50">
        <div className="container mx-auto px-4">
          <div className="text-center space-y-6 mb-16">
            <Badge variant="outline" className="px-6 py-3 text-base font-medium bg-yellow-100 text-green-800 border-green-300">
              🌟 O que nossos usuários dizem
            </Badge>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900">
              <span className="text-green-600">Prova Social</span> que fala por si só
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Mais de 5.000 florianopolitanos já aderiram à nova forma de estacionar
            </p>
          </div>

          {/* Depoimentos */}
          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <Card className="gradient-card border-0 p-8 relative">
              <div className="absolute -top-4 -right-4 w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center">
                <Star className="h-4 w-4 text-white fill-white" />
              </div>
              <CardHeader className="pb-6">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center mr-4">
                    <span className="text-white font-bold text-lg">M</span>
                  </div>
                  <div>
                    <CardTitle className="text-lg font-bold">Maria Silva</CardTitle>
                    <CardDescription className="text-sm">Proprietária no Centro</CardDescription>
                  </div>
                </div>
                <div className="flex mb-3">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                  ))}
                </div>
                <CardDescription className="text-base leading-relaxed italic">
                  "Ganho R$ 400/mês com minha vaga na Lagoa. Pago a conta de luz só com isso! App super fácil de usar e sempre tem gente querendo estacionar."
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="gradient-card border-0 p-8 relative">
              <div className="absolute -top-4 -right-4 w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center">
                <Star className="h-4 w-4 text-white fill-white" />
              </div>
              <CardHeader className="pb-6">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center mr-4">
                    <span className="text-white font-bold text-lg">J</span>
                  </div>
                  <div>
                    <CardTitle className="text-lg font-bold">João Santos</CardTitle>
                    <CardDescription className="text-sm">Proprietário em Canasvieiras</CardDescription>
                  </div>
                </div>
                <div className="flex mb-3">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                  ))}
                </div>
                <CardDescription className="text-base leading-relaxed italic">
                  "No Réveillon fiz R$ 600 em 3 dias. Melhor investimento que já fiz. Agora minha vaga trabalha para mim o ano todo!"
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="gradient-card border-0 p-8 relative">
              <div className="absolute -top-4 -right-4 w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center">
                <Star className="h-4 w-4 text-white fill-white" />
              </div>
              <CardHeader className="pb-6">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-purple-500 rounded-full flex items-center justify-center mr-4">
                    <span className="text-white font-bold text-lg">A</span>
                  </div>
                  <div>
                    <CardTitle className="text-lg font-bold">Ana Costa</CardTitle>
                    <CardDescription className="text-sm">Proprietária na Trindade</CardDescription>
                  </div>
                </div>
                <div className="flex mb-3">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                  ))}
                </div>
                <CardDescription className="text-base leading-relaxed italic">
                  "App super fácil de usar. Cadastrei em 5 minutos e já recebi a primeira reserva. Segurança total e pagamento automático."
                </CardDescription>
              </CardHeader>
            </Card>
          </div>

          {/* Depoimentos de Usuários */}
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto mt-16">
            <Card className="gradient-card border-0 p-8">
              <CardHeader className="pb-6">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-orange-500 rounded-full flex items-center justify-center mr-4">
                    <span className="text-white font-bold text-lg">C</span>
                  </div>
                  <div>
                    <CardTitle className="text-lg font-bold">Carlos Mendes</CardTitle>
                    <CardDescription className="text-sm">Usuário - Centro</CardDescription>
                  </div>
                </div>
                <div className="flex mb-3">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                  ))}
                </div>
                <CardDescription className="text-base leading-relaxed italic">
                  "Acabou meu sofrimento de procurar vaga no Centro! Agora reservo pelo app e chego direto. Economizo 30 minutos por dia."
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="gradient-card border-0 p-8">
              <CardHeader className="pb-6">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-pink-500 rounded-full flex items-center justify-center mr-4">
                    <span className="text-white font-bold text-lg">L</span>
                  </div>
                  <div>
                    <CardTitle className="text-lg font-bold">Luciana Ferreira</CardTitle>
                    <CardDescription className="text-sm">Usuária - Praias</CardDescription>
                  </div>
                </div>
                <div className="flex mb-3">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                  ))}
                </div>
                <CardDescription className="text-base leading-relaxed italic">
                  "Perfeito para ir à praia! Vaga a 2 quadras da Joaquina por R$ 15. Muito mais barato que estacionamento tradicional."
                </CardDescription>
              </CardHeader>
            </Card>
          </div>

          {/* Números de Impacto */}
          <div className="mt-20">
            <h3 className="text-3xl font-bold text-center mb-12 text-gray-900">
              📊 Números que Impressionam
            </h3>
            
            <div className="grid grid-cols-2 md:grid-cols-5 gap-8 max-w-4xl mx-auto">
              <div className="text-center">
                <div className="text-4xl font-bold text-green-600 mb-2">2.000+</div>
                <div className="text-sm text-gray-600">Vagas Cadastradas</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-blue-600 mb-2">10.000+</div>
                <div className="text-sm text-gray-600">Reservas Realizadas</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-orange-600 mb-2">R$ 500k+</div>
                <div className="text-sm text-gray-600">Gerados para Proprietários</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-purple-600 mb-2">4.8⭐</div>
                <div className="text-sm text-gray-600">Avaliação Média</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-red-600 mb-2">95%</div>
                <div className="text-sm text-gray-600">Recomendam</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Seção Final de Conversão */}
      <section className="py-20 bg-gradient-to-br from-blue-600 via-blue-700 to-blue-800 text-white">
        <div className="container mx-auto px-4">
          <div className="text-center space-y-8 max-w-4xl mx-auto">
            <div className="space-y-6">
              <Badge variant="secondary" className="px-6 py-3 text-base font-medium bg-yellow-400 text-blue-900">
                🏝️ Faça Parte da Revolução do Estacionamento em Floripa
              </Badge>
              <h2 className="text-4xl md:text-5xl font-bold">
                Mais de <span className="text-yellow-400">5.000 florianopolitanos</span> já aderiram à nova forma de estacionar
              </h2>
              <p className="text-xl text-blue-100 leading-relaxed">
                Junte-se à comunidade que está transformando o estacionamento em Florianópolis
              </p>
            </div>

            {/* CTAs Finais */}
            <div className="grid md:grid-cols-2 gap-8 mt-12">
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8">
                <h3 className="text-2xl font-bold mb-4 text-yellow-400">💰 Para Proprietários</h3>
                <p className="text-blue-100 mb-6">
                  Transforme sua vaga ociosa em renda extra. Comece a ganhar hoje mesmo!
                </p>
                <Button size="lg" className="w-full h-14 text-lg font-bold bg-green-500 hover:bg-green-600 text-white" asChild>
                  <Link href="/user/spaces/create">
                    <DollarSign className="mr-3 h-6 w-6" />
                    Cadastrar Vaga Grátis
                  </Link>
                </Button>
                <p className="text-sm text-blue-200 mt-3">
                  Comece a ganhar hoje mesmo
                </p>
              </div>

              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8">
                <h3 className="text-2xl font-bold mb-4 text-yellow-400">🚗 Para Usuários</h3>
                <p className="text-blue-100 mb-6">
                  Acabe com o estresse de procurar vaga. Encontre sua vaga em 1 minuto!
                </p>
                <Button size="lg" className="w-full h-14 text-lg font-bold bg-blue-500 hover:bg-blue-600 text-white" asChild>
                  <Link href="/search">
                    <MapPin className="mr-3 h-6 w-6" />
                    Baixar App Grátis
                  </Link>
                </Button>
                <p className="text-sm text-blue-200 mt-3">
                  Encontre sua vaga em 1 minuto
                </p>
              </div>
            </div>

            {/* Garantia */}
            <div className="mt-16">
              <div className="bg-gradient-to-r from-green-500 to-blue-500 text-white p-8 rounded-2xl max-w-2xl mx-auto">
                <h3 className="text-2xl font-bold mb-4 flex items-center justify-center">
                  <Shield className="mr-3 h-8 w-8" />
                  🎯 GARANTIA TOTAL
                </h3>
                <p className="text-lg leading-relaxed">
                  Se não ficar satisfeito nos primeiros 30 dias, 
                  <br />
                  <span className="font-bold">devolvemos seu dinheiro sem perguntas.</span>
                </p>
              </div>
            </div>

            {/* Urgência Final */}
            <div className="mt-12">
              <div className="bg-red-500 text-white p-6 rounded-xl max-w-xl mx-auto">
                <h4 className="text-xl font-bold mb-2">⚡ ÚLTIMAS VAGAS DISPONÍVEIS</h4>
                <p className="text-sm">
                  Oferta de lançamento válida apenas para as primeiras 1.000 vagas cadastradas
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer Moderno */}
      <footer className="bg-gradient-to-br from-gray-900 to-gray-800 text-white py-16">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-12">
            <div className="space-y-6">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-blue-500 rounded-xl flex items-center justify-center">
                  <MapPin className="h-6 w-6 text-white" />
                </div>
                <span className="text-2xl font-bold text-white">VagaSC</span>
              </div>
              <p className="text-gray-300 text-base leading-relaxed">
                Marketplace de estacionamento privado em Florianópolis. 
                Conectamos proprietários e motoristas de forma segura e prática.
              </p>
              <div className="flex space-x-4">
                <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center hover:bg-blue-500/30 transition-colors">
                  <Heart className="h-5 w-5 text-blue-400" />
                </div>
                <div className="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center hover:bg-green-500/30 transition-colors">
                  <TrendingUp className="h-5 w-5 text-green-400" />
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <h3 className="text-lg font-bold text-white">Para Motoristas</h3>
              <ul className="space-y-3 text-gray-300">
                <li><Link href="/search" className="hover:text-blue-400 transition-colors flex items-center space-x-2">
                  <MapPin className="h-4 w-4" />
                  <span>Buscar Vagas</span>
                </Link></li>
                <li><Link href="/how-it-works" className="hover:text-blue-400 transition-colors flex items-center space-x-2">
                  <Clock className="h-4 w-4" />
                  <span>Como Funciona</span>
                </Link></li>
                <li><Link href="/pricing" className="hover:text-blue-400 transition-colors flex items-center space-x-2">
                  <Star className="h-4 w-4" />
                  <span>Preços</span>
                </Link></li>
              </ul>
            </div>

            <div className="space-y-6">
              <h3 className="text-lg font-bold text-white">Para Proprietários</h3>
              <ul className="space-y-3 text-gray-300">
                <li><Link href="/user/spaces/create" className="hover:text-green-400 transition-colors flex items-center space-x-2">
                  <Users className="h-4 w-4" />
                  <span>Cadastrar Vaga</span>
                </Link></li>
                <li><Link href="/earnings" className="hover:text-green-400 transition-colors flex items-center space-x-2">
                  <TrendingUp className="h-4 w-4" />
                  <span>Ganhos</span>
                </Link></li>
                <li><Link href="/support" className="hover:text-green-400 transition-colors flex items-center space-x-2">
                  <Shield className="h-4 w-4" />
                  <span>Suporte</span>
                </Link></li>
              </ul>
            </div>

            <div className="space-y-6">
              <h3 className="text-lg font-bold text-white">Suporte</h3>
              <ul className="space-y-3 text-gray-300">
                <li><Link href="/help" className="hover:text-blue-400 transition-colors flex items-center space-x-2">
                  <Globe className="h-4 w-4" />
                  <span>Central de Ajuda</span>
                </Link></li>
                <li><Link href="/contact" className="hover:text-blue-400 transition-colors flex items-center space-x-2">
                  <Heart className="h-4 w-4" />
                  <span>Contato</span>
                </Link></li>
                <li><Link href="/terms" className="hover:text-blue-400 transition-colors flex items-center space-x-2">
                  <Shield className="h-4 w-4" />
                  <span>Termos de Uso</span>
                </Link></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-700 mt-12 pt-8">
            <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
              <p className="text-gray-400 text-sm">
                &copy; 2024 VagaSC. Todos os direitos reservados.
              </p>
              <div className="flex items-center space-x-6 text-sm text-gray-400">
                <span>Feito com ❤️ em Florianópolis</span>
              </div>
            </div>
          </div>
        </div>
      </footer>
      </div>
    </LayoutWrapper>
  )
}
