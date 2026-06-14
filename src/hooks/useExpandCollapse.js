import { useState, useCallback, useEffect, useRef } from 'react';

/**
 * Custom hook that manages expand/collapse state with modal handler integration.
 * Handles the common pattern of registering a callback with the modal handler
 * that synchronizes the expand/collapse state.
 */
export default function useExpandCollapse(modalHandler) {
  const [expanded, setExpanded] = useState(false);
  const signalRef = useRef(false);
  const expandedRef = useRef(false);

  useEffect(() => {
    expandedRef.current = expanded;
  }, [expanded]);

  const expandCollapse = useCallback(() => {
    setExpanded(signalRef.current);
    signalRef.current = false;
  }, []);

  useEffect(() => {
    modalHandler.registerCallBack(expandCollapse);
    return () => {
      modalHandler.deregisterCallBack(expandCollapse);
    };
  }, [modalHandler, expandCollapse]);

  const onExpandEvent = useCallback(() => {
    signalRef.current = !expandedRef.current;
  }, []);

  const doExpand = useCallback(() => {
    setExpanded(true);
  }, []);

  const doCollapse = useCallback(() => {
    setExpanded(false);
  }, []);

  return { expanded, onExpandEvent, doExpand, doCollapse };
}
