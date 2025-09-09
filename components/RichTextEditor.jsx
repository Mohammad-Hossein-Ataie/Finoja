// ===============================
// FILE: components/RichTextEditor.jsx
// ===============================
import React from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import Link from "@tiptap/extension-link";
import TextStyle from "@tiptap/extension-text-style";
import Color from "@tiptap/extension-color";
import TextAlign from "@tiptap/extension-text-align";
import Table from "@tiptap/extension-table";
import TableRow from "@tiptap/extension-table-row";
import TableCell from "@tiptap/extension-table-cell";
import TableHeader from "@tiptap/extension-table-header";

import {
  Box, IconButton, Popover, Tooltip, Divider, Paper,
  TextField, FormControlLabel, Checkbox, Button, Stack
} from "@mui/material";
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
import GridOnIcon from "@mui/icons-material/GridOn";
import GridOffIcon from "@mui/icons-material/GridOff";
import OpenInFullIcon from "@mui/icons-material/OpenInFull";
import CloseFullscreenIcon from "@mui/icons-material/CloseFullscreen";
import TableRowsIcon from "@mui/icons-material/TableRows";
import ViewColumnIcon from "@mui/icons-material/ViewColumn";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";

export default function RichTextEditor({ value, onChange }) {
  const [colorAnchor, setColorAnchor] = React.useState(null);
  const [tblAnchor, setTblAnchor] = React.useState(null);
  const [fullscreen, setFullscreen] = React.useState(false);
  const [rows, setRows] = React.useState(3);
  const [cols, setCols] = React.useState(3);
  const [withHeader, setWithHeader] = React.useState(true);

  const editor = useEditor({
    extensions: [
      TextStyle,
      Color,
      Underline,
      Link.configure({
        openOnClick: false,
        autolink: true,
        linkOnPaste: true,
        HTMLAttributes: { rel: "noopener noreferrer nofollow", target: "_blank" },
      }),
      StarterKit.configure({ heading: { levels: [1, 2, 3] } }),
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      Table.configure({ resizable: true }),
      TableRow,
      TableHeader,
      TableCell,
    ],
    content: value || "",
    onUpdate: ({ editor }) => onChange?.(editor.getHTML()),
  });

  React.useEffect(() => {
    const onEsc = (e) => { if (e.key === "Escape") setFullscreen(false); };
    window.addEventListener("keydown", onEsc);
    return () => window.removeEventListener("keydown", onEsc);
  }, []);

  if (!editor) return null;

  const currentColor = editor.getAttributes("textStyle").color || "#000000";
  const setLink = () => {
    const url = window.prompt("آدرس لینک را وارد کنید:");
    if (!url) return;
    editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
  };

  const insertTable = () => {
    editor.chain().focus().insertTable({ rows, cols, withHeaderRow: withHeader }).run();
    setTblAnchor(null);
  };

  // ارتفاع ناحیه نوشتن در حالت تمام‌صفحه
  const editorAreaHeight = "calc(100dvh - 160px)";

  return (
    <Box>
      <Paper
        elevation={fullscreen ? 8 : 0}
        sx={{
          position: fullscreen ? "fixed" : "relative",
          inset: fullscreen ? 0 : "auto",
          zIndex: fullscreen ? 1300 : "auto",
          p: 1.5,
          bgcolor: "#fff",
          borderRadius: 2,
          display: "flex",
          flexDirection: "column",
          height: fullscreen ? "100dvh" : "auto",
        }}
      >
        {/* Toolbar */}
        <Box sx={{ display: "flex", gap: 1, alignItems: "center", mb: 1, flexWrap: "wrap" }}>
          <Tooltip title="تمام‌صفحه">
            <IconButton size="small" onClick={() => setFullscreen(v => !v)}>
              {fullscreen ? <CloseFullscreenIcon /> : <OpenInFullIcon />}
            </IconButton>
          </Tooltip>

          <Divider orientation="vertical" flexItem sx={{ mx: 0.5 }} />

          <Tooltip title="Undo"><span>
            <IconButton size="small" onClick={() => editor.chain().focus().undo().run()} disabled={!editor.can().undo()}><UndoIcon /></IconButton>
          </span></Tooltip>
          <Tooltip title="Redo"><span>
            <IconButton size="small" onClick={() => editor.chain().focus().redo().run()} disabled={!editor.can().redo()}><RedoIcon /></IconButton>
          </span></Tooltip>

          <Divider orientation="vertical" flexItem sx={{ mx: 0.5 }} />

          <Tooltip title="بولد"><IconButton size="small" onClick={() => editor.chain().focus().toggleBold().run()} color={editor.isActive("bold") ? "primary" : "default"}><FormatBoldIcon /></IconButton></Tooltip>
          <Tooltip title="ایتالیک"><IconButton size="small" onClick={() => editor.chain().focus().toggleItalic().run()} color={editor.isActive("italic") ? "primary" : "default"}><FormatItalicIcon /></IconButton></Tooltip>
          <Tooltip title="آندرلاین"><IconButton size="small" onClick={() => editor.chain().focus().toggleUnderline().run()} color={editor.isActive("underline") ? "primary" : "default"}><FormatUnderlinedIcon /></IconButton></Tooltip>
          <Tooltip title="پاک‌کردن فرمت"><IconButton size="small" onClick={() => editor.chain().focus().unsetAllMarks().clearNodes().run()}><FormatClearIcon /></IconButton></Tooltip>

          <Divider orientation="vertical" flexItem sx={{ mx: 0.5 }} />

          <Tooltip title="لیست بولت"><IconButton size="small" onClick={() => editor.chain().focus().toggleBulletList().run()} color={editor.isActive("bulletList") ? "primary" : "default"}><FormatListBulletedIcon /></IconButton></Tooltip>
          <Tooltip title="لیست عددی"><IconButton size="small" onClick={() => editor.chain().focus().toggleOrderedList().run()} color={editor.isActive("orderedList") ? "primary" : "default"}><FormatListNumberedIcon /></IconButton></Tooltip>
          <Tooltip title="نقل قول"><IconButton size="small" onClick={() => editor.chain().focus().toggleBlockquote().run()} color={editor.isActive("blockquote") ? "primary" : "default"}><FormatQuoteIcon /></IconButton></Tooltip>
          <Tooltip title="کد"><IconButton size="small" onClick={() => editor.chain().focus().toggleCodeBlock().run()} color={editor.isActive("codeBlock") ? "primary" : "default"}><CodeIcon /></IconButton></Tooltip>
          <Tooltip title="لینک"><IconButton size="small" onClick={setLink} color={editor.isActive("link") ? "primary" : "default"}><LinkIcon /></IconButton></Tooltip>
          <Tooltip title="سرتیتر"><IconButton size="small" onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} color={editor.isActive("heading", { level: 2 }) ? "primary" : "default"}><TitleIcon /></IconButton></Tooltip>

          <Divider orientation="vertical" flexItem sx={{ mx: 0.5 }} />

          {/* Table controls */}
          <Tooltip title="افزودن جدول">
            <IconButton size="small" onClick={(e) => setTblAnchor(e.currentTarget)}><GridOnIcon /></IconButton>
          </Tooltip>
          <Popover open={Boolean(tblAnchor)} anchorEl={tblAnchor} onClose={() => setTblAnchor(null)} anchorOrigin={{ vertical: "bottom", horizontal: "left" }}>
            <Box sx={{ p: 2, width: 260 }}>
              <Stack direction="row" gap={1}>
                <TextField
                  label="سطر"
                  size="small"
                  type="number"
                  value={rows}
                  onChange={(e) => setRows(Math.max(1, Number(e.target.value)))}
                  sx={{ flex: 1 }}
                />
                <TextField
                  label="ستون"
                  size="small"
                  type="number"
                  value={cols}
                  onChange={(e) => setCols(Math.max(1, Number(e.target.value)))}
                  sx={{ flex: 1 }}
                />
              </Stack>
              <FormControlLabel
                sx={{ mt: 1 }}
                control={<Checkbox checked={withHeader} onChange={(e) => setWithHeader(e.target.checked)} />}
                label="سطر هدر"
              />
              <Button fullWidth variant="contained" sx={{ mt: 1 }} onClick={insertTable}>ایجاد جدول</Button>
            </Box>
          </Popover>

          <Tooltip title="افزودن سطر"><IconButton size="small" onClick={() => editor.chain().focus().addRowAfter().run()}><TableRowsIcon /></IconButton></Tooltip>
          <Tooltip title="افزودن ستون"><IconButton size="small" onClick={() => editor.chain().focus().addColumnAfter().run()}><ViewColumnIcon /></IconButton></Tooltip>
          <Tooltip title="حذف سطر"><IconButton size="small" onClick={() => editor.chain().focus().deleteRow().run()}><DeleteOutlineIcon /></IconButton></Tooltip>
          <Tooltip title="حذف ستون"><IconButton size="small" onClick={() => editor.chain().focus().deleteColumn().run()}><DeleteOutlineIcon /></IconButton></Tooltip>
          <Tooltip title="حذف کل جدول"><span>
            <IconButton size="small" onClick={() => editor.chain().focus().deleteTable().run()} disabled={!editor.can().deleteTable()}>
              <GridOffIcon />
            </IconButton>
          </span></Tooltip>

          <Divider orientation="vertical" flexItem sx={{ mx: 0.5 }} />

          <Tooltip title="رنگ متن">
            <IconButton size="small" onClick={(e) => setColorAnchor(e.currentTarget)}>
              <FormatColorTextIcon />
              <span style={{ display: "inline-block", width: 16, height: 16, borderRadius: "50%", marginLeft: 3, border: "1.5px solid #aaa", background: currentColor }} />
            </IconButton>
          </Tooltip>
          <Popover open={Boolean(colorAnchor)} anchorEl={colorAnchor} onClose={() => setColorAnchor(null)} anchorOrigin={{ vertical: "bottom", horizontal: "left" }}>
            <Box sx={{ p: 2 }}>
              <input type="color" onChange={(e) => { editor.chain().focus().setColor(e.target.value).run(); setColorAnchor(null); }} value={currentColor} style={{ width: 36, height: 36, border: "none", background: "none" }} autoFocus />
            </Box>
          </Popover>
        </Box>

        {/* Editable area */}
        <Box
          onMouseDown={() => editor.chain().focus().run()} // کلیک روی هرجای باکس، فوکِس
          sx={{
            border: "1px solid #eee",
            borderRadius: 2,
            background: "#fff",
            // در حالت تمام‌صفحه کل ارتفاع را بگیر
            height: fullscreen ? editorAreaHeight : "auto",
            flex: fullscreen ? 1 : "initial",
            // استایل خود ProseMirror
            "& .ProseMirror": {
              outline: "none",
              cursor: "text",
              minHeight: fullscreen ? editorAreaHeight : 160,
              padding: 1.5,
              fontSize: 16,
              overflowY: "auto",
            },
            // جدول‌ها
            "& .ProseMirror table": { width: "100%", borderCollapse: "collapse", margin: "12px 0" },
            "& .ProseMirror th, & .ProseMirror td": { border: "1px solid #e5e7eb", padding: "8px 10px" },
            "& .ProseMirror th": { background: "#f3f4f6", fontWeight: 800, textAlign: "center" },
            "& .ProseMirror tr:nth-of-type(even) td": { background: "#fafafa" },
          }}
        >
          <div dir="auto"><EditorContent editor={editor} /></div>
        </Box>
      </Paper>
    </Box>
  );
}
