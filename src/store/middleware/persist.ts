// Persist middleware — saves actions/state to SQLite
export function persistMiddleware(store: unknown) {
  return (next: unknown) => (action: unknown) => {
    // TODO: implement persistence
    return (next as (a: unknown) => unknown)(action);
  };
}
