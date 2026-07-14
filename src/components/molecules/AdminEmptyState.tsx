interface Props {
  children: string;
}

export function AdminEmptyState({ children }: Props) {
  return (
    <p className="admin-empty-state">
      {children}
    </p>
  );
}
