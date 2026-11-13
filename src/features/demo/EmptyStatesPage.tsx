// Every empty state the client can meet, on one page (13 Nov, review): while some sections aren't open yet, the client
// can't walk the portal to find them, so each is shown here as it is in the portal (the same components, the same
// pictures and words), with where it appears and when. #/empty-states, linked beside Hide switches. Only the states
// with a 3D picture are here (13 Nov, review: the page is for showing the client the pictures), so the flat search and
// files drawings, and the not-found pages (no picture), are left out.
import type { ReactNode } from 'react';
import { EmptyState } from '../../components/ui/primitives';
import { BrandArt, LatestArtView, PageArtView, useArt } from '../onboarding/EmptyArt';
import { ReportToCome, RequestReport } from '../onboarding/Onboarding';
import { HomeSwitch } from './HomeBentoDemo';
import '../../styles/empty-states.css';

type Item = { where: string; when: string; wide?: boolean; view: ReactNode };

function Group({ title, items }: { title: string; items: Item[] }) {
  return (
    <section className="es-group" aria-label={title}>
      <h2 className="es-group__title">{title}</h2>
      <div className="es-grid">
        {items.map((it) => (
          <article key={it.where + it.when} className={it.wide ? 'es-card es-card--wide' : 'es-card'}>
            <div className="es-stage">{it.view}</div>
            <div className="es-card__about">
              <span className="es-card__where">{it.where}</span>
              <span className="es-card__when">{it.when}</span>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

export function EmptyStatesPage() {
  const art = useArt();
  const home: Item[] = [
    {
      where: 'Home · Reports',
      when: 'A new company, before its first report.',
      view: (
        <section className="og-later__card">
          <span className="og-eyebrow">Reports</span>
          <span className="og-later__art">
            <BrandArt v={art.ba} />
          </span>
          <b>No reports yet</b>
          <span>Ask Spark to look into your website, social media or a competitor.</span>
          <span className="og-later__go">
            <RequestReport />
          </span>
        </section>
      ),
    },
    {
      where: 'Home · Latest from Spark',
      when: 'Before Spark has shared any file, reply or update.',
      view: (
        <section className="og-later__card">
          <span className="og-eyebrow">Latest from Spark</span>
          <span className="og-later__art">
            <LatestArtView v={art.latest} />
          </span>
          <b>Nothing yet, and that’s fine</b>
          <span>Files, replies and updates from Spark will land here, and Sparki will mark the new ones.</span>
        </section>
      ),
    },
    {
      where: 'Home · Website report tab',
      when: 'The website report hasn’t been made yet.',
      view: <ReportToCome kind="website" />,
    },
    {
      where: 'Home · Social media report tab',
      when: 'The social media report hasn’t been made yet.',
      view: <ReportToCome kind="social" />,
    },
  ];
  const requests: Item[] = [
    {
      where: 'Requests',
      when: 'No requests sent yet.',
      view: (
        <div className="rq-tbl rq-tbl--empty">
          <EmptyState art={<PageArtView v={art.requests} />} title="No requests yet." body="Start a chat about your brand and turn a useful answer into a request." />
        </div>
      ),
    },
    {
      where: 'Requests · Needs you',
      when: 'Nothing waits for the client’s decision.',
      view: (
        <div className="rq-tbl rq-tbl--empty">
          <EmptyState art={<PageArtView v={art.requests} />} title="Nothing needs you." body="Start a chat about your brand and turn a useful answer into a request." />
        </div>
      ),
    },
  ];
  const side: Item[] = [
    {
      where: 'Ask Dr.AI · chat history',
      when: 'No chats with Dr.AI yet.',
      view: (
        <div className="history history--sidebar es-narrow">
          <div className="history__list">
            <div className="history__empty">
              <PageArtView v={art.chats} small />
              No chats yet. Start one above.
            </div>
          </div>
        </div>
      ),
    },
    {
      where: 'Notifications',
      when: 'Every notification has been read.',
      view: (
        <div className="es-narrow es-notifs">
          <div className="notifs__empty">
            <PageArtView v={art.notifs} small />
            You're all caught up.
          </div>
        </div>
      ),
    },
  ];
  return (
    <div className="es-page">
      <header className="es-head">
        <span className="es-head__eyebrow">Spark client portal</span>
        <h1 className="es-head__title">Empty states.</h1>
        <p className="es-head__sub">What each part of the portal shows before there’s anything in it, with the same pictures and words as in the portal.</p>
      </header>
      <Group title="Home" items={home} />
      <Group title="Requests" items={requests} />
      <Group title="Dr.AI and notifications" items={side} />
      {/* the version switch here too, Empty states picked, so the way back to Home is the same (13 Nov, review) */}
      <HomeSwitch current="empty" />
    </div>
  );
}
