import { useState, useRef } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import ConnectWalletButton from "../components/wallet/ConnectWalletButton";
import SectionReveal from "../components/ui/SectionReveal";
import { useCountUp } from "../hooks/useCountUp";
import { useInViewAnimation } from "../hooks/useInViewAnimation";

const LandingPage = () => {
  const statsRef = useRef<HTMLDivElement>(null);
  const statsVisible = useInViewAnimation(statsRef);
  const memberCount = useCountUp(2847, statsVisible);
  const pooledCount = useCountUp(14200000, statsVisible);
  const [rotationStep, setRotationStep] = useState(0);
  const avatars = ["M", "J", "N", "A", "S", "K"];

  return (
    <div className="overflow-hidden bg-[#f8f5ff] selection:bg-purple-400/30">
      <section className="hero-gradient mesh-shimmer relative min-h-screen overflow-hidden px-6 pb-16 pt-0 text-slate-900 md:px-8">
        <div className="absolute inset-0 opacity-50">
          <div className="blob blob-cyan absolute left-8 top-24" />
          <div className="blob blob-violet absolute right-10 top-1/3" />
          <div className="blob blob-gold absolute bottom-8 left-8" />
          <div className="blob blob-cyan-soft absolute bottom-0 right-0" />
        </div>

        <header className="relative z-10 mx-auto flex h-24 w-full max-w-7xl items-center justify-between">
          <Link to="/" className="font-display text-2xl font-extrabold tracking-tight text-[#5b21b6]">PaluwagaChain</Link>
          <nav className="hidden items-center gap-8 text-sm md:flex">
            <a href="#how-it-works" className="soft-nav-link">How it works</a>
            <a href="#stats" className="soft-nav-link">Stats</a>
            <a href="#features" className="soft-nav-link">Features</a>
          </nav>
          <ConnectWalletButton />
        </header>

        <div className="relative z-10 mx-auto grid min-h-[calc(100vh-6rem)] w-full max-w-7xl grid-cols-1 items-center gap-12 py-10 lg:grid-cols-[1.05fr_0.95fr]">
          <div className="max-w-3xl space-y-8">
            <div className="glass-soft inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-[#6d28d9]">
              <span className="material-symbols-outlined text-base">stars</span>Built on Stellar
            </div>
            <motion.h1 initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }} className="font-display text-[56px] font-extrabold leading-[1.05] md:text-[72px]">
              Your Paluwagan.
              <br />
              <span className="bg-gradient-to-r from-[#00C6FF] to-[#6C3FC7] bg-clip-text text-transparent">Now Trustless.</span>
            </motion.h1>
            <motion.p initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.2 }} className="max-w-2xl text-[18px] leading-relaxed text-slate-600">
              Pool funds with your group. Smart contracts hold the money. No one can run away.
            </motion.p>
            <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.4 }} className="flex flex-wrap gap-4">
              <Link to="/auth?mode=sign-up&redirect=/create" className="primary-button">Start a Group</Link>
              <a href="#how-it-works" className="secondary-button">How It Works</a>
            </motion.div>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.55 }} className="flex flex-wrap items-center gap-5 border-t border-purple-100 pt-6 text-sm text-slate-600">
              <span>500+ Groups Active</span><span>P12M+ Pooled</span><span>0 Disputes</span>
            </motion.div>
            <div className="flex flex-wrap items-center gap-5 pt-4">
              <div className="flex -space-x-3">
                {avatars.map((avatar, index) => (
                  <div key={avatar} className="glass-soft flex h-12 w-12 items-center justify-center rounded-full border text-sm font-bold text-[#5b21b6]">
                    {avatar}
                  </div>
                ))}
              </div>
              <p className="text-[13px] uppercase tracking-[0.18em] text-slate-500">500+ groups saving together</p>
            </div>
          </div>

          <div className="relative flex items-center justify-center">
            <div className="absolute h-[520px] w-[520px] rounded-full border border-purple-100" />
            <div className="absolute h-[360px] w-[360px] rounded-full border border-purple-100" />
            {avatars.map((avatar, index) => {
              const angle = (index / avatars.length) * Math.PI * 2 + rotationStep * 0.7;
              const x = Math.cos(angle) * 130;
              const y = Math.sin(angle) * 130;
              const isCurrent = index === rotationStep % avatars.length;
              return (
                <button
                  key={avatar}
                  type="button"
                  className={`absolute flex h-14 w-14 items-center justify-center rounded-full border text-sm font-bold transition-all ${isCurrent ? "pulse-glow border-[#F5A623] bg-[#F5A623] text-[#3F2200]" : "border-purple-100 bg-white text-[#6d28d9] shadow-[0_12px_32px_rgba(124,58,237,0.10)]"}`}
                  style={{ transform: `translate(${x}px, ${y}px)` }}
                  onClick={() => setRotationStep(index)}
                >
                  {avatar}
                </button>
              );
            })}
            <div className="glass-soft z-10 flex h-56 w-56 flex-col items-center justify-center rounded-full text-center">
              <span className="material-symbols-outlined mb-2 text-4xl text-[#F5A623]">account_balance_wallet</span>
              <p className="text-xs uppercase tracking-[0.2em] text-[#7c3aed]">Current Pool</p>
              <p className="mt-2 text-3xl font-extrabold text-[#1f1637]">P1,250,000</p>
            </div>
          </div>
        </div>
      </section>

      <section id="how-it-works" className="bg-[#f3e8ff] px-6 py-24 text-[#2a133f] md:px-8">
        <div className="mx-auto max-w-7xl">
          <SectionReveal className="mx-auto max-w-3xl text-center" variant="scale">
            <h2 className="section-title text-[48px]">Three steps. Zero trust required.</h2>
          </SectionReveal>
          <div className="mt-14 grid gap-5 md:grid-cols-3">
            {[
              ["Create Your Group", "Invite friends by wallet address, set weekly contribution.", "👥"],
              ["Everyone Contributes", "USDC locked in smart contract, fully on-chain.", "🔒"],
              ["Rotation Releases Automatically", "Contract pays out each round, no admin needed.", "⚡"]
            ].map((card, index) => (
              <SectionReveal key={card[0]} variant={index % 2 === 0 ? "left" : "right"} stagger={(index + 1) as 1 | 2 | 3} className="surface-card interactive-card rounded-[20px] border-l-4 border-l-[#00C6FF] p-6">
                <div className="flex items-start gap-4">
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-[#F4F7FB] text-3xl">{card[2]}</div>
                  <div>
                    <p className="text-sm font-semibold text-[#00C6FF]">0{index + 1}</p>
                    <h3 className="mt-1 text-[24px] font-semibold">{card[0]}</h3>
                    <p className="mt-3 text-[16px] leading-relaxed text-[#0D1F3C]/75">{card[1]}</p>
                  </div>
                </div>
              </SectionReveal>
            ))}
          </div>
        </div>
      </section>

      <section id="stats" className="relative overflow-hidden bg-[linear-gradient(145deg,#3b1161_0%,#561a8b_45%,#7c2cc8_100%)] px-6 py-24 text-white md:px-8">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_15%_20%,rgba(255,255,255,0.12),transparent_32%),radial-gradient(circle_at_85%_85%,rgba(233,213,255,0.18),transparent_30%)]" />
        <div className="mx-auto max-w-7xl">
          <SectionReveal className="max-w-2xl" variant="base"><h2 className="font-display text-[48px] font-extrabold leading-[1.05] text-white">Live numbers from the community</h2></SectionReveal>
          <div ref={statsRef} className="mt-12 grid gap-5 md:grid-cols-4">
            {[
              { label: "Members", value: memberCount.toLocaleString() },
              { label: "Pooled", value: `P${pooledCount.toLocaleString()}` },
              { label: "On-Chain", value: "100%" },
              { label: "Disputes", value: "0" }
            ].map((item, index) => (
              <SectionReveal key={item.label} variant="scale" stagger={(index + 1) as 1 | 2 | 3 | 4} className="rounded-[20px] border border-white/25 bg-white/25 p-6 shadow-[0_20px_55px_rgba(39,6,71,0.35)] backdrop-blur-xl">
                <p className="text-[13px] uppercase tracking-[0.2em] text-[#f3e8ff]">{item.label}</p>
                <p className="mt-4 text-4xl font-extrabold text-white">{item.value}</p>
              </SectionReveal>
            ))}
          </div>
        </div>
      </section>

      <section id="features" className="bg-[#f4ebff] px-6 py-24 text-[#2a133f] md:px-8">
        <div className="mx-auto max-w-7xl space-y-8">
          <SectionReveal className="max-w-3xl" variant="base"><h2 className="section-title text-[48px]">Features built for trust, community, and celebration</h2></SectionReveal>
          {[
            ["Freighter Wallet", "Connect in one click. No new account needed."],
            ["Auto-Release", "Smart contract pays the winner automatically. No human can block it."],
            ["USDC Stable", "No crypto volatility. Your savings stay in USDC."],
            ["Transparent", "Every transaction on Stellar blockchain. Anyone can verify."],
            ["Group Chat Ready", "Share your group link. Invite by wallet. Start saving."]
          ].map((item, index) => (
              <SectionReveal key={item[0]} variant="base" stagger={((index % 5) + 1) as 1 | 2 | 3 | 4 | 5} className="surface-card interactive-card flex items-start gap-4 rounded-[18px] p-5">
              <span className="material-symbols-outlined mt-1 text-3xl text-[#00C6FF]">verified</span>
              <div>
                <h3 className="text-[24px] font-semibold">{item[0]}</h3>
                <p className="mt-2 text-[16px] text-[#0D1F3C]/75">{item[1]}</p>
              </div>
            </SectionReveal>
          ))}
        </div>
      </section>

      <section className="relative overflow-hidden bg-[#f7efff] px-6 py-24 text-slate-900 md:px-8">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(168,85,247,0.08),transparent_58%)]" />
        <div className="mx-auto max-w-7xl text-center">
          <SectionReveal variant="scale" className="mx-auto max-w-3xl">
            <h2 className="section-title text-[48px] text-slate-900">See how the rotation works</h2>
            <p className="mt-4 text-[18px] text-slate-600">A circular queue that makes the next recipient obvious and fair.</p>
          </SectionReveal>
          <div className="mx-auto mt-12 flex max-w-5xl flex-col items-center gap-6 rounded-[28px] border border-[#c084fc]/45 bg-[linear-gradient(140deg,#4c1d95_0%,#6d28d9_55%,#7e22ce_100%)] p-8 text-white shadow-[0_34px_100px_rgba(88,28,135,0.36)] backdrop-blur-2xl lg:flex-row lg:justify-between">
            <div className="relative flex h-[360px] w-[360px] items-center justify-center wheel-spin">
              <div className="absolute h-full w-full rounded-full border border-[#e9d5ff]/30 bg-[radial-gradient(circle,rgba(221,214,254,0.24),rgba(124,58,237,0.16)_58%,transparent_72%)]" />
              <div className="absolute h-[82%] w-[82%] rounded-full border border-white/25" />
              {avatars.map((avatar, index) => {
                const angle = (index / avatars.length) * Math.PI * 2 + rotationStep * 0.7;
                const x = Math.cos(angle) * 130;
                const y = Math.sin(angle) * 130;
                const isCurrent = index === rotationStep % avatars.length;
                return (
                  <button key={avatar} type="button" className={`absolute flex h-14 w-14 items-center justify-center rounded-full border text-sm font-bold transition-all ${isCurrent ? "pulse-glow border-[#f5d0fe] bg-[#f5d0fe] text-[#4a044e]" : "border-[#d8b4fe]/70 bg-white/15 text-white shadow-[0_0_0_1px_rgba(255,255,255,0.25)]"}`} style={{ transform: `translate(${x}px, ${y}px)` }} onClick={() => setRotationStep(index)}>
                    {avatar}
                  </button>
                );
              })}
              <div className="glass-panel flex h-40 w-40 flex-col items-center justify-center rounded-full border border-white/30 bg-white/20 text-center text-white shadow-[0_0_50px_rgba(245,208,254,0.20)]">
                <p className="text-xs uppercase tracking-[0.2em] text-[#f5d0fe]">Pool Balance</p>
                <p className="mt-2 text-3xl font-extrabold text-white">P1,250,000</p>
                <p className="mono mt-2 text-xs text-[#f3e8ff]">Next Rotation in: 3 days 14 hours</p>
              </div>
            </div>
            <div className="max-w-xl text-left">
              <p className="text-[13px] uppercase tracking-[0.2em] text-[#f5d0fe]">Interactive Demo</p>
              <h3 className="mt-3 text-[24px] font-semibold">Current recipient glows gold. One click advances the ring.</h3>
              <p className="mt-4 text-white/80">Simulate the next round to see the payout seat move clockwise around the group.</p>
              <button type="button" onClick={() => setRotationStep((prev) => prev + 1)} className="mt-6 primary-button">Simulate Round</button>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-[#f3e8ff] px-6 py-24 text-slate-900 md:px-8">
        <div className="mx-auto max-w-7xl">
          <SectionReveal className="mx-auto max-w-3xl text-center" variant="scale"><h2 className="section-title text-[48px]">Real groups. Real savings.</h2></SectionReveal>
          <div className="mt-12 grid gap-5 md:grid-cols-3">
            {[
              ["Maria", "Quezon City", "Our office paluwagan used to run on GCash group chats. Now nobody asks if you sent it anymore."],
              ["Kuya Jun", "Cebu", "First time I joined a paluwagan online and actually trusted it. The smart contract is the banker."],
              ["Teacher Nena", "Davao", "My 10-person group has completed 3 full rotations. Not a single problem."]
            ].map((item, index) => (
              <SectionReveal key={item[0]} variant="base" stagger={(index + 1) as 1 | 2 | 3} className="surface-card interactive-card rounded-[18px] border-l-4 border-l-[#8b5cf6] p-6">
                <div className="flex items-center gap-4">
                  <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#f5f0ff] text-lg font-bold text-[#6d28d9]">{item[0].slice(0, 1)}</div>
                  <div>
                    <h3 className="text-[24px] font-semibold">{item[0]}</h3>
                    <p className="text-sm text-slate-500">{item[1]}</p>
                  </div>
                </div>
                <p className="mt-4 italic text-slate-600">“{item[2]}”</p>
              </SectionReveal>
            ))}
          </div>
        </div>
      </section>

      <section className="hero-gradient relative overflow-hidden px-6 py-24 text-slate-900 md:px-8">
        <div className="blob blob-gold absolute bottom-0 right-0 opacity-70" />
        <div className="blob blob-violet absolute left-0 top-0 opacity-50" />
        <div className="mx-auto max-w-7xl text-center">
          <SectionReveal variant="scale" className="mx-auto max-w-3xl">
            <h2 className="section-title text-[56px]">Ready to start your group?</h2>
            <p className="mt-4 text-[18px] text-slate-600">Connect your Freighter wallet and create your first paluwagan in 2 minutes.</p>
          </SectionReveal>
          <SectionReveal variant="scale" stagger={3} className="mt-8"><Link to="/auth?mode=sign-up&redirect=/create" className="primary-button inline-flex text-lg">Create Your Group</Link></SectionReveal>
        </div>
      </section>

      <footer className="bg-[#2a133f] px-6 py-16 text-white md:px-8">
        <div className="mx-auto grid max-w-7xl gap-10 md:grid-cols-4">
          <div>
            <div className="font-display text-2xl font-extrabold text-white">PaluwagaChain</div>
            <p className="mt-4 text-sm text-white/70">Your group's money. Protected on-chain.</p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.18em] text-[#e9d5ff]">Product</p>
            <ul className="mt-4 space-y-3 text-sm text-white/75">
              <li><Link to="/create">Create Group</Link></li>
              <li><Link to="/profile">Profile</Link></li>
            </ul>
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.18em] text-[#e9d5ff]">Resources</p>
            <ul className="mt-4 space-y-3 text-sm text-white/75">
              <li><a href="#how-it-works">How it works</a></li>
              <li><a href="#stats">Stats</a></li>
              <li><a href="#features">Features</a></li>
            </ul>
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.18em] text-[#e9d5ff]">Social</p>
            <p className="mt-4 text-sm text-white/75">Powered by Stellar Blockchain</p>
            <p className="mt-2 text-sm text-white/75">MIT License | 2025 PaluwagaChain</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
