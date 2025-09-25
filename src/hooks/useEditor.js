import { useRef, useCallback } from "react";

export default function useEditor(initialContent = "") {
  const editorRef = useRef();

  const setFormat = useCallback((cmd, value = null) => {
    document.execCommand(cmd, false, value);
  }, []);

  const getContent = useCallback(() => {
    return editorRef.current?.innerHTML || "";
  }, []);

  return { editorRef, setFormat, getContent };
}