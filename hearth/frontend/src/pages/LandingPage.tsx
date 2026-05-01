import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import ConnectWalletButton from "../components/wallet/ConnectWalletButton";
import SectionReveal from "../components/ui/SectionReveal";

const LandingPage = () => {
  return (
    <div className="overflow-hidden bg-cream selection:bg-ember/25">
      <section className="hero-gradient mesh-shimmer relative min-h-screen overflow-hidden px-6 pb-16 pt-0 text-wood md:px-8">
        <div className="absolute inset-0 opacity-60">
          <div className="blob blob-cyan absolute left-8 top-24" />
          <div className="blob blob-violet absolute right-10 top-1/3" />
          <div className="blob blob-gold absolute bottom-8 left-8" />
          <div className="blob blob-cyan-soft absolute bottom-0 right-0" />
        </div>

        <header className="relative z-10 mx-auto flex h-24 w-full max-w-7xl items-center justify-between">
          <Link to="/" className="flex items-center gap-3">
            <img src="/Hearth_LogoPure.png" alt="Hearth logo" className="h-9 w-9 rounded-lg object-cover" />
            <span className="font-display text-2xl font-bold tracking-tight text-wood">Hearth</span>
          </Link>
          <nav className="hidden items-center gap-8 text-sm md:flex">
            <a href="#how-it-works" className="soft-nav-link">How it works</a>
            <a href="#features" className="soft-nav-link">Why Hearth</a>
            <a href="#rotation" className="soft-nav-link">The rotation</a>
          </nav>
          <ConnectWalletButton />
        </header>

        <div className="relative z-10 mx-auto flex min-h-[calc(100vh-6rem)] w-full max-w-4xl flex-col items-center justify-center gap-8 py-10 text-center">
          <div className="glass-soft inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-ember-deep">
            <span className="material-symbols-outlined text-base">local_fire_department</span>Built on Stellar
          </div>
          <motion.h1 initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }} className="font-display text-[56px] font-bold leading-[1.05] md:text-[76px]">
            Keep the fire going,
            <br />
            <span className="bg-gradient-to-r from-ember-deep to-ember bg-clip-text text-transparent">from anywhere.</span>
          </motion.h1>
          <motion.p initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.2 }} className="max-w-2xl text-[18px] leading-relaxed text-wood-soft">
            Hearth is a steady, on-chain way to support the people who matter &mdash; your kids, your parents, anyone who depends on you. Set it once. They&rsquo;re taken care of.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="hero-warmth-pill"
            aria-hidden="true"
          >
            <div className="hero-warmth-icon hero-warmth-icon--keeper">
              <span className="material-symbols-outlined">local_fire_department</span>
            </div>
            <div className="hero-warmth-track">
              <svg viewBox="0 0 220 24" className="hero-warmth-svg" fill="none">
                <defs>
                  <filter id="hero-warmth-glow" x="-100%" y="-100%" width="300%" height="300%">
                    <feGaussianBlur in="SourceGraphic" stdDeviation="1.4" result="b" />
                    <feMerge>
                      <feMergeNode in="b" />
                      <feMergeNode in="SourceGraphic" />
                    </feMerge>
                  </filter>
                </defs>
                <path
                  id="hero-warmth-path"
                  d="M 4 12 L 216 12"
                  stroke="#E8743C"
                  strokeOpacity="0.32"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />
                <g className="hero-warmth-dots">
                  {[0, 1, 2].map((i) => (
                    <circle key={i} r="3" fill="#E8743C" filter="url(#hero-warmth-glow)" opacity="0">
                      <animateMotion dur="3s" begin={`${i}s`} repeatCount="indefinite">
                        <mpath href="#hero-warmth-path" />
                      </animateMotion>
                      <animate
                        attributeName="opacity"
                        values="0;1;1;0"
                        keyTimes="0;0.12;0.88;1"
                        dur="3s"
                        begin={`${i}s`}
                        repeatCount="indefinite"
                      />
                    </circle>
                  ))}
                </g>
              </svg>
            </div>
            <div className="hero-warmth-icon hero-warmth-icon--kin">
              <span className="material-symbols-outlined">favorite</span>
            </div>
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.4 }} className="flex flex-wrap justify-center gap-4">
            <Link to="/auth?mode=sign-up&redirect=/create" className="primary-button">Kindle your Hearth</Link>
            <a href="#how-it-works" className="secondary-button">See how it works</a>
          </motion.div>
        </div>
      </section>

      <section id="how-it-works" className="bg-amber-soft/40 px-6 py-24 text-wood md:px-8">
        <div className="mx-auto max-w-7xl">
          <SectionReveal className="mx-auto max-w-3xl text-center" variant="scale">
            <h2 className="section-title text-[48px]">Three steps. One steady fire.</h2>
          </SectionReveal>
          <div className="mt-14 grid gap-5 md:grid-cols-3">
            {[
              ["Kindle a Hearth", "Choose who, how much, how often.", "🔥"],
              ["Fund it once", "Your support is locked in and protected.", "🪵"],
              ["They feel the warmth", "Steady payouts, on schedule, on Stellar.", "✨"]
            ].map((card, index) => (
              <SectionReveal key={card[0]} variant={index % 2 === 0 ? "left" : "right"} stagger={(index + 1) as 1 | 2 | 3} className="surface-card interactive-card border-l-4 border-l-ember p-6">
                <div className="flex items-start gap-4">
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-amber-soft/60 text-3xl">{card[2]}</div>
                  <div>
                    <p className="text-sm font-semibold text-ember-deep">0{index + 1}</p>
                    <h3 className="mt-1 text-[24px] font-semibold">{card[0]}</h3>
                    <p className="mt-3 text-[16px] leading-relaxed text-wood-soft">{card[1]}</p>
                  </div>
                </div>
              </SectionReveal>
            ))}
          </div>
        </div>
      </section>

      <section id="features" className="bg-cream-deep px-6 py-24 text-wood md:px-8">
        <div className="mx-auto max-w-7xl space-y-8">
          <SectionReveal className="max-w-3xl" variant="base"><h2 className="section-title text-[48px]">Why families pick Hearth.</h2></SectionReveal>
          {[
            ["Freighter wallet", "Connect once. No new account, no learning curve."],
            ["Auto-warmth", "Stellar releases the support on schedule. No reminders, no chasing."],
            ["USDC stable", "No crypto whiplash. The amount you set is the amount they get."],
            ["Transparent", "Every transaction is on Stellar. Anyone in the family can verify."],
            ["Built for circles", "Share with your family. Add by wallet. Start tending together."]
          ].map((item, index) => (
              <SectionReveal key={item[0]} variant="base" stagger={((index % 5) + 1) as 1 | 2 | 3 | 4 | 5} className="surface-card interactive-card flex items-start gap-4 p-5">
              <span className="material-symbols-outlined mt-1 text-3xl text-ember">favorite</span>
              <div>
                <h3 className="text-[24px] font-semibold">{item[0]}</h3>
                <p className="mt-2 text-[16px] text-wood-soft">{item[1]}</p>
              </div>
            </SectionReveal>
          ))}
        </div>
      </section>

      <section id="rotation" className="relative overflow-hidden bg-cream px-6 py-24 text-wood md:px-8">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(232,116,60,0.06),transparent_58%)]" />
        <div className="mx-auto max-w-7xl text-center">
          <SectionReveal variant="scale" className="mx-auto max-w-3xl">
            <h2 className="section-title text-[48px] text-wood">Steady support, on a steady schedule.</h2>
            <p className="mt-4 text-[18px] text-wood-soft">Each period, warmth flows from Keeper to Kin &mdash; automatically, on Stellar.</p>
          </SectionReveal>
          <div className="mx-auto mt-12 grid max-w-5xl gap-10 rounded-[28px] border border-amber/40 bg-[linear-gradient(140deg,#5B3D2D_0%,#7A4F38_55%,#A6643F_100%)] p-8 text-cream shadow-[0_34px_100px_rgba(58,36,24,0.32)] backdrop-blur-2xl lg:grid-cols-2 lg:items-center lg:gap-12">
            <div className="flex flex-col items-center gap-6">
              <div className="flex w-full max-w-[420px] items-center justify-between gap-3">
                <div className="flex flex-col items-center gap-2">
                  <div className="warmth-avatar warmth-avatar--keeper">M</div>
                  <p className="text-[11px] uppercase tracking-[0.18em] text-amber-soft">Keeper</p>
                </div>

                <div className="relative h-16 flex-1">
                  <svg
                    aria-hidden="true"
                    className="absolute inset-0 h-full w-full overflow-visible"
                    viewBox="0 0 260 64"
                    fill="none"
                  >
                    <defs>
                      <filter id="warmth-glow" x="-100%" y="-100%" width="300%" height="300%">
                        <feGaussianBlur in="SourceGraphic" stdDeviation="1.4" result="b" />
                        <feMerge>
                          <feMergeNode in="b" />
                          <feMergeNode in="SourceGraphic" />
                        </feMerge>
                      </filter>
                    </defs>
                    <path
                      id="warmth-path"
                      d="M 8 32 Q 130 -8, 252 32"
                      stroke="#FFC97A"
                      strokeOpacity="0.3"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                    />
                    <g className="warmth-dots">
                      {[0, 1, 2].map((i) => (
                        <circle key={i} r="3" fill="#FFC97A" filter="url(#warmth-glow)" opacity="0">
                          <animateMotion dur="3s" begin={`${i}s`} repeatCount="indefinite">
                            <mpath href="#warmth-path" />
                          </animateMotion>
                          <animate
                            attributeName="opacity"
                            values="0;1;1;0"
                            keyTimes="0;0.12;0.88;1"
                            dur="3s"
                            begin={`${i}s`}
                            repeatCount="indefinite"
                          />
                        </circle>
                      ))}
                    </g>
                    <circle className="warmth-static-dot" cx="130" cy="12" r="3" fill="#FFC97A" filter="url(#warmth-glow)" />
                  </svg>
                </div>

                <div className="flex flex-col items-center gap-2">
                  <div className="warmth-avatar warmth-avatar--kin">L</div>
                  <p className="text-[11px] uppercase tracking-[0.18em] text-amber-soft">Kin</p>
                </div>
              </div>
              <p className="text-center text-sm text-amber-soft">
                Maria sends &#8369;2,000 every Monday &rarr; Lola receives, automatically
              </p>
            </div>

            <div className="text-left">
              <p className="text-[13px] uppercase tracking-[0.2em] text-amber">How it flows</p>
              <h3 className="mt-3 font-display text-[28px] font-semibold text-cream md:text-[32px]">One Keeper. One Kin. Steady warmth.</h3>
              <p className="mt-4 text-cream/85">No middlemen, no missed transfers, no reminders to send. Hearth releases support on the schedule you set &mdash; and the contract handles every release on Stellar.</p>
              <Link to="/auth?mode=sign-up&redirect=/create" className="primary-button mt-6 inline-flex">Kindle your Hearth</Link>
            </div>
          </div>
        </div>
      </section>

      <section className="hero-gradient relative overflow-hidden px-6 py-24 text-wood md:px-8">
        <div className="blob blob-gold absolute bottom-0 right-0 opacity-70" />
        <div className="blob blob-violet absolute left-0 top-0 opacity-50" />
        <div className="mx-auto max-w-7xl text-center">
          <SectionReveal variant="scale" className="mx-auto max-w-3xl">
            <h2 className="section-title text-[56px]">Ready to keep the fire going?</h2>
            <p className="mt-4 text-[18px] text-wood-soft">Connect your Freighter wallet and kindle your first Hearth in two minutes.</p>
          </SectionReveal>
          <SectionReveal variant="scale" stagger={3} className="mt-8"><Link to="/auth?mode=sign-up&redirect=/create" className="primary-button inline-flex text-lg">Kindle your Hearth</Link></SectionReveal>
        </div>
      </section>

      <footer className="bg-wood px-6 py-16 text-cream md:px-8">
        <div className="mx-auto grid max-w-7xl gap-10 md:grid-cols-4">
          <div>
            <div className="flex items-center gap-3">
              <img src="/Hearth_LogoPure.png" alt="Hearth logo" className="h-10 w-10 rounded-lg object-cover" />
              <div className="font-display text-2xl font-bold text-cream">Hearth</div>
            </div>
            <p className="mt-4 text-sm text-cream/75">Keep the fire going, from anywhere.</p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.18em] text-amber-soft">Product</p>
            <ul className="mt-4 space-y-3 text-sm text-cream/75">
              <li><Link className="hover:text-amber" to="/create">Kindle a Hearth</Link></li>
              <li><Link className="hover:text-amber" to="/profile">Profile</Link></li>
            </ul>
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.18em] text-amber-soft">Learn</p>
            <ul className="mt-4 space-y-3 text-sm text-cream/75">
              <li><a className="hover:text-amber" href="#how-it-works">How it works</a></li>
              <li><a className="hover:text-amber" href="#features">Why Hearth</a></li>
              <li><a className="hover:text-amber" href="#rotation">The rotation</a></li>
            </ul>
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.18em] text-amber-soft">About</p>
            <p className="mt-4 text-sm text-cream/75">Built on Stellar. Secured by Soroban. Made with care.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
