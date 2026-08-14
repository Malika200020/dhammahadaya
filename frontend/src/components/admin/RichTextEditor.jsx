import { useEffect, useRef } from 'react';
import Quill from 'quill';
import 'quill/dist/quill.snow.css';
import './RichTextEditor.css';

// Uncontrolled editor (standard for Quill): `value` seeds the initial
// content once, then Quill owns its own DOM — every keystroke reports the
// current HTML back via onChange rather than round-tripping through React
// state on every render.
export function RichTextEditor({ value, onChange }) {
  // Quill's snow theme inserts a toolbar as a *sibling* of the element you
  // hand it, not a child — so cleanup has to remove everything from a
  // wrapper div we own, not just the target element itself. Without this,
  // React StrictMode's dev-mode mount→unmount→mount cycle (and any real
  // remount) leaves a stale toolbar behind.
  const wrapperRef = useRef(null);
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

  useEffect(() => {
    // Captured in the closure rather than re-read from the ref in the
    // cleanup below: useEffect cleanup runs asynchronously after commit,
    // and by then an unmounting component's DOM ref can already be null.
    const wrapperEl = wrapperRef.current;
    const editorTarget = document.createElement('div');
    wrapperEl.appendChild(editorTarget);

    const quill = new Quill(editorTarget, {
      theme: 'snow',
      modules: {
        toolbar: [
          [{ header: [2, 3, false] }],
          ['bold', 'italic', 'underline'],
          [{ list: 'ordered' }, { list: 'bullet' }],
          ['link'],
          ['clean'],
        ],
      },
    });
    if (value) quill.clipboard.dangerouslyPasteHTML(value);
    quill.on('text-change', () => {
      onChangeRef.current(quill.root.innerHTML);
    });

    return () => {
      wrapperEl.innerHTML = '';
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return <div ref={wrapperRef} className="rich-text-editor" />;
}
