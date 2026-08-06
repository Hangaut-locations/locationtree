import { LifeBuoy, Mail, MessageSquare, Phone } from "lucide-react"
import type React from "react"

export const SupportPage: React.FC = () => {
  return (
    <div className="mx-auto max-w-2xl px-4 md:px-8 py-8">
      <div className="flex items-center gap-3 mb-6">
        <div className="h-11 w-11 rounded-2xl bg-purple-950/10 text-purple-950 dark:text-purple-300 flex items-center justify-center">
          <LifeBuoy className="h-5 w-5" />
        </div>
        <h1 className="text-2xl font-black text-foreground tracking-tight">Contact support</h1>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { icon: MessageSquare, label: "Live chat", value: "Start a chat" },
          { icon: Phone, label: "Call us", value: "+1 (555) 010-0100" },
          { icon: Mail, label: "Email", value: "help@hangout.com" },
        ].map((c) => {
          const Icon = c.icon
          return (
            <button
              key={c.label}
              className="flex flex-col items-start gap-3 rounded-3xl border border-border bg-card p-6 text-left hover:border-purple-950/40 hover:shadow-md transition-all cursor-pointer"
            >
              <Icon className="h-6 w-6 text-purple-950 dark:text-purple-300" />
              <span className="text-sm font-black text-foreground">{c.label}</span>
              <span className="text-xs font-semibold text-muted-foreground">{c.value}</span>
            </button>
          )
        })}
      </div>

      <div className="mt-8 rounded-3xl border border-border bg-card p-6">
        <p className="text-center text-xs font-semibold text-muted-foreground">
          Our support team matches available agents. We usually respond within a few minutes.
        </p>
      </div>
    </div>
  )
}
