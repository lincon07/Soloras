


export interface AutoStartProviderType {
    enable: () => Promise<void>;
    disable: () => Promise<void>;
    isEnabled: () => Promise<boolean>;
}