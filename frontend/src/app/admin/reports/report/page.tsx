"use client"


import { useSearchParams } from "next/navigation"

export default function Page() {
  const searchParams = useSearchParams()

  const from = searchParams.get("from")
  const to = searchParams.get("to")

  return (
    <div>
      <h1>Report</h1>
      <p>
        <strong>From:</strong> {from && new Date(from).toLocaleDateString()}
      </p>
      <p>
        <strong>To:</strong> {to && new Date(to).toLocaleDateString()}
      </p>
    </div>
  )
}