# Hearth — Roadmap

A short-list of items deferred from the current product. None of these block today's flow.

## Notifications v2

In-app dismissible banners ship in v1 (computed from on-chain Hearth state and persisted via `localStorage["hearth_notifications_dismissed"]`). They surface conditions like "Season X is underway, your tending is pending" and "Your Hearth is ready to release warmth".

**Deferred for v2:**

- **Email notifications.** Likely needs a small backend service that:
  - Watches Stellar RPC's `getEvents` for `member_joined`, `contributed`, `released`.
  - Maps event addresses → user accounts via opt-in email subscription.
  - Sends transactional email (Resend / Postmark / SES) for the events the user has subscribed to.
  - Honors per-event-type opt-out preferences.
- **Web push notifications.** Service worker + VAPID; can piggyback on the same backend that drives email so a single subscription record covers both channels.
- **SMS / Viber.** Filipino kin and parents lean on these heavily; worth scoping after email is stable. Twilio for SMS, Viber Bot API for Viber.

## Streaming Keeper → Kin contract

Today's deployed Soroban contract is a multi-member rotating-savings paluwagan. The product copy and dashboards lean toward a one-Keeper-to-one-Kin streaming framing, but several spec'd features can't be honest without contract changes:

- `kindle_hearth(keeper, kin, token, total_amount, period_days, daily_cap)`
- `claim` / `withdraw` separation
- `pause` / `resume`
- `top_up`
- `cancel` (refund unreleased back to Keeper, keep released balance with Kin)
- Event set: `kindled`, `claimed`, `withdrawn`, `paused`, `resumed`, `topped_up`, `cancelled`

**When this lands:**

- Likely a single registry contract holding `Map<HearthId, HearthState>` rather than per-Hearth deploys (cheaper, simpler discovery).
- New `.env.VITE_CONTRACT_ID` for the new deploy.
- Frontend reads switch from `get_group_state` (singleton) to `get_hearth(id)` (registry).
- Existing rotating-savings contract stays addressable for any Hearth that was kindled against it.

## Smaller polish backlog

- Skeleton loaders on every async section (Dashboard cards, GroupDetail balance, Tending History).
- Friendly empty state with ember illustration when wallet has no Hearths.
- Replace remaining bare error strings with a `useToast` for non-receipt errors (RPC outages, signing rejections).
- Code-split the bundle (currently 1.35 MB) via dynamic `import()` for stellar-sdk and framer-motion.
- Replace the `SorobanService.buildContributeTransaction` dead code path or wire it to the actual `contribute` flow once the streaming model is decided.
