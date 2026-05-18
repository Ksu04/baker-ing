import 'dotenv/config'
import prisma from '../lib/prisma'
import bcrypt from 'bcrypt'

const readline = require('readline')

function ask(query: string): Promise<string> {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  })
  return new Promise((resolve) =>
    rl.question(query, (ans: string) => {
      rl.close()
      resolve(ans)
    })
  )
}

async function main() {
  const name = await ask('Baker name: ')
  const email = await ask('Baker email: ')
  const password = await ask('Password: ')
  const hashedPassword = await bcrypt.hash(password, 10)

  const existing = await prisma.user.findUnique({ where: { email } })
  if (existing) {
    console.error('A user with that email already exists.')
    process.exit(1)
  }

  const user = await prisma.user.create({
    data: {
      name,
      email,
      password: hashedPassword,
      role: 'BAKER',
      bakerProfile: { create: {} },
    },
  })

  console.log('Registered new baker:', user)
  process.exit(0)
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
