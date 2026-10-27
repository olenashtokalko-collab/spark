// Spark's mascot, the one face of Spark AI in the portal: the chat's answers, the box, the drawer and Ask
// Spark on Home. A stand-in until Spark shares the art: the spark from the app icon, lit from inside (brand
// book p. 28), in a round frame. `working` makes its light breathe while Spark answers.
import { cx } from './primitives';

export function Mascot({ size = 32, working, className }: { size?: number; working?: boolean; className?: string }) {
  return (
    <span className={cx('mascot', working && 'mascot--working', className)} style={{ width: size, height: size }} aria-hidden>
      <img src="/brand/spark-app-icon.jpg" alt="" />
    </span>
  );
}
