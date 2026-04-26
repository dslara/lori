// SkinProvider — resolves skin assets at runtime
export interface SkinProvider {
  getSkin(key: string): unknown;
}
