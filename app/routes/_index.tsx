import { Message } from "~/components/message"
import { repository } from "~/service/repository.server"
import { ActionFunctionArgs } from "@remix-run/node"
import { useFetcher, useLoaderData } from "@remix-run/react"
import { useEffect, useRef, useState, FormEvent } from "react"
import { Button } from "~/components/ui/button"
import { Input } from "~/components/ui/input"
import { SendHorizontal } from "lucide-react"
import { ScrollArea } from "~/components/ui/scroll-area"

export const loader = async () => {
	const messages = await repository.getMessages(10)
	return { messages }
}

export const action = async ({ request }: ActionFunctionArgs) => {
	const formData = await request.formData()
	const content = String(formData.get("content"))
	const user = String(formData.get("user"))
	if (content !== "" && user !== "") {
		await repository.createMessage(content, user)
		fetch("http://lime-app-v2.onrender.com/ws/updated")
	}
	return await loader()
}

export default function Index() {
	const { messages: loadedMessages } = useLoaderData<typeof loader>()
	const [messages, setMessages] = useState(loadedMessages)
	const [user, setUser] = useState("")
	const [content, setContent] = useState("")

	const contentRef = useRef<HTMLInputElement>(null)
	const userRef = useRef<HTMLInputElement>(null)

	const fetcher = useFetcher<typeof loader>()

	useEffect(() => {
		if (fetcher.data?.messages) {
			setMessages(fetcher.data.messages)
		}
	}, [fetcher.data])

	useEffect(() => {
		const ws = new WebSocket("wss://lime-app-v2.onrender.com")
		ws.onopen = () => {
			ws.onmessage = (e) => {
				if (e.data === "updated") {
					fetcher.load("")
				}
			}
		}
		return () => {
			ws.close()
		}
	}, [])

	const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
		e.preventDefault()
		const formData = new FormData(e.currentTarget)
		const content = String(formData.get("content"))
		const user = String(formData.get("user"))
		if (user === "") {
			userRef.current?.focus()
			userRef.current?.classList.add("border-red-400")
		} else if (content === "") {
			contentRef.current?.focus()
			contentRef.current?.classList.add("border-red-400")
		} else {
			fetcher.submit(e.currentTarget, { method: "post" })
			setContent("")
			contentRef.current?.focus()
		}
	}

	return (
		<div className="max-w-screen-sm mx-auto h-screen p-4">
			<fetcher.Form method="post" className="flex flex-col gap-4 h-full" onSubmit={handleSubmit}>
				<Input
					type="text"
					name="user"
					placeholder="ユーザー名"
					value={user}
					onChange={(e) => {
						setUser(e.target.value)
						if (userRef.current?.value) {
							userRef.current.classList.remove("border-red-400")
						}
					}}
					ref={userRef}
				/>
				<div className="grow border rounded-md flex flex-col justify-end">
					<ScrollArea>
						{[...messages].reverse().map((message) => (
							<Message key={message.id} message={message} />
						))}
					</ScrollArea>
				</div>

				<div className="flex flex-row gap-2">
					<Input
						type="text"
						name="content"
						placeholder="メッセージ"
						value={content}
						onChange={(e) => {
							setContent(e.target.value)
							if (contentRef.current?.value) {
								contentRef.current.classList.remove("border-red-400")
							}
						}}
						ref={contentRef}
					/>
					<Button type="submit">
						<SendHorizontal />
					</Button>
					<Button type="button" onClick={() => fetcher.load("")}>
						Reload
					</Button>
				</div>
			</fetcher.Form>
		</div>
	)
}
