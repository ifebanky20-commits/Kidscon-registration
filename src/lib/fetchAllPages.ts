type Page<T> =
  | { data: T[]; error: null; count: number | null }
  | { data: null; error: { code: string }; count: null };

export async function fetchAllPages<T>(
  loadPage: (from: number, to: number) => PromiseLike<Page<T>>,
  signal?: AbortSignal,
): Promise<T[]> {
  const rows: T[] = [];
  const size = 500;

  for (;;) {
    signal?.throwIfAborted();
    const { data, error, count } = await loadPage(rows.length, rows.length + size - 1);
    if (error) throw error;
    if (!data?.length) return rows;

    rows.push(...data);
    if (count === null) throw new Error("The report query did not return a row count");
    if (rows.length >= count) return rows;
  }
}
