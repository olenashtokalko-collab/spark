// Prototype-only page (#/demo/home-requests?v=…): Home with the requests moved from the side column into a
// dashboard above "Where we think you have issues". The page is the real Home otherwise; only the requests
// change. "Alert" is what Home shows; the others are kept for comparison.
import { useRoute, navigate } from '../../lib/router';
import { analyses as seedAnalyses } from '../../data/mock';
import { PageHeader, cx } from '../../components/ui/primitives';
import { MainSide, useModel, type BannerArt, type ReqsLook } from '../home/HomeLayouts';

const VARIANTS: { v: ReqsLook; label: string; note: string }[] = [
  { v: 'side', label: 'Side card', note: 'The requests in a card on the right, with two tabs (Home before the banner).' },
  { v: 'status', label: 'Status rows', note: 'One block, “Your requests”, a row per stage: how many, what they are, and where to go. Need your decision (tinted, Review), in progress with Spark (with the next step), waiting for Spark to pick up (only when there are some), delivered.' },
  { v: 'alert', label: 'Alert · on Home', note: 'A banner (as on Home): how many requests have a new proposal, what else waits for your feedback, a proposal sheet, and Go to requests, which opens Requests on “Needs you”. It can be closed; nothing shows when nothing waits.' },
  { v: 'figures', label: 'A · Figures', note: 'Three counts as tiles: what needs your decision (with the first date), what’s in progress (with Spark’s next step), what’s delivered. The first tile opens the list under it. The quietest option; the detail is one click away.' },
  { v: 'cards', label: 'B · Decision cards', note: 'One light orange card per decision, side by side, each with what to do, by when and its action. What’s in progress follows as one line. Puts the decisions first and in full view.' },
  { v: 'board', label: 'C · Board', note: 'Two columns side by side: needs your decision (light orange rows) and in progress (white rows with Spark’s next step). Everything open at a glance, as on the side card, but wider.' },
  { v: 'table', label: 'D · Table', note: 'Every open request in one table: what happens next, by when, and who has it. The ones that need you are tinted and come first. The densest option, closest to the Requests page.' },
  { v: 'banner', label: 'E · Banner', note: 'One light orange strip: how many requests need your decision, which ones, and the first date. It opens the list; what’s in progress is one line under it. The lightest on the page.' },
];

// The banner's picture, in the brand book's language (pp. 35, 37).
const ARTS: { a: BannerArt; label: string; note: string }[] = [
  { a: 'none', label: 'No icon (on Home)', note: 'Text and Go to requests only, no picture: the banner as it is on Home.' },
  { a: 'sheet', label: 'Sheet', note: 'A proposal sheet drawn in lines, cut by the banner’s foot, after the client’s reference.' },
  { a: 'glass', label: 'Glass tile', note: 'The brand’s icon recipe (p. 35): a frosted glass squircle with the Cobalt-to-Ember spectrum inside and a white document glyph on top, a soft glow under it. Same family as the empty state of the analysis.' },
  { a: 'count', label: 'Glass count', note: 'The same glass tile, with the number of proposals in white instead of a glyph: the figure is the message.' },
  { a: 'ink', label: 'Ink spark', note: '“Ink objects carry the spark” (p. 37): an Ink squircle with the Ember spark. Quiet, no glow; the strongest contrast on the pale banner.' },
  { a: 'stack', label: 'Frosted stack', note: '“Frosted light” (p. 33): two frosted sheets on the spectrum glow, the front one with a Cobalt title line. A proposal, drawn as the brand’s material.' },
  { a: 'spark', label: 'Mascot', note: 'The mascot (for now the app icon’s spark) at the start, as on New chat: Spark tells you there’s something to decide.' },
];

export function HomeRequestsDemo() {
  const { query } = useRoute();
  const v: ReqsLook = VARIANTS.some((x) => x.v === query.get('v')) ? (query.get('v') as ReqsLook) : 'alert';
  const cur = VARIANTS.find((x) => x.v === v)!;
  const art: BannerArt = ARTS.some((x) => x.a === query.get('art')) ? (query.get('art') as BannerArt) : 'none';
  const curArt = ARTS.find((x) => x.a === art)!;
  const m = useModel(seedAnalyses);
  return (
    <div className="cdemo">
      <PageHeader title="Home · requests on the page" sub="The requests leave the side column and sit above “Where we think you have issues”. Prototype only: this page isn’t in the portal’s navigation." />
      <div className="fdm-switch">
        {VARIANTS.map((x) => (
          <button key={x.v} className={cx(v === x.v && 'is-on')} onClick={() => navigate(`/demo/home-requests?v=${x.v}`, { replace: true })}>
            {x.label}
          </button>
        ))}
      </div>
      <p className="fdm-about">{cur.note}</p>
      {v === 'alert' && (
        <>
          <div className="fdm-switch hd-looks">
            <span className="faint">Icon</span>
            {ARTS.map((x) => (
              <button key={x.a} className={cx(art === x.a && 'is-on')} onClick={() => navigate(`/demo/home-requests?v=alert&art=${x.a}`, { replace: true })}>
                {x.label}
              </button>
            ))}
          </div>
          <p className="fdm-about">{curArt.note}</p>
        </>
      )}
      <div className="hd-frame hl-frame">
        <MainSide m={m} reqs={v} bannerArt={art} />
      </div>
    </div>
  );
}
