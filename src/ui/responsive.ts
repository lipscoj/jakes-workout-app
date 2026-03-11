import { useWindowDimensions } from 'react-native';

export function useResponsiveLayout() {
  const { width } = useWindowDimensions();

  return {
    width,
    isTablet: width >= 768,
    isDesktop: width >= 1100,
    isWideDesktop: width >= 1440,
  };
}
