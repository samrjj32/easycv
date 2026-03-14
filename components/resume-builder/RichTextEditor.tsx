"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import Highlight from "@tiptap/extension-highlight";
import TextAlign from "@tiptap/extension-text-align";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { 
  Bold, 
  Italic, 
  Underline as UnderlineIcon, 
  Strikethrough, 
  PaintBucket,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  List, 
  ListOrdered,
  Undo,
  Redo,
  Sparkles,
  Eraser
} from "lucide-react";
import { cn } from "@/lib/utils";

interface RichTextEditorProps {
  content: string;
  onChange: (content: string) => void;
}

export function RichTextEditor({ content, onChange }: RichTextEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      Highlight.configure({
        multicolor: true,
      }),
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
    ],
    content,
    immediatelyRender: false,
    editorProps: {
      attributes: {
        class: "outline-none focus:outline-none min-h-[140px] cursor-text",
      },
    },
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
  });

  if (!editor) {
    return null;
  }

  return (
    <div className="border rounded-xl border-gray-100 bg-white shadow-sm mt-1 focus-within:ring-1 focus-within:ring-blue-500 overflow-hidden">
      <div className="bg-[#fafafa] border-b border-gray-100 p-2 flex flex-wrap items-center gap-x-2 gap-y-2">
        {/* Formatting Group */}
        <div className="flex items-center gap-0.5">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => editor.chain().focus().toggleBold().run()}
            className={cn("w-8 h-8 rounded-md text-gray-700 hover:text-gray-900 hover:bg-gray-200", editor.isActive("bold") && "bg-gray-200 text-gray-900")}
            title="Bold"
          >
            <Bold className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => editor.chain().focus().toggleItalic().run()}
            className={cn("w-8 h-8 rounded-md text-gray-700 hover:text-gray-900 hover:bg-gray-200", editor.isActive("italic") && "bg-gray-200 text-gray-900")}
             title="Italic"
          >
            <Italic className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => editor.chain().focus().toggleUnderline().run()}
            className={cn("w-8 h-8 rounded-md text-gray-700 hover:text-gray-900 hover:bg-gray-200", editor.isActive("underline") && "bg-gray-200 text-gray-900")}
            title="Underline"
          >
            <UnderlineIcon className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => editor.chain().focus().unsetAllMarks().run()}
            className="w-8 h-8 rounded-md text-gray-700 hover:text-gray-900 hover:bg-gray-200"
            title="Clear Formatting"
          >
            <Eraser className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => editor.chain().focus().toggleHighlight().run()}
            className={cn("w-8 h-8 rounded-md text-gray-700 hover:text-gray-900 hover:bg-gray-200", editor.isActive("highlight") && "bg-gray-200 text-gray-900")}
            title="Highlight"
          >
            <PaintBucket className="w-4 h-4" />
          </Button>
        </div>

        <Separator orientation="vertical" className="h-4 bg-gray-200" />

        {/* Alignment Group */}
        <div className="flex items-center gap-0.5">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => editor.chain().focus().setTextAlign('left').run()}
            className={cn("w-8 h-8 rounded-md text-gray-700 hover:text-gray-900 hover:bg-gray-200", editor.isActive({ textAlign: 'left' }) && "bg-gray-200 text-gray-900")}
            title="Align Left"
          >
            <AlignLeft className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => editor.chain().focus().setTextAlign('center').run()}
            className={cn("w-8 h-8 rounded-md text-gray-700 hover:text-gray-900 hover:bg-gray-200", editor.isActive({ textAlign: 'center' }) && "bg-gray-200 text-gray-900")}
            title="Align Center"
          >
            <AlignCenter className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => editor.chain().focus().setTextAlign('right').run()}
            className={cn("w-8 h-8 rounded-md text-gray-700 hover:text-gray-900 hover:bg-gray-200", editor.isActive({ textAlign: 'right' }) && "bg-gray-200 text-gray-900")}
            title="Align Right"
          >
            <AlignRight className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => editor.chain().focus().setTextAlign('justify').run()}
            className={cn("w-8 h-8 rounded-md text-gray-700 hover:text-gray-900 hover:bg-gray-200", editor.isActive({ textAlign: 'justify' }) && "bg-gray-200 text-gray-900")}
            title="Justify"
          >
            <AlignJustify className="w-4 h-4" />
          </Button>
        </div>

        <Separator orientation="vertical" className="h-4 bg-gray-200 hidden xl:block" />

        {/* Third Group (Lists, Undo, Redo, AI Polish) wrapped nicely */}
        <div className="flex items-center gap-x-2 w-full xl:w-auto mt-1 xl:mt-0">
          {/* List Group */}
          <div className="flex items-center gap-0.5">
            <Button
               variant="ghost"
               size="icon"
               onClick={() => editor.chain().focus().toggleBulletList().run()}
               className={cn("w-8 h-8 rounded-md text-gray-700 hover:text-gray-900 hover:bg-gray-200", editor.isActive("bulletList") && "bg-gray-200 text-gray-900")}
               title="Bullet List"
            >
              <List className="w-4 h-4" />
            </Button>
            <Button
               variant="ghost"
               size="icon"
               onClick={() => editor.chain().focus().toggleOrderedList().run()}
               className={cn("w-8 h-8 rounded-md text-gray-700 hover:text-gray-900 hover:bg-gray-200", editor.isActive("orderedList") && "bg-gray-200 text-gray-900")}
               title="Numbered List"
            >
              <ListOrdered className="w-4 h-4" />
            </Button>
          </div>

          <Separator orientation="vertical" className="h-4 bg-gray-200 mx-0.5" />

          {/* History Group */}
          <div className="flex items-center gap-0.5">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => editor.chain().focus().undo().run()}
              disabled={!editor.can().undo()}
              className="w-8 h-8 rounded-md text-gray-700 hover:text-gray-900 hover:bg-gray-200 disabled:opacity-50"
              title="Undo"
            >
              <Undo className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => editor.chain().focus().redo().run()}
              disabled={!editor.can().redo()}
              className="w-8 h-8 rounded-md text-gray-700 hover:text-gray-900 hover:bg-gray-200 disabled:opacity-50"
              title="Redo"
            >
              <Redo className="w-4 h-4" />
            </Button>
          </div>

          {/* AI Polish Button */}
          <Button
            variant="outline"
            className="h-8 gap-1.5 px-3 rounded-full border-gray-200 bg-white hover:bg-gray-50 text-gray-700 font-medium text-xs ml-1 shadow-sm"
            onClick={() => {
              // Stub for AI Polish
            }}
          >
            <Sparkles className="w-3.5 h-3.5" />
            AI Polish
          </Button>
        </div>
      </div>
      
      <EditorContent 
        editor={editor} 
        className="p-3 min-h-[140px] prose prose-sm max-w-none focus:outline-none" 
      />
    </div>
  );
}
