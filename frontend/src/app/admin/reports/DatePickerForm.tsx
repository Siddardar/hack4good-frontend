"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { format } from "date-fns"
import { useRouter } from "next/navigation"
import { CalendarIcon } from "lucide-react"
import { useForm } from "react-hook-form"
import { z } from "zod"

import { cn } from "@/lib/utils"
import { toast } from "@/components/hooks/use-toast"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

const FormSchema = z.object({
  dateRange: z.object({
    from: z.date({
      required_error: "Start date is required.",
    }),
    to: z.date({
      required_error: "End date is required.",
    }),
  }),
})

export function DatePickerForm() {
  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
  })

  const router = useRouter()  

  function onSubmit(data: z.infer<typeof FormSchema>) {
    const { from, to } = data.dateRange;

    const payload = {
      from: from.toISOString(),
      to: to.toISOString(),
      accessed_at: new Date().toISOString(),
    };

    fetch("http://localhost:8080/date-ranges/check", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Failed to check if date range exists");
        }
        return response.json();
      })
      .then((result) => {
        if (result.exists) {
          return fetch(`http://localhost:8080/date-ranges/${result.id}`, {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              accessed_at: new Date().toISOString(),
            }),
          });
        } else {
          return fetch("http://localhost:8080/date-ranges", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(payload),
          });
        }
      })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Failed to update or add date range");
        }
        return response.json();
      })
      .then(() => {
        router.push(`/admin/reports/report?from=${from.toISOString()}&to=${to.toISOString()}`);
      })
      .catch((error) => {
        console.error(error.message);
      });
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="dateRange"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>Generate a new report</FormLabel>
              <Popover>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      variant={"outline"}
                      className={cn(
                        "w-[300px] justify-start text-left font-normal",
                        !field.value?.from && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon />
                      {field.value?.from ? (
                        field.value.to ? (
                          <>
                            {format(field.value.from, "LLL dd, y")} -{" "}
                            {format(field.value.to, "LLL dd, y")}
                          </>
                        ) : (
                          format(field.value.from, "LLL dd, y")
                        )
                      ) : (
                        <span>Pick a date range</span>
                      )}
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    initialFocus
                    mode="range"
                    defaultMonth={field.value?.from}
                    selected={field.value}
                    onSelect={field.onChange}
                    numberOfMonths={2}
                  />
                </PopoverContent>
              </Popover>
              <FormDescription>
                Your selected date range will be used for the report.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit">Generate</Button>
      </form>
    </Form>
  )
}