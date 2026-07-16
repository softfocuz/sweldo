import { Link } from "react-router-dom";
import { Button } from "@/components/ui/Button";
import logo from "@/assets/logo.png";

const features = [
  { label: "Non-custodial", detail: "Funds live in Stellar claimable balances, never in Sweldo" },
  { label: "On Stellar", detail: "Settlement in seconds, fees measured in fractions of a cent" },
  { label: "Instant claims", detail: "Employees claim the moment a payment unlocks" },
  { label: "Transparent", detail: "Every payout is a public, verifiable Stellar transaction" }
];

const team = [
  { name: "John Heinrich Fabros", github: "https://github.com/mrHeinrichh/" },
  { name: "Jen Salaysay", github: "https://github.com/aizennn/" },
  { name: "Clarise Tan", github: "https://github.com/softfocuz/" }
];

const steps = [
  {
    index: "01",
    title: "Employer locks funds",
    detail: "Create a payroll, choose a schedule, and lock the total amount into a Stellar claimable balance."
  },
  {
    index: "02",
    title: "Funds wait on-chain",
    detail: "Each installment unlocks at its own timestamp. Nothing moves before it is due."
  },
  {
    index: "03",
    title: "Employee claims",
    detail: "The moment a payment unlocks, the employee signs one transaction and receives it directly."
  }
];

export function LandingPage() {
  return (
    <div className="min-h-screen bg-paper-100">
      <div className="mx-auto max-w-6xl px-4 pt-6 sm:px-6 sm:pt-10">
        <section className="ledger-dots relative overflow-hidden rounded-xl2 bg-signal-500 px-6 pb-16 pt-6 text-paper-50 sm:px-10 sm:pb-24 sm:pt-8">
          <header className="flex items-center justify-between pb-16 sm:pb-24">
            <div className="flex items-center gap-2">
              <img src={logo} alt="Sweldo" className="h-8 w-8 rounded-md object-cover" />
              <span className="font-display text-lg font-semibold italic">Sweldo</span>
            </div>
            <nav className="hidden items-center gap-8 text-sm tracking-wide text-paper-100/80 md:flex">
              <a href="#features" className="hover:text-paper-50">FEATURES</a>
              <a href="#how" className="hover:text-paper-50">HOW IT WORKS</a>
              <a href="#about" className="hover:text-paper-50">ABOUT</a>
            </nav>
            <div className="flex items-center gap-4">
              <Link to="/login" className="text-sm font-medium text-paper-100/80 hover:text-paper-50">
                Log in
              </Link>
              <Link to="/signup">
                <Button size="sm" className="bg-paper-50 text-signal-600 hover:bg-signal-100">
                  Sign up
                </Button>
              </Link>
            </div>
          </header>

          <p className="max-w-xs text-sm leading-relaxed text-paper-100/75">
            Because a payroll should not depend on trusting the company running it.
          </p>

          <h1 className="mt-8 font-display text-6xl font-medium leading-[1.05] tracking-tight text-paper-50 sm:text-7xl">
            payroll that
            <br />
            keeps its <span className="italic">promise</span>
          </h1>

          <div className="mt-14 flex flex-col gap-8 sm:flex-row sm:items-end sm:justify-between">
            <div className="flex items-start gap-6">
              <svg viewBox="0 0 40 20" className="mt-1 h-5 w-10 shrink-0 text-paper-50" fill="none">
                <path d="M0 10h36M28 2c4 4 8 6 10 8-2 2-6 4-10 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <p className="max-w-sm text-base text-paper-100/85">
                Non-custodial payroll on <em className="italic">Stellar</em>, combining locked funds
                with instant, on-chain claims.
              </p>
            </div>
            <div className="flex gap-6 text-sm font-medium text-paper-100/80">
              <a href="#how" className="hover:text-paper-50">How it works</a>
              <a href="#features" className="hover:text-paper-50">Features</a>
              <Link to="/signup" className="hover:text-paper-50">Get started</Link>
            </div>
          </div>
        </section>
      </div>

      <section id="features" className="mt-24 bg-ink-950 py-20 text-paper-50 sm:mt-32">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <p className="text-sm font-medium tracking-wide text-signal-400">FEATURES</p>
          <h2 className="mt-3 max-w-lg font-display text-3xl font-medium sm:text-4xl">
            Built so nobody has to <span className="italic">take our word</span> for it.
          </h2>
          <div className="mt-14 grid grid-cols-1 gap-10 sm:grid-cols-2">
            {features.map((feature) => (
              <div key={feature.label}>
                <p className="font-display text-xl font-medium text-paper-50">{feature.label}</p>
                <p className="mt-2 max-w-xs text-sm leading-relaxed text-paper-100/70">{feature.detail}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="how" className="mx-auto max-w-6xl px-4 py-24 sm:px-6">
        <p className="text-sm font-medium tracking-wide text-signal-500">HOW IT WORKS</p>
        <h2 className="mt-3 max-w-2xl font-display text-3xl font-medium text-ink-900 sm:text-4xl">
          One transaction locks the funds. One claim <span className="italic">releases</span> them.
        </h2>
        <div className="mt-16 grid grid-cols-1 gap-14 md:grid-cols-3">
          {steps.map((step) => (
            <div key={step.index} className="relative">
              <span className="font-display text-6xl font-medium text-paper-200">{step.index}</span>
              <p className="mt-2 font-display text-lg font-medium text-ink-900">{step.title}</p>
              <p className="mt-2 text-sm leading-relaxed text-ink-600">{step.detail}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="team" className="mx-auto mt-20 max-w-6xl px-4 sm:mt-28 sm:px-6" style={{ marginBottom: "50px" }}>
        <p className="text-sm font-medium tracking-wide text-signal-500">TEAM</p>
        <h2 className="mt-3 max-w-lg font-display text-3xl font-medium text-ink-900 sm:text-4xl">
          The people <span className="italic">building</span> Sweldo.
        </h2>
        <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-3">
          {team.map((member) => (
            <a
              key={member.name}
              href={member.github}
              target="_blank"
              rel="noreferrer"
              className="group flex flex-col gap-3 rounded-xl2 border border-line bg-white p-6 shadow-card transition hover:border-signal-400 hover:shadow-panel"
            >
              <div className="flex items-center justify-between">
                <span className="font-display text-lg font-medium text-ink-900">{member.name}</span>
                <svg viewBox="0 0 24 24" className="h-5 w-5 shrink-0 text-ink-500 transition group-hover:text-signal-500" fill="currentColor">
                  <path d="M12 .5C5.65.5.5 5.65.5 12c0 5.1 3.29 9.42 7.86 10.95.57.1.79-.25.79-.55 0-.27-.01-1-.02-1.96-3.2.7-3.87-1.54-3.87-1.54-.53-1.33-1.28-1.69-1.28-1.69-1.05-.71.08-.7.08-.7 1.16.08 1.77 1.19 1.77 1.19 1.03 1.76 2.7 1.25 3.36.96.1-.75.4-1.25.73-1.54-2.55-.29-5.24-1.28-5.24-5.68 0-1.26.45-2.29 1.19-3.09-.12-.29-.52-1.46.11-3.05 0 0 .97-.31 3.18 1.18a11 11 0 015.79 0c2.2-1.49 3.17-1.18 3.17-1.18.64 1.59.24 2.76.12 3.05.74.8 1.18 1.83 1.18 3.09 0 4.41-2.69 5.38-5.25 5.67.41.36.78 1.07.78 2.16 0 1.56-.01 2.81-.01 3.19 0 .3.21.66.8.55A11.51 11.51 0 0023.5 12c0-6.35-5.15-11.5-11.5-11.5z" />
                </svg>
              </div>
              <span className="text-sm text-ink-500">GitHub profile</span>
            </a>
          ))}
        </div>
      </section>

      <footer id="about" className="bg-paper-200 px-4 py-14 sm:px-6">
        <div className="mx-auto flex max-w-6xl flex-col items-start justify-between gap-6 text-sm text-ink-600 md:flex-row md:items-center">
          <div className="flex items-center gap-2">
            <img src={logo} alt="Sweldo" className="h-6 w-6 rounded object-cover" />
            <span className="font-display text-base italic text-ink-900">Sweldo</span>
          </div>
          <p>Built on Stellar Testnet.</p>
        </div>
      </footer>
    </div>
  );
}
