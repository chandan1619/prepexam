"use client";

import * as React from "react";
import { Editor } from "@tiptap/react";
import { Button } from "./button";
import { Delete, PlusCircle, Minus, Columns, Rows } from "lucide-react";

interface TableToolbarProps {
  editor: Editor;
}

export function TableToolbar({ editor }: TableToolbarProps) {
  if (!editor.isActive("table")) return null;

  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 bg-white rounded-lg shadow-lg border p-2 flex items-center gap-2">
      <Button
        size="sm"
        variant="ghost"
        onClick={() => editor.chain().focus().addColumnBefore().run()}
      >
        <Columns className="h-4 w-4 -rotate-180" />
      </Button>
      <Button
        size="sm"
        variant="ghost"
        onClick={() => editor.chain().focus().addColumnAfter().run()}
      >
        <Columns className="h-4 w-4" />
      </Button>
      <Button
        size="sm"
        variant="ghost"
        onClick={() => editor.chain().focus().deleteColumn().run()}
      >
        <Minus className="h-4 w-4 rotate-90" />
      </Button>
      <div className="w-px h-6 bg-gray-200" />
      <Button
        size="sm"
        variant="ghost"
        onClick={() => editor.chain().focus().addRowBefore().run()}
      >
        <Rows className="h-4 w-4 -rotate-180" />
      </Button>
      <Button
        size="sm"
        variant="ghost"
        onClick={() => editor.chain().focus().addRowAfter().run()}
      >
        <Rows className="h-4 w-4" />
      </Button>
      <Button
        size="sm"
        variant="ghost"
        onClick={() => editor.chain().focus().deleteRow().run()}
      >
        <Minus className="h-4 w-4" />
      </Button>
      <div className="w-px h-6 bg-gray-200" />
      <Button
        size="sm"
        variant="ghost"
        onClick={() => editor.chain().focus().toggleHeaderRow().run()}
      >
        <PlusCircle className="h-4 w-4" />
      </Button>
      <Button
        size="sm"
        variant="ghost"
        onClick={() => editor.chain().focus().deleteTable().run()}
      >
        <Delete className="h-4 w-4" />
      </Button>
    </div>
  );
}
