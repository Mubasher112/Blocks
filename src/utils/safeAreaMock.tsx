export const SafeAreaProvider = ({ children }: any) => <>{children}</>;
export const SafeAreaView = ({ children, style }: any) => <div style={style}>{children}</div>;
export const useSafeAreaInsets = () => ({ top: 0, right: 0, bottom: 0, left: 0 });
