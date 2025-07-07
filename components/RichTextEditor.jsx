import React from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import Link from "@tiptap/extension-link";
import TextStyle from "@tiptap/extension-text-style";
import Color from "@tiptap/extension-color";
import TextAlign from "@tiptap/extension-text-align";
import { Box, IconButton, Popover, Tooltip, Divider } from "@mui/material";
import FormatBoldIcon from "@mui/icons-material/FormatBold";
import FormatItalicIcon from "@mui/icons-material/FormatItalic";
import FormatUnderlinedIcon from "@mui/icons-material/FormatUnderlined";
import FormatListBulletedIcon from "@mui/icons-material/FormatListBulleted";
import FormatListNumberedIcon from "@mui/icons-material/FormatListNumbered";
import FormatColorTextIcon from "@mui/icons-material/FormatColorText";
import LinkIcon from "@mui/icons-material/Link";
import TitleIcon from "@mui/icons-material/Title";
import UndoIcon from "@mui/icons-material/Undo";
import RedoIcon from "@mui/icons-material/Redo";
import FormatQuoteIcon from "@mui/icons-material/FormatQuote";
import CodeIcon from "@mui/icons-material/Code";
import FormatClearIcon from "@mui/icons-material/FormatClear";
import FormatAlignLeftIcon from "@mui/icons-material/FormatAlignLeft";
import FormatAlignCenterIcon from "@mui/icons-material/FormatAlignCenter";
import FormatAlignRightIcon from "@mui/icons-material/FormatAlignRight";
import FormatAlignJustifyIcon from "@mui/icons-material/FormatAlignJustify";

export default function RichTextEditor({ value, onChange }) {
  const [anchorEl, setAnchorEl] = React.useState(null);

  const editor = useEditor({
    extensions: [
      TextStyle,
      Color,
      Underline,
      Link,
      StarterKit.configure({
        heading: { levels: [1, 2, 3] },
      }),
      TextAlign.configure({
        types: ["heading", "paragraph"],
      }),
    ],
    content: value || "",
    onUpdate: ({ editor }) => {
      onChange?.(editor.getHTML());
    },
  });

  if (!editor) return null;

  // گرفتن رنگ فعلی انتخاب شده
  const currentColor = editor.getAttributes("textStyle").color || "#000000";

  // لینک ساده
  const setLink = () => {
    const url = window.prompt("آدرس لینک را وارد کنید:");
    if (url) editor.chain().focus().setLink({ href: url }).run();
  };

  // رنگ متن
  const handleColorClick = (event) => setAnchorEl(event.currentTarget);
  const handleColorClose = () => setAnchorEl(null);
  const handleColorChange = (event) => {
    editor.chain().focus().setColor(event.target.value).run();
    setAnchorEl(null);
  };
  const open = Boolean(anchorEl);

  return (
    <Box>
      <Box sx={{
        display: "flex", gap: 1, alignItems: "center", mb: 1, flexWrap: "wrap"
      }}>
        <Tooltip title="Undo"><span>
          <IconButton size="small" onClick={() => editor.chain().focus().undo().run()} disabled={!editor.can().undo()}><UndoIcon /></IconButton>
        </span></Tooltip>
        <Tooltip title="Redo"><span>
          <IconButton size="small" onClick={() => editor.chain().focus().redo().run()} disabled={!editor.can().redo()}><RedoIcon /></IconButton>
        </span></Tooltip>
        <Divider orientation="vertical" flexItem sx={{ mx: 0.5 }} />
        <Tooltip title="بولد">
          <IconButton size="small" onClick={() => editor.chain().focus().toggleBold().run()} color={editor.isActive("bold") ? "primary" : "default"}><FormatBoldIcon /></IconButton>
        </Tooltip>
        <Tooltip title="ایتالیک">
          <IconButton size="small" onClick={() => editor.chain().focus().toggleItalic().run()} color={editor.isActive("italic") ? "primary" : "default"}><FormatItalicIcon /></IconButton>
        </Tooltip>
        <Tooltip title="آندرلاین">
          <IconButton size="small" onClick={() => editor.chain().focus().toggleUnderline().run()} color={editor.isActive("underline") ? "primary" : "default"}><FormatUnderlinedIcon /></IconButton>
        </Tooltip>
        <Tooltip title="پاک‌کردن فرمت">
          <IconButton size="small" onClick={() => editor.chain().focus().unsetAllMarks().clearNodes().run()}><FormatClearIcon /></IconButton>
        </Tooltip>
        <Divider orientation="vertical" flexItem sx={{ mx: 0.5 }} />
        <Tooltip title="لیست بولت">
          <IconButton size="small" onClick={() => editor.chain().focus().toggleBulletList().run()} color={editor.isActive("bulletList") ? "primary" : "default"}><FormatListBulletedIcon /></IconButton>
        </Tooltip>
        <Tooltip title="لیست عددی">
          <IconButton size="small" onClick={() => editor.chain().focus().toggleOrderedList().run()} color={editor.isActive("orderedList") ? "primary" : "default"}><FormatListNumberedIcon /></IconButton>
        </Tooltip>
        <Tooltip title="نقل قول">
          <IconButton size="small" onClick={() => editor.chain().focus().toggleBlockquote().run()} color={editor.isActive("blockquote") ? "primary" : "default"}><FormatQuoteIcon /></IconButton>
        </Tooltip>
        <Tooltip title="کد">
          <IconButton size="small" onClick={() => editor.chain().focus().toggleCodeBlock().run()} color={editor.isActive("codeBlock") ? "primary" : "default"}><CodeIcon /></IconButton>
        </Tooltip>
        <Tooltip title="لینک">
          <IconButton size="small" onClick={setLink} color={editor.isActive("link") ? "primary" : "default"}><LinkIcon /></IconButton>
        </Tooltip>
        <Tooltip title="سرتیتر">
          <IconButton size="small" onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} color={editor.isActive("heading", { level: 2 }) ? "primary" : "default"}><TitleIcon /></IconButton>
        </Tooltip>
        <Divider orientation="vertical" flexItem sx={{ mx: 0.5 }} />
        <Tooltip title="تراز چپ">
          <IconButton size="small" onClick={() => editor.chain().focus().setTextAlign("left").run()} color={editor.isActive({ textAlign: "left" }) ? "primary" : "default"}><FormatAlignLeftIcon /></IconButton>
        </Tooltip>
        <Tooltip title="تراز وسط">
          <IconButton size="small" onClick={() => editor.chain().focus().setTextAlign("center").run()} color={editor.isActive({ textAlign: "center" }) ? "primary" : "default"}><FormatAlignCenterIcon /></IconButton>
        </Tooltip>
        <Tooltip title="تراز راست">
          <IconButton size="small" onClick={() => editor.chain().focus().setTextAlign("right").run()} color={editor.isActive({ textAlign: "right" }) ? "primary" : "default"}><FormatAlignRightIcon /></IconButton>
        </Tooltip>
        <Tooltip title="تراز مساوی">
          <IconButton size="small" onClick={() => editor.chain().focus().setTextAlign("justify").run()} color={editor.isActive({ textAlign: "justify" }) ? "primary" : "default"}><FormatAlignJustifyIcon /></IconButton>
        </Tooltip>
        <Divider orientation="vertical" flexItem sx={{ mx: 0.5 }} />
        <Tooltip title="رنگ متن">
          <IconButton size="small" onClick={handleColorClick}>
            <FormatColorTextIcon />
            <span
              style={{
                display: "inline-block",
                width: 16,
                height: 16,
                borderRadius: "50%",
                marginLeft: 3,
                verticalAlign: "middle",
                border: "1.5px solid #aaa",
                background: currentColor,
              }}
            />
          </IconButton>
        </Tooltip>
        <Popover
          open={open}
          anchorEl={anchorEl}
          onClose={handleColorClose}
          anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
        >
          <Box sx={{ p: 2 }}>
            <input
              type="color"
              onChange={handleColorChange}
              value={currentColor}
              style={{ width: 36, height: 36, border: "none", background: "none" }}
              autoFocus
            />
          </Box>
        </Popover>
      </Box>
      <Box sx={{
        border: "1px solid #eee",
        borderRadius: 2,
        minHeight: 140,
        p: 1.5,
        background: "#fff",
        fontSize: 16,
        "& .ProseMirror": { outline: "none" }
      }}>
        <div dir="auto">
          <EditorContent editor={editor} />
        </div>
      </Box>
    </Box>
  );
}
