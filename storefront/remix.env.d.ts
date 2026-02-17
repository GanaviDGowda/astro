/// <reference types="@remix-run/dev" />
/// <reference types="@cloudflare/workers-types" />

declare module '*.css?url' {
  const href: string;
  export default href;
}
