export type TileStatus = "available" | "occupied" | "repair" | "pending";

export const tileStatusLabel: Record<TileStatus, string> = {
  available: "Kosong",
  occupied: "Terisi",
  repair: "Perbaikan",
  pending: "Menunggu",
};

/** Ubin kecil sebagai penanda status; motifnya sama dengan ubin kamar di landing. */
export function StatusSwatch({ status }: { status: TileStatus }) {
  return <span aria-hidden className={`tile tile-sm tile-${status}`} />;
}

export function StatusLegend({ counts }: { counts?: Partial<Record<TileStatus, number>> }) {
  return (
    <ul className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-gray-600">
      {(Object.keys(tileStatusLabel) as TileStatus[]).map((status) => (
        <li key={status} className="flex items-center gap-2">
          <StatusSwatch status={status} />
          <span>
            {tileStatusLabel[status]}
            {counts?.[status] !== undefined && (
              <span className="ml-1.5 font-mono font-semibold text-gray-900">{counts[status]}</span>
            )}
          </span>
        </li>
      ))}
    </ul>
  );
}
