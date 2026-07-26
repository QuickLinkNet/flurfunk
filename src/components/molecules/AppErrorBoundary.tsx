import { Component, type ErrorInfo, type ReactNode } from 'react';
import { Button } from '../atoms/Button';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
}

export class AppErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('App render failed', error, info);
  }

  render() {
    if (!this.state.hasError) return this.props.children;

    return (
      <main className="app-error-boundary">
        <section>
          <h1>Flurfunk konnte diese Ansicht nicht öffnen.</h1>
          <p>Bitte lade die App neu. Wenn es wieder passiert, ist der Fehler in der Konsole sichtbar.</p>
          <Button type="button" onClick={() => window.location.reload()}>
            Neu laden
          </Button>
        </section>
      </main>
    );
  }
}
