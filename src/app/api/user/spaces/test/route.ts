import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 Testando API de vagas do usuário...')
    
    const session = await auth()
    console.log('👤 Sessão:', session ? 'Logado' : 'Não logado')
    
    if (!session?.user?.id) {
      console.log('❌ Usuário não autorizado')
      return NextResponse.json(
        { message: 'Não autorizado' },
        { status: 401 }
      )
    }

    console.log('✅ Usuário autorizado:', session.user.id)

    // Verificar se o Prisma está funcionando
    try {
      const { prisma } = await import('@/lib/db')
      console.log('✅ Prisma importado com sucesso')
      
      // Teste simples - contar usuários
      const userCount = await prisma.user.count()
      console.log('✅ Conexão com banco OK. Total de usuários:', userCount)
      
      return NextResponse.json({
        status: 'success',
        message: 'API funcionando corretamente',
        details: {
          userId: session.user.id,
          userEmail: session.user.email,
          userCount,
          databaseConnected: true
        }
      })
      
    } catch (dbError) {
      console.error('❌ Erro no banco de dados:', dbError)
      return NextResponse.json({
        status: 'error',
        message: 'Erro na conexão com banco de dados',
        error: dbError instanceof Error ? dbError.message : 'Erro desconhecido'
      }, { status: 500 })
    }

  } catch (error) {
    console.error('❌ Erro geral na API:', error)
    return NextResponse.json({
      status: 'error',
      message: 'Erro interno do servidor',
      error: error instanceof Error ? error.message : 'Erro desconhecido'
    }, { status: 500 })
  }
}
