import { Message as MessageType } from "@prisma/client"

export const Message = ({ message }: { message: MessageType }) => {
	const formateDate = (d: Date) => `${d.getMonth() + 1}/${String(d.getDate()).padStart(2, "0")}`
	return (
		<div className="flex flex-row justify-between border-t p-2">
			<div>
				<div className="text-sm text-gray-500 leading-3">{message.user}</div>
				<div className="text-base leading-6">{message.content}</div>
			</div>
			<div className="text-xs text-gray-500 leading-3 flex justify-center items-center">
				{formateDate(message.createdAt)}
			</div>
		</div>
	)
}
