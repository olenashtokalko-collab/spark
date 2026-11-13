// The concepts were written for React 19, which takes `inert` as a boolean. The portal runs React 18, which passes the
// attribute through only as a string: '' turns it on, undefined leaves it off (her `inert={x}` became
// `inert={x ? '' : undefined}`).
import 'react';

declare module 'react' {
  interface HTMLAttributes<T> {
    inert?: '' | undefined;
  }
}
