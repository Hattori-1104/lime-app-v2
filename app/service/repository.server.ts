import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

class Repository {
	async getMessages(take = 10) {
		return await prisma.message.findMany({ orderBy: { createdAt: "desc" }, take })
	}
	async createMessage(content: string, user: string) {
		return await prisma.message.create({ data: { content, user } })
	}
}

export const repository = new Repository()
