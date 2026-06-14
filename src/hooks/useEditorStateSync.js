import { useState, useEffect, useRef } from 'react';

/**
 * Custom hook that syncs computed values from editorState changes.
 * Handles the common pattern of extracting data from editorState
 * and updating local state when editorState changes.
 *
 * @param {object} editorState - The DraftJS editor state
 * @param {function} computeFn - Function that receives editorState and returns the computed value
 * @param {*} initialValue - Initial value before editorState is available
 */
export default function useEditorStateSync(editorState, computeFn, initialValue) {
  const [value, setValue] = useState(() =>
    editorState ? computeFn(editorState) : initialValue
  );
  const prevEditorStateRef = useRef(editorState);

  useEffect(() => {
    if (editorState && editorState !== prevEditorStateRef.current) {
      setValue(computeFn(editorState));
    }
    prevEditorStateRef.current = editorState;
  }, [editorState, computeFn]);

  return value;
}
