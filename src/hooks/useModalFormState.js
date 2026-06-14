import { useState, useEffect, useRef } from 'react';

/**
 * Custom hook for managing modal form state.
 * Handles the common pattern of initializing form state when a modal opens
 * and resetting it when the modal closes.
 *
 * @param {boolean} expanded - Whether the modal is currently expanded
 * @param {function|object} getInitialState - Function returning initial state, or a plain object
 * @param {function} [onOpen] - Optional callback when modal opens, receives previous state
 */
export default function useModalFormState(expanded, getInitialState, onOpen) {
  const initialState = typeof getInitialState === 'function'
    ? getInitialState
    : () => getInitialState;
  const [state, setState] = useState(initialState);
  const prevExpandedRef = useRef(expanded);

  useEffect(() => {
    if (expanded && !prevExpandedRef.current) {
      // Modal just opened
      if (onOpen) {
        setState((prev) => onOpen(prev));
      } else {
        setState(typeof getInitialState === 'function' ? getInitialState() : getInitialState);
      }
    } else if (!expanded && prevExpandedRef.current) {
      // Modal just closed - reset
      setState(typeof getInitialState === 'function' ? getInitialState() : getInitialState);
    }
    prevExpandedRef.current = expanded;
  }, [expanded, getInitialState, onOpen]);

  return [state, setState];
}
