import { useState, useEffect, useRef } from 'react';

interface PopoverManagerReturn {
  activePopover: string | null;
  containerRef: React.RefObject<HTMLDivElement>;
  handlePopoverToggle: (id: string, shouldShow: boolean) => void;
}

export const usePopoverManager = (): PopoverManagerReturn => {
  const [activePopover, setActivePopover] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current && 
        !containerRef.current.contains(event.target as Node)
      ) {
        setActivePopover(null);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, []);

  const handlePopoverToggle = (id: string, shouldShow: boolean): void => {
    setActivePopover(shouldShow ? id : null);
  };

  return {
    activePopover,
    containerRef,
    handlePopoverToggle
  };
};