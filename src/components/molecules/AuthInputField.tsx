import { Input } from '../atoms/Input';
import { FeatureIcon } from '../atoms/FeatureIcon';
import type { InputHTMLAttributes } from 'react';

type AuthInputIcon = 'mail' | 'lock' | 'ticket';

interface Props extends InputHTMLAttributes<HTMLInputElement> {
  icon: AuthInputIcon;
}

export function AuthInputField({ icon, ...props }: Props) {
  return (
    <label className="auth-field">
      <span>
        <FeatureIcon name={icon} size={24} />
      </span>
      <Input {...props} />
    </label>
  );
}
