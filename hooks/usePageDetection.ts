import { useState, useCallback } from 'react';
import { detectSection, GHLSection, BUILDER_SECTIONS } from '../constants/sections';

export function usePageDetection() {
  const [currentUrl, setCurrentUrl] = useState('https://app.gohighlevel.com');
  const [currentSection, setCurrentSection] = useState<GHLSection>('dashboard');
  const [isBuilderSection, setIsBuilderSection] = useState(false);

  const handleUrlChange = useCallback((url: string) => {
    setCurrentUrl(url);
    const section = detectSection(url);
    setCurrentSection(section);
    setIsBuilderSection(BUILDER_SECTIONS.includes(section));
  }, []);

  return { currentUrl, currentSection, isBuilderSection, handleUrlChange };
}
