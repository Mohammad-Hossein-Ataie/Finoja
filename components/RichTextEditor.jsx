'use client';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import Link from '@tiptap/extension-link';
import TextAlign from '@tiptap/extension-text-align';
import Color from '@tiptap/extension-color';
import { Box, Button, Stack } from '@mui/material';

export default function RichTextEditor({ value, onChange }) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Image,
      Link.configure({ openOnClick: false }),
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
      Color
    ],
    content: value || '',
    onUpdate({ editor }) {
      onChange(editor.getHTML());
    },
  });

  if (!editor) return null;

  return (
    <Box>
      <Box sx={{ border: '1px solid #ccc', borderRadius: 1, mb: 1 }}>
        <Stack direction="row" spacing={1} sx={{ p:1, bgcolor:'#f5f5f5', flexWrap: 'wrap' }}>
          <Button size="small" onClick={() => editor.chain().focus().toggleBold().run()}>B</Button>
          <Button size="small" onClick={() => editor.chain().focus().toggleItalic().run()}>I</Button>
          <Button size="small" onClick={() => editor.chain().focus().toggleUnderline().run()}><u>U</u></Button>
          <Button size="small" onClick={() => editor.chain().focus().toggleStrike().run()}>S</Button>
          <Button size="small" onClick={() => editor.chain().focus().unsetAllMarks().run()}>Clear</Button>
          <Button size="small" onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}>H2</Button>
          <Button size="small" onClick={() => editor.chain().focus().toggleBulletList().run()}>• List</Button>
          <Button size="small" onClick={() => editor.chain().focus().toggleOrderedList().run()}>1. List</Button>
          <Button size="small" onClick={() => editor.chain().focus().setTextAlign('center').run()}>Center</Button>
          <Button size="small" onClick={() => editor.chain().focus().setColor('red').run()}>Red</Button>
          <Button size="small" onClick={() => editor.chain().focus().setColor('black').run()}>Black</Button>
          <Button size="small" onClick={() => editor.chain().focus().setImage({ src: prompt('Image URL') }).run()}>Image</Button>
          <Button size="small" onClick={() => editor.chain().focus().setLink({ href: prompt('URL') }).run()}>Link</Button>
        </Stack>
      </Box>
      <Box sx={{ border: '1px solid #ccc', borderRadius:1, minHeight: 150, p:1, background: '#fff' }}>
        <EditorContent editor={editor} />
      </Box>
    </Box>
  );
}
