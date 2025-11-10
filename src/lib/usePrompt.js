import { useEffect } from 'react';
import { UNSAFE_NavigationContext as NavigationContext } from 'react-router-dom';

export function usePrompt(when, message) {
  const navigator = React.useContext(NavigationContext).navigator;
  useEffect(() => {
    if (!when) return;
    const unblock = navigator.block((tx) => {
      if (window.confirm(message)) {
        unblock();
        tx.retry();
      }
    });
    return unblock;
  }, [when, message, navigator]);
}