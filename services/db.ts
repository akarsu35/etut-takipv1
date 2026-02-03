import { PrismaClient } from '@prisma/client'

const prismaClientSingleton = () => {
  const client = new PrismaClient()

  // Middleware: log create operations for debugging auth flow
  client.$use(async (params: any, next: any) => {
    try {
      if (
        params.action === 'create' &&
        (params.model === 'Account' || params.model === 'User')
      ) {
        const data = params.args?.data || {}
        const keys = Object.keys(data)
        // Mask password if present
        const hasPassword = !!data.password
        const pwLength = hasPassword ? String(data.password).length : 0
        console.debug(
          `[Prisma Debug] ${params.model}.create called. keys=${keys.join(', ')} passwordPresent=${hasPassword} passwordLength=${pwLength}`,
        )
      }
    } catch (e) {
      console.error('Prisma debug middleware error', e)
    }
    return next(params)
  })

  return client
}

declare global {
  var prisma: undefined | ReturnType<typeof prismaClientSingleton>
}

const prisma = globalThis.prisma ?? prismaClientSingleton()

export default prisma

if (process.env.NODE_ENV !== 'production') globalThis.prisma = prisma
