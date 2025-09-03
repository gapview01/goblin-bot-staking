const locks = new Set<string>();

export async function withMemoLock<T>(memo: string, fn: () => Promise<T>): Promise<T> {
  if (locks.has(memo)) {
    throw new Error('duplicate memo');
  }
  locks.add(memo);
  try {
    return await fn();
  } finally {
    locks.delete(memo);
  }
}
