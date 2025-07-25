"use client"

import * as React from "react"
import * as Popover from "@radix-ui/react-popover"
import { cn } from "@/lib/utils"

interface ColorPickerProps {
  value?: string
  onChange?: (value: string) => void
}

const colors = [
  "#000000",
  "#EF4444",
  "#F97316",
  "#F59E0B",
  "#84CC16",
  "#10B981",
  "#14B8A6",
  "#3B82F6",
  "#6366F1",
  "#8B5CF6",
  "#EC4899",
]

export function ColorPicker({ value, onChange }: ColorPickerProps) {
  return (
    <Popover.Root>
      <Popover.Trigger asChild>
        <button
          className="h-8 w-8 border border-input rounded-md overflow-hidden flex items-center justify-center"
          style={{ backgroundColor: value }}
        >
          <span
            className={cn(
              "h-4 w-4 rounded-sm",
              !value && "border border-input"
            )}
            style={{ backgroundColor: value }}
          />
        </button>
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Content
          align="start"
          className="p-2 w-48 bg-popover rounded-md border shadow-md"
        >
          <div className="grid grid-cols-5 gap-2">
            {colors.map((color) => (
              <button
                key={color}
                onClick={() => onChange?.(color)}
                className={cn(
                  "h-8 w-8 rounded-md border",
                  value === color && "ring-2 ring-ring"
                )}
                style={{ backgroundColor: color }}
              />
            ))}
          </div>
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  )
}
