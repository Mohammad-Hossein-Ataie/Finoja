'use client';
import { useEditor, EditorContent, BubbleMenu } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import Link from '@tiptap/extension-link';
import TextAlign from '@tiptap/extension-text-align';
import Color from '@tiptap/extension-color';
import Underline from '@tiptap/extension-underline';
import { Box, Tooltip, IconButton, Divider, Stack, Input } from '@mui/material';
import FormatBoldIcon from '@mui/icons-material/FormatBold';
import FormatItalicIcon from '@mui/icons-material/FormatItalic';
import FormatUnderlinedIcon from '@mui/icons-material/FormatUnderlined';
import StrikethroughSIcon from '@mui/icons-material/StrikethroughS';
import FormatListBulletedIcon from '@mui/icons-material/FormatListBulleted';
import FormatListNumberedIcon from '@mui/icons-material/FormatListNumbered';
import FormatQuoteIcon from '@mui/icons-material/FormatQuote';
import FormatAlignLeftIcon from '@mui/icons-material/FormatAlignLeft';
import FormatAlignCenterIcon from '@mui/icons-material/FormatAlignCenter';
import FormatAlignRightIcon from '@mui/icons-material/FormatAlignRight';
import CodeIcon from '@mui/icons-material/Code';
import InsertPhotoIcon from '@mui/icons-material/InsertPhoto';
import LinkIcon from '@mui/icons-material/Link';
import UndoIcon from '@mui/icons-material/Undo';
import RedoIcon from '@mui/icons-material/Redo';
import FormatColorTextIcon from '@mui/icons-material/FormatColorText';
import ClearIcon from '@mui/icons-material/ClearAll';
import { Typography } from "@mui/material";

export default function RichTextEditor({ value, onChange }) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Image,
      Link.configure({ openOnClick: false }),
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
      Color,
      Underline
    ],
    content: value || '',
    onUpdate({ editor }) {
      onChange(editor.getHTML());
    },
  });

  if (!editor) return null;

  // Toolbar button helper
  const ToolbarButton = ({ onClick, icon, active, disabled, tip }) => (
    <Tooltip title={tip || ''}>
      <span>
        <IconButton
          size="small"
          onClick={onClick}
          sx={{
            color: active ? 'primary.main' : 'inherit',
            bgcolor: active ? '#e8f0fe' : 'transparent',
            borderRadius: 1,
            mx: 0.2,
            transition: '0.15s',
          }}
          disabled={disabled}
        >
          {icon}
        </IconButton>
      </span>
    </Tooltip>
  );

  // Color picker
  const ColorPicker = () => (
    <Input
      type="color"
      sx={{ width: 32, height: 32, p: 0.5, minWidth: 32, bgcolor: '#fff', borderRadius: 1, mx: 0.5 }}
      value={editor.getAttributes('textStyle').color || '#121212'}
      onChange={e => editor.chain().focus().setColor(e.target.value).run()}
      inputProps={{ style: { cursor: 'pointer', padding: 0 } }}
    />
  );

  return (
    <Box>
      <Stack direction="row" alignItems="center" sx={{
        p: 1, bgcolor: '#f5f8fa', borderRadius: 2, border: '1px solid #eee', mb: 1, flexWrap: 'wrap',
        gap: 0.2, boxShadow: 1, position: 'relative', zIndex: 10,
      }}>
        <ToolbarButton onClick={() => editor.chain().focus().undo().run()} icon={<UndoIcon />} tip="Undo" />
        <ToolbarButton onClick={() => editor.chain().focus().redo().run()} icon={<RedoIcon />} tip="Redo" />
        <Divider orientation="vertical" flexItem sx={{ mx: 1 }} />
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBold().run()}
          icon={<FormatBoldIcon />}
          active={editor.isActive('bold')}
          tip="Bold"
        />
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleItalic().run()}
          icon={<FormatItalicIcon />}
          active={editor.isActive('italic')}
          tip="Italic"
        />
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          icon={<FormatUnderlinedIcon />}
          active={editor.isActive('underline')}
          tip="Underline"
        />
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleStrike().run()}
          icon={<StrikethroughSIcon />}
          active={editor.isActive('strike')}
          tip="Strike"
        />
        <ToolbarButton
          onClick={() => editor.chain().focus().unsetAllMarks().clearNodes().run()}
          icon={<ClearIcon />}
          tip="Clear"
        />
        <Divider orientation="vertical" flexItem sx={{ mx: 1 }} />
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          icon={<Typography fontWeight={900} fontSize={18}>H2</Typography>}
          active={editor.isActive('heading', { level: 2 })}
          tip="Heading"
        />
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          icon={<FormatListBulletedIcon />}
          active={editor.isActive('bulletList')}
          tip="Bullet List"
        />
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          icon={<FormatListNumberedIcon />}
          active={editor.isActive('orderedList')}
          tip="Numbered List"
        />
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          icon={<FormatQuoteIcon />}
          active={editor.isActive('blockquote')}
          tip="Quote"
        />
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleCodeBlock().run()}
          icon={<CodeIcon />}
          active={editor.isActive('codeBlock')}
          tip="Code"
        />
        <Divider orientation="vertical" flexItem sx={{ mx: 1 }} />
        <ToolbarButton
          onClick={() => editor.chain().focus().setTextAlign('left').run()}
          icon={<FormatAlignLeftIcon />}
          active={editor.isActive({ textAlign: 'left' })}
          tip="Align Left"
        />
        <ToolbarButton
          onClick={() => editor.chain().focus().setTextAlign('center').run()}
          icon={<FormatAlignCenterIcon />}
          active={editor.isActive({ textAlign: 'center' })}
          tip="Align Center"
        />
        <ToolbarButton
          onClick={() => editor.chain().focus().setTextAlign('right').run()}
          icon={<FormatAlignRightIcon />}
          active={editor.isActive({ textAlign: 'right' })}
          tip="Align Right"
        />
        <Divider orientation="vertical" flexItem sx={{ mx: 1 }} />
        <ColorPicker />
        <ToolbarButton
          onClick={() => {
            const url = prompt('Image URL');
            if (url) editor.chain().focus().setImage({ src: url }).run();
          }}
          icon={<InsertPhotoIcon />}
          tip="Insert Image"
        />
        <ToolbarButton
          onClick={() => {
            const url = prompt('Link URL');
            if (url) editor.chain().focus().setLink({ href: url }).run();
          }}
          icon={<LinkIcon />}
          active={editor.isActive('link')}
          tip="Insert Link"
        />
      </Stack>
      <Box sx={{
        border: '1px solid #eee', borderRadius: 2, minHeight: 160, p: 1.5,
        background: '#fff', fontSize: 16, '& .ProseMirror': { outline: 'none' }
      }}>
        <EditorContent editor={editor} />
      </Box>
    </Box>
  );
}
