export type ChatMessage = {
  role: 'customer' | 'agent'
  text: string
  time: string
}

type ChatMeta = {
  title: string
  customerName: string
  issueLine: string
  messages: ChatMessage[]
}

export const demoChats: Record<string, ChatMeta> = {
  limit_exceeded: {
    title: 'Chat with Alex Tan',
    customerName: 'Alex Tan',
    issueLine: 'Transfer failed at $5,000',
    messages: [
      { role: 'customer', text: "Hi, my transfer keeps failing at $5,000.", time: '10:02 AM' },
      { role: 'agent', text: "No worries, let me help you with your issue now.", time: '10:02 AM' },
    ],
  },
  no_payee: {
    title: 'Chat with Priya N.',
    customerName: 'Priya N.',
    issueLine: 'Payment > $1,000 with no payee',
    messages: [
      { role: 'customer', text: "My payment above $1,000 won’t go through.", time: '2:41 PM' },
      { role: 'agent', text: "No worries, let me help you with your issue now.", time: '2:41 PM' },
    ],
  },
  fraud: {
    title: 'Chat with Marcus Lee',
    customerName: 'Marcus Lee',
    issueLine: 'Transaction flagged for fraud',
    messages: [
      { role: 'customer', text: "My transaction was blocked with a fraud warning.", time: '5:18 PM' },
      { role: 'agent', text: "No worries, let me help you with your issue now.", time: '5:18 PM' },
    ],
  },
}
