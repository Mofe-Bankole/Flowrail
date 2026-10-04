const FAQ = [
  {
    q: "Does the whole run settle in one transaction?",
    a: "No. Moderato does not expose wallet_sendCalls, so there is no atomic batch primitive to call. We settle leg by leg and keep a receipt for each one. We would rather tell you that than imply a guarantee the chain cannot make.",
  },
  {
    q: "Can FlowRail revoke a live key?",
    a: "No, and deliberately so. Revocation runs against your root key in your own wallet. We hold no admin key, which means nobody can compel us to keep your access alive — and it also means we cannot switch it off for you.",
  },
  {
    q: "Is there a weekly spending budget?",
    a: "Not on Moderato. The deployed authorisation takes an absolute cap and an expiry, with no period argument. The cap is a lifetime total for that key, so short expiries are what keep it bounded.",
  },
  {
    q: "Can you pay someone who has never been paid before?",
    a: "Not yet. pathUSD rejected our first transfer to a brand-new address with PolicyForbids, before the access key was even consulted. A new payee has to be inside the token's transfer policy before FlowRail can pay them.",
  },
  {
    q: "What happens to a line you cannot match to a payee?",
    a: "It is held for a human and shown in the queue. It is never dropped and never paid to a guess. In the demo run there is exactly one such line, and you can see it sitting at the bottom of the table.",
  },
  {
    q: "Who holds the money between the client payment and the payout?",
    a: "Your account. Client funds land against a FlowRail virtual address carrying the run memo, so the deposit identifies which batch it funds. There is no custodial float in between.",
  },
];

export function Faq() {
  return (
    <div className="divide-y divide-border border-y border-border">
      {FAQ.map((item) => (
        <details key={item.q} className="group">
          <summary className="flex cursor-pointer list-none items-baseline justify-between gap-6 py-5 text-left transition-colors duration-[--duration-fast] ease-standard hover:text-primary">
            <span className="font-medium tracking-tight">{item.q}</span>
            <span
              className="shrink-0 text-lg leading-none text-muted-foreground transition-transform duration-[--duration-fast] ease-standard group-open:rotate-45"
              aria-hidden="true"
            >
              +
            </span>
          </summary>
          <p className="max-w-2xl pb-5 text-sm leading-relaxed text-muted-foreground">
            {item.a}
          </p>
        </details>
      ))}
    </div>
  );
}