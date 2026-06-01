export default function Textarea({ className = '', ...props }) {
  return (
    <textarea
      className={`w-full rounded-md border border-border bg-transparent px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-accent/40 ${className}`}
      {...props}
    />
  )
}

