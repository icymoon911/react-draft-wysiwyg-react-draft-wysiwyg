import { useState, useEffect, useRef, useCallback } from 'react';

/**
 * Hook that manages expand/collapse state for toolbar control dropdowns/modals.
 * Registers a callback with the modalHandler to close modals when clicking outside.
 */
export function useExpandCollapse(modalHandler) {
  const [expanded, setExpanded] = useState(false);
  const signalExpandedRef = useRef(false);

  const onExpandEvent = useCallback(() => {
    signalExpandedRef.current = !expanded;
  }, [expanded]);

  const doExpand = useCallback(() => {
    setExpanded(true);
  }, []);

  const doCollapse = useCallback(() => {
    setExpanded(false);
  }, []);

  const expandCollapse = useCallback(() => {
    setExpanded(signalExpandedRef.current);
    signalExpandedRef.current = false;
  }, []);

  useEffect(() => {
    if (modalHandler) {
      modalHandler.registerCallBack(expandCollapse);
    }
    return () => {
      if (modalHandler) {
        modalHandler.deregisterCallBack(expandCollapse);
      }
    };
  }, [modalHandler, expandCollapse]);

  return { expanded, onExpandEvent, doExpand, doCollapse };
}

/**
 * Hook that derives state from editorState and re-computes when editorState changes.
 */
export function useEditorStateSync(editorState, deriveFn, initialValue) {
  const [value, setValue] = useState(() =>
    editorState ? deriveFn(editorState) : initialValue
  );

  const prevEditorStateRef = useRef(editorState);

  useEffect(() => {
    if (editorState && editorState !== prevEditorStateRef.current) {
      setValue(deriveFn(editorState));
    }
    prevEditorStateRef.current = editorState;
  }, [editorState, deriveFn]);

  return value;
}

/**
 * Hook for modal form state: initializes state when expanded becomes true,
 * resets state when expanded becomes false.
 */
export function useModalFormState(expanded, getInitialState) {
  const [formState, setFormState] = useState(getInitialState);
  const prevExpandedRef = useRef(expanded);

  useEffect(() => {
    if (expanded && !prevExpandedRef.current) {
      // Opening
      setFormState(getInitialState());
    } else if (!expanded && prevExpandedRef.current) {
      // Closing
      setFormState(getInitialState());
    }
    prevExpandedRef.current = expanded;
  }, [expanded, getInitialState]);

  const updateFormField = useCallback((name, value) => {
    setFormState(prev => ({ ...prev, [name]: value }));
  }, []);

  const updateFormFromEvent = useCallback((event) => {
    const { name, value } = event.target;
    setFormState(prev => ({ ...prev, [name]: value }));
  }, []);

  const resetForm = useCallback(() => {
    setFormState(getInitialState());
  }, [getInitialState]);

  return { formState, setFormState, updateFormField, updateFormFromEvent, resetForm };
}
