// Prototype-only page (#/demo/empty-art): still pictures for the empty Brand Analysis and Latest from Spark cards
// (6 Nov). Pick one of each; Home and Brand Analysis use the pick (kept in this browser).
import { PageHeader, cx } from '../../components/ui/primitives';
import { SparkiStill } from '../../components/ui/DrAi';
import { BA_ARTS, BrandArt, LATEST_ARTS, LatestArtView, setArt, useArt } from '../onboarding/EmptyArt';

export function EmptyArtDemo() {
  const art = useArt();
  return (
    <div className="cdemo">
      <PageHeader
        title="Empty cards · pictures"
        sub="Still pictures, no motion. Pick one for Brand Analysis and one for Latest from Spark; Home and Brand Analysis show the pick. Prototype only."
      />
      <h3 className="ead-h">Brand Analysis · no reports yet</h3>
      <div className="ead-grid">
        {BA_ARTS.map((x) => (
          <button key={x.v} type="button" className={cx('og-later__card ead-tile', art.ba === x.v && 'is-on')} onClick={() => setArt('ba', x.v)}>
            <span className="og-eyebrow">{x.label}</span>
            <span className="og-later__art">
              <BrandArt v={x.v} />
            </span>
            <b>No reports yet</b>
            <span>Ask Spark to look into your website, social media or a competitor.</span>
            <span className="ead-pick">{art.ba === x.v ? 'On Home' : 'Use this'}</span>
          </button>
        ))}
      </div>
      <h3 className="ead-h">Latest from Spark · nothing yet</h3>
      <div className="ead-grid">
        {LATEST_ARTS.map((x) => (
          <button key={x.v} type="button" className={cx('og-later__card ead-tile', art.latest === x.v && 'is-on')} onClick={() => setArt('latest', x.v)}>
            <span className="og-eyebrow">{x.label}</span>
            <span className="og-later__art">
              <LatestArtView v={x.v} sparki={<SparkiStill size={56} />} />
            </span>
            <b>Nothing yet, and that’s fine</b>
            <span>Files, replies and updates from Spark will land here.</span>
            <span className="ead-pick">{art.latest === x.v ? 'On Home' : 'Use this'}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
