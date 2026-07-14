import { Button } from '../atoms/Button';

interface Props {
  onClick: () => void;
}

export function AdminDeleteButton({ onClick }: Props) {
  return (
    <Button type="button" variant="ghost" onClick={onClick}>
      Löschen
    </Button>
  );
}
