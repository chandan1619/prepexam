import React, { useEffect, useState } from "react";
import { EditorContent, useEditor } from "@tiptap/react";
import Placeholder from "@tiptap/extension-placeholder";
import Underline from "@tiptap/extension-underline";
import Link from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";
import TextAlign from "@tiptap/extension-text-align";
import Heading from "@tiptap/extension-heading";
import BulletList from "@tiptap/extension-bullet-list";
import OrderedList from "@tiptap/extension-ordered-list";
import ListItem from "@tiptap/extension-list-item";
import Document from "@tiptap/extension-document";
import Paragraph from "@tiptap/extension-paragraph";
import Text from "@tiptap/extension-text";
import History from "@tiptap/extension-history";
import BoldExtension from "@tiptap/extension-bold";
import ItalicExtension from "@tiptap/extension-italic";
import Strike from "@tiptap/extension-strike";
import CodeExtension from "@tiptap/extension-code";
import Blockquote from "@tiptap/extension-blockquote";
import CodeBlock from "@tiptap/extension-code-block";
import Highlight from "@tiptap/extension-highlight";
import { Color } from "@tiptap/extension-color";
import { TextStyle } from "@tiptap/extension-text-style";
import { Table } from "@tiptap/extension-table";
import TableRow from "@tiptap/extension-table-row";
import TableCell from "@tiptap/extension-table-cell";
import TableHeader from "@tiptap/extension-table-header";
import { Extension } from "@tiptap/core";
import { Button } from "@/components/ui/button";

import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  Strikethrough,
  Code,
  Terminal,
  Quote,
  Heading1,
  Heading2,
  List,
  ListOrdered,
  Image as ImageIcon,
  Link as LinkIcon,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Table as TableIcon,
  Highlighter,
  Eye,
  EyeOff,
} from "lucide-react";
import { ColorPicker } from "./ui/color-picker";
import { TableToolbar } from "./ui/table-toolbar";

interface RichTextEditorProps {
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
}

const TableExit = Extension.create({
  name: "tableExit",
  addKeyboardShortcuts() {
    return {
      "Mod-Enter": () => this.editor.commands.focus(),
      "Shift-Enter": () => this.editor.commands.focus(),
      "Alt-ArrowDown": () => this.editor.commands.focus(),
    };
  },
});

export default function RichTextEditor({
  value,
  onChange,
  placeholder = "Write something amazing...",
}: RichTextEditorProps) {
  const [mounted, setMounted] = useState(false);
  const [isLinkModalOpen, setIsLinkModalOpen] = useState(false);
  const [linkUrl, setLinkUrl] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [isPreview, setIsPreview] = useState(false);

  const editor = useEditor({
    extensions: [
      Document,
      Paragraph,
      Text,
      History,
      BoldExtension,
      ItalicExtension,
      Strike,
      CodeExtension,
      CodeBlock.configure({
        HTMLAttributes: {
          class: "bg-gray-200 rounded p-2 font-mono text-sm",
        },
      }),
      Blockquote,
      Heading.configure({
        levels: [1, 2],
        HTMLAttributes: {
          class: "font-bold",
          spellcheck: "false",
        },
      }),
      ListItem,
      BulletList.configure({
        itemTypeName: "listItem",
        HTMLAttributes: {
          class: "list-disc ml-4",
        },
      }),
      OrderedList.configure({
        itemTypeName: "listItem",
        HTMLAttributes: {
          class: "list-decimal ml-4",
        },
      }),
      Underline,
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: "text-blue-500 hover:text-blue-600 underline",
        },
      }),
      Image.configure({
        HTMLAttributes: {
          class: "max-w-full h-auto",
        },
      }),
      TextAlign.configure({
        types: ["heading", "paragraph"],
      }),
      Highlight.configure({ multicolor: true }),
      Color,
      TextStyle,
      Table.configure({
        resizable: true,
      }),
      TableRow,
      TableHeader,
      TableCell,
      TableExit,
      Placeholder.configure({ placeholder }),
    ],
    content: value,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class:
          "min-h-[200px] prose prose-slate max-w-none focus:outline-none px-4 py-3 bg-white rounded-b border border-gray-200 richtext-content shadow-sm transition-shadow hover:shadow-md",
      },
    },
    immediatelyRender: false,
  });

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (editor && value !== editor.getHTML()) {
      editor.commands.setContent(value || "");
    }
  }, [value, editor]);

  const handleLinkSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (linkUrl) {
      editor?.chain().focus().setLink({ href: linkUrl }).run();
    } else {
      editor?.chain().focus().unsetLink().run();
    }
    setIsLinkModalOpen(false);
    setLinkUrl("");
  };

  const handleImageSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (imageUrl) {
      editor?.chain().focus().setImage({ src: imageUrl }).run();
    }
    setIsImageModalOpen(false);
    setImageUrl("");
  };

  const renderToolbar = () => {
    if (!mounted || !editor) return null;

    const ToolbarButton = ({
      onClick,
      isActive = false,
      children,
    }: {
      onClick: () => void;
      isActive?: boolean;
      children: React.ReactNode;
    }) => (
      <Button
        size="icon"
        variant="ghost"
        onClick={onClick}
        className={isActive ? "bg-blue-100 text-blue-700" : ""}
      >
        {children}
      </Button>
    );

    const ToolbarGroup = ({ children }: { children: React.ReactNode }) => (
      <div className="flex items-center gap-1 bg-gray-50/50 rounded-md px-2 py-1 border shadow-sm">
        {children}
      </div>
    );

    return (
      <div className="bg-gradient-to-b from-white to-gray-50 border-t border-x rounded-t p-2 space-y-2 shadow-sm">
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center space-x-2">
            <Button
              size="sm"
              variant={isPreview ? "default" : "ghost"}
              onClick={() => setIsPreview(!isPreview)}
              className="flex items-center gap-2 hover:bg-blue-50"
            >
              {isPreview ? (
                <>
                  <EyeOff className="h-4 w-4" />
                  <span className="text-sm font-medium">Edit</span>
                </>
              ) : (
                <>
                  <Eye className="h-4 w-4" />
                  <span className="text-sm font-medium">Preview</span>
                </>
              )}
            </Button>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <ToolbarGroup>
            <ToolbarButton
              onClick={() => editor.chain().focus().toggleBold().run()}
              isActive={editor.isActive("bold")}
            >
              <Bold className="h-4 w-4" />
            </ToolbarButton>
            <ToolbarButton
              onClick={() => editor.chain().focus().toggleItalic().run()}
              isActive={editor.isActive("italic")}
            >
              <Italic className="h-4 w-4" />
            </ToolbarButton>
            <ToolbarButton
              onClick={() => editor.chain().focus().toggleUnderline().run()}
              isActive={editor.isActive("underline")}
            >
              <UnderlineIcon className="h-4 w-4" />
            </ToolbarButton>
            <ToolbarButton
              onClick={() => editor.chain().focus().toggleStrike().run()}
              isActive={editor.isActive("strike")}
            >
              <Strikethrough className="h-4 w-4" />
            </ToolbarButton>
          </ToolbarGroup>

          <ToolbarGroup>
            <ToolbarButton
              onClick={() =>
                editor.chain().focus().toggleHeading({ level: 1 }).run()
              }
              isActive={editor.isActive("heading", { level: 1 })}
            >
              <Heading1 className="h-4 w-4" />
            </ToolbarButton>
            <ToolbarButton
              onClick={() =>
                editor.chain().focus().toggleHeading({ level: 2 }).run()
              }
              isActive={editor.isActive("heading", { level: 2 })}
            >
              <Heading2 className="h-4 w-4" />
            </ToolbarButton>
          </ToolbarGroup>

          <ToolbarGroup>
            <ToolbarButton
              onClick={() => editor.chain().focus().toggleBulletList().run()}
              isActive={editor.isActive("bulletList")}
            >
              <List className="h-4 w-4" />
            </ToolbarButton>
            <ToolbarButton
              onClick={() => editor.chain().focus().toggleOrderedList().run()}
              isActive={editor.isActive("orderedList")}
            >
              <ListOrdered className="h-4 w-4" />
            </ToolbarButton>
          </ToolbarGroup>

          <ToolbarGroup>
            <ToolbarButton
              onClick={() => editor.chain().focus().toggleBlockquote().run()}
              isActive={editor.isActive("blockquote")}
            >
              <Quote className="h-4 w-4" />
            </ToolbarButton>
            <ToolbarButton
              onClick={() => editor.chain().focus().toggleCode().run()}
              isActive={editor.isActive("code")}
            >
              <Code className="h-4 w-4" />
            </ToolbarButton>
            <ToolbarButton
              onClick={() => editor.chain().focus().toggleCodeBlock().run()}
              isActive={editor.isActive("codeBlock")}
            >
              <Terminal className="h-4 w-4" />
            </ToolbarButton>
          </ToolbarGroup>

          <ToolbarGroup>
            <ToolbarButton
              onClick={() => setIsLinkModalOpen(true)}
              isActive={editor.isActive("link")}
            >
              <LinkIcon className="h-4 w-4" />
            </ToolbarButton>
            <ToolbarButton onClick={() => setIsImageModalOpen(true)}>
              <ImageIcon className="h-4 w-4" />
            </ToolbarButton>
          </ToolbarGroup>

          <ToolbarGroup>
            <ToolbarButton
              onClick={() => editor.chain().focus().setTextAlign("left").run()}
              isActive={editor.isActive({ textAlign: "left" })}
            >
              <AlignLeft className="h-4 w-4" />
            </ToolbarButton>
            <ToolbarButton
              onClick={() =>
                editor.chain().focus().setTextAlign("center").run()
              }
              isActive={editor.isActive({ textAlign: "center" })}
            >
              <AlignCenter className="h-4 w-4" />
            </ToolbarButton>
            <ToolbarButton
              onClick={() => editor.chain().focus().setTextAlign("right").run()}
              isActive={editor.isActive({ textAlign: "right" })}
            >
              <AlignRight className="h-4 w-4" />
            </ToolbarButton>
          </ToolbarGroup>

          <ToolbarGroup>
            <ToolbarButton
              onClick={() =>
                editor
                  .chain()
                  .focus()
                  .insertTable({ rows: 3, cols: 3, withHeaderRow: true })
                  .run()
              }
            >
              <TableIcon className="h-4 w-4" />
            </ToolbarButton>
          </ToolbarGroup>

          <ToolbarGroup>
            <ToolbarButton
              onClick={() => editor.chain().focus().toggleHighlight().run()}
              isActive={editor.isActive("highlight")}
            >
              <Highlighter className="h-4 w-4" />
            </ToolbarButton>
            <ColorPicker
              value={editor.getAttributes("textStyle").color}
              onChange={(color) => {
                editor.chain().focus().setColor(color).run();
              }}
            />
          </ToolbarGroup>
        </div>
      </div>
    );
  };

  return (
    <div className="w-full">
      {renderToolbar()}
      {mounted && editor && (
        <div className="flex items-center gap-2 px-2 py-1 bg-gray-50 border-x border-b">
          <TableToolbar editor={editor} />
          {editor.isActive("table") && (
            <Button
              size="sm"
              variant="ghost"
              onClick={() => {
                const { state } = editor;
                const { selection } = state;
                const { $head } = selection;

                let depth = $head.depth;
                let tableNode = null;
                let tablePos = -1;

                // Find the closest parent table node
                while (depth > 0) {
                  const node = $head.node(depth);
                  if (node.type.name === "table") {
                    tableNode = node;
                    tablePos = $head.before(depth);
                    break;
                  }
                  depth--;
                }

                if (tableNode) {
                  const tableEndPos = tablePos + tableNode.nodeSize;
                  editor
                    .chain()
                    .insertContentAt(tableEndPos, { type: "paragraph" })
                    .focus(tableEndPos + 1)
                    .run();
                }
              }}
            >
              Exit Table
            </Button>
          )}
        </div>
      )}
      {isPreview ? (
        <div
          className="min-h-[200px] prose prose-slate px-4 py-3 bg-white rounded-b border border-gray-200 richtext-content shadow-sm transition-all hover:shadow-md"
          dangerouslySetInnerHTML={{ __html: value }}
        />
      ) : (
        <EditorContent editor={editor} />
      )}
      {isLinkModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-xl shadow-2xl max-w-md w-full mx-4 transform transition-all">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Add Link
            </h3>
            <form onSubmit={handleLinkSubmit} className="space-y-4">
              <div className="space-y-2">
                <label
                  htmlFor="url"
                  className="block text-sm font-medium text-gray-700"
                >
                  URL
                </label>
                <input
                  id="url"
                  type="url"
                  value={linkUrl}
                  onChange={(e) => setLinkUrl(e.target.value)}
                  placeholder="https://example.com"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsLinkModalOpen(false)}
                  className="px-4"
                >
                  Cancel
                </Button>
                <Button type="submit" className="px-4">
                  Insert Link
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
      {isImageModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-xl shadow-2xl max-w-md w-full mx-4 transform transition-all">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Insert Image
            </h3>
            <form onSubmit={handleImageSubmit} className="space-y-4">
              <div className="space-y-2">
                <label
                  htmlFor="imageUrl"
                  className="block text-sm font-medium text-gray-700"
                >
                  Image URL
                </label>
                <input
                  id="imageUrl"
                  type="url"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  placeholder="https://example.com/image.jpg"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsImageModalOpen(false)}
                  className="px-4"
                >
                  Cancel
                </Button>
                <Button type="submit" className="px-4">
                  Insert Image
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
