import { useEffect } from "react";

interface KeyboardNavigationOptions {
  fullViewer?: {
    isOpen: boolean;
    navigateMedia: (direction: "prev" | "next") => void;
    closeViewer: () => void;
  };
  dropdowns?: {
    showQuickSendDropdown?: boolean;
    showLocationDropdown?: boolean;
    showSubLocationDropdown?: boolean;
    showSchemesDropdown?: boolean;
    closeDropdowns: () => void;
  };
  modals?: {
    openPropertyModal?: boolean;
    closePropertyModal: () => void;
  };
}

export const useKeyboardNavigation = (options: KeyboardNavigationOptions) => {
  // Handle full viewer keyboard navigation
  useEffect(() => {
    if (!options.fullViewer) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (!options.fullViewer?.isOpen) return;

      if (e.key === "ArrowLeft") {
        e.preventDefault();
        options.fullViewer.navigateMedia("prev");
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        options.fullViewer.navigateMedia("next");
      } else if (e.key === "Escape") {
        e.preventDefault();
        options.fullViewer.closeViewer();
      }
    };

    if (options.fullViewer.isOpen) {
      document.addEventListener("keydown", handleKeyDown);
      return () => document.removeEventListener("keydown", handleKeyDown);
    }
  }, [options.fullViewer?.isOpen]);

  // Handle dropdown keyboard navigation
  useEffect(() => {
    if (!options.dropdowns) return;

    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      const { 
        showSubLocationDropdown, 
        showSchemesDropdown, 
        closeDropdowns 
      } = options.dropdowns!;

      if ((showSubLocationDropdown || showSchemesDropdown) && 
          (e.key === "Tab" || e.key === "Escape")) {
        if (e.key === "Tab") {
          e.preventDefault();
        }
        closeDropdowns();
      }
    };

    document.addEventListener("keydown", handleGlobalKeyDown);
    return () => document.removeEventListener("keydown", handleGlobalKeyDown);
  }, [
    options.dropdowns?.showSubLocationDropdown, 
    options.dropdowns?.showSchemesDropdown
  ]);

  // Handle modal keyboard navigation
  useEffect(() => {
    if (!options.modals) return;

    const handleEscKey = (event: KeyboardEvent) => {
      if (event.key === "Escape" && options.modals?.openPropertyModal) {
        options.modals.closePropertyModal();
      }
    };

    document.addEventListener("keydown", handleEscKey);
    return () => document.removeEventListener("keydown", handleEscKey);
  }, [options.modals?.openPropertyModal]);
};