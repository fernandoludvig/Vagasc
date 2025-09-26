import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 Debug da API de vagas...')
    
    // Verificar variáveis de ambiente
    const hasDatabaseUrl = !!process.env.DATABASE_URL
    const hasNextAuthSecret = !!process.env.NEXTAUTH_SECRET
    const hasNextAuthUrl = !!process.env.NEXTAUTH_URL
    
    console.log('📋 Variáveis de ambiente:')
    console.log('- DATABASE_URL:', hasDatabaseUrl ? '✅' : '❌')
    console.log('- NEXTAUTH_SECRET:', hasNextAuthSecret ? '✅' : '❌')
    console.log('- NEXTAUTH_URL:', hasNextAuthUrl ? '✅' : '❌')
    
    // Verificar se o Prisma pode ser importado
    let prismaStatus = '❌'
    let dbError = null
    
    try {
      const { prisma } = await import('@/lib/db')
      console.log('✅ Prisma importado com sucesso')
      
      // Teste de conexão
      await prisma.$connect()
      console.log('✅ Conexão com banco estabelecida')
      
      const userCount = await prisma.user.count()
      console.log('✅ Query executada com sucesso. Usuários:', userCount)
      
      prismaStatus = '✅'
      
    } catch (error) {
      console.error('❌ Erro no Prisma:', error)
      dbError = error instanceof Error ? error.message : 'Erro desconhecido'
      prismaStatus = '❌'
    }
    
    return NextResponse.json({
      status: 'debug',
      message: 'Informações de debug',
      details: {
        environment: {
          DATABASE_URL: hasDatabaseUrl,
          NEXTAUTH_SECRET: hasNextAuthSecret,
          NEXTAUTH_URL: hasNextAuthUrl,
        },
        database: {
          prismaImport: prismaStatus,
          error: dbError
        },
        timestamp: new Date().toISOString()
      }
    })
    
  } catch (error) {
    console.error('❌ Erro no debug:', error)
    return NextResponse.json({
      status: 'error',
      message: 'Erro no debug',
      error: error instanceof Error ? error.message : 'Erro desconhecido'
    }, { status: 500 })
  }
}
