import { DashboardTemplate } from '../components/templates/DashboardTemplate';
import { NewFeedbackForm } from '../components/organisms/NewFeedbackForm';
import { PAGE_HEADERS } from '../content/pageHeaders';

export function FeedbackPage() {
  return (
    <DashboardTemplate pageTitle={PAGE_HEADERS.feedback.title} pageSubtitle={PAGE_HEADERS.feedback.subtitle}>
      <section>
        <NewFeedbackForm />
      </section>
    </DashboardTemplate>
  );
}
