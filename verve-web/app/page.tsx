import Link from "next/link";
import StageIllustration from "@/components/landing/StageIllustration";
import ModeCard from "@/components/landing/ModeCard";
import { BoltIcon, ScaleIcon, MicIcon, BookIcon } from "@/components/landing/ModeIcons";

const modes = [
  {
    icon: <BoltIcon />,
    title: "Impromptu",
    description:
      "Think clearly under pressure. Receive unexpected prompts and organize your thoughts in real time.",
  },
  {
    icon: <ScaleIcon />,
    title: "Debate",
    description:
      "Build stronger arguments. Respond to opposing viewpoints and develop persuasive reasoning.",
  },
  {
    icon: <MicIcon />,
    title: "Interview",
    description:
      "Practice real interview conversations. Improve structure, confidence, and clarity.",
  },
  {
    icon: <BookIcon />,
    title: "Storytelling",
    description:
      "Turn ideas into memorable narratives. Learn how to keep listeners engaged.",
  },
];

const steps = [
  { number: "01", title: "Choose a Challenge", description: "Select your training mode and receive a structured prompt tailored to your skill level." },
  { number: "02", title: "Prepare", description: "Take a moment to organize your thoughts. A preparation timer helps you get ready." },
  { number: "03", title: "Speak", description: "Deliver your response as the recording captures your practice session naturally." },
  { number: "04", title: "Review", description: "Receive structured coaching with detailed feedback on your communication skills." },
  { number: "05", title: "Improve", description: "Track your progress over time and watch your communication rating grow." },
];

export default function Home() {
  return (
    <main className="min-h-screen bg-background">
      <div className="bg-radial-burgundy">
        <section className="mx-auto max-w-content px-6 pb-section-tablet pt-24 md:pb-section md:pt-32 lg:pb-section">
          <div className="flex flex-col items-center gap-12 lg:flex-row lg:gap-16">
            <div className="flex-1 text-center lg:text-left">
              <p className="mb-6 inline-block rounded-full border border-gold/20 bg-gold/5 px-5 py-2 text-sm font-medium uppercase tracking-[0.2em] text-gold">
                Become a Stronger Communicator
              </p>

              <h1 className="font-heading text-4xl font-semibold leading-tight text-text-primary md:text-5xl lg:text-6xl">
                Become a Stronger{" "}
                <span className="text-gold">Communicator.</span>
              </h1>

              <p className="mt-6 max-w-2xl text-lg leading-relaxed text-text-secondary md:text-xl">
                Practice impromptu speaking, interviews, debates, and
                storytelling through structured speaking sessions designed to
                improve how you think, organize ideas, and communicate with
                confidence.
              </p>

              <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row lg:justify-start">
                <Link
                  href="/signup"
                  className="inline-flex h-[52px] items-center rounded-full bg-gold px-7 text-base font-semibold text-[#4A131C] transition-all duration-300 hover:translate-y-[-3px] hover:shadow-glow"
                >
                  Start Practicing
                </Link>
                <Link
                  href="#modes"
                  className="inline-flex h-[52px] items-center rounded-full border border-border bg-transparent px-7 text-base font-semibold text-text-primary transition-all duration-300 hover:border-gold"
                >
                  Explore Training Modes
                </Link>
              </div>

              <div className="mt-8 flex items-center justify-center gap-4 text-sm font-medium text-text-muted lg:justify-start">
                <span>Impromptu</span>
                <span className="text-border">•</span>
                <span>Debate</span>
                <span className="text-border">•</span>
                <span>Interview</span>
                <span className="text-border">•</span>
                <span>Storytelling</span>
              </div>
            </div>

            <div className="w-full max-w-[420px] flex-shrink-0 lg:w-[35%]">
              <StageIllustration />
            </div>
          </div>
        </section>
      </div>

      <section
        id="modes"
        className="mx-auto max-w-content px-6 pb-section-tablet pt-section-tablet md:pb-section md:pt-section"
      >
        <div className="mb-16 text-center">
          <p className="mb-4 text-sm font-medium uppercase tracking-[0.2em] text-gold">
            Training Modes
          </p>
          <h2 className="font-heading text-3xl font-semibold text-text-primary md:text-4xl">
            Choose Your Practice
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-text-secondary">
            Each mode is designed to target specific communication skills
            through structured practice and feedback.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {modes.map((mode, i) => (
            <ModeCard key={mode.title} {...mode} index={i} />
          ))}
        </div>
      </section>

      <div className="bg-radial-burgundy">
        <section className="mx-auto max-w-content px-6 pb-section-tablet pt-section-tablet md:pb-section md:pt-section">
          <div className="mb-16 text-center">
            <p className="mb-4 text-sm font-medium uppercase tracking-[0.2em] text-gold">
              How It Works
            </p>
            <h2 className="font-heading text-3xl font-semibold text-text-primary md:text-4xl">
              From Prompt to Progress
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-text-secondary">
              Every practice session follows the same deliberate structure.
            </p>
          </div>

          <div className="relative mx-auto max-w-3xl">
            <div className="absolute left-[23px] top-0 h-full w-px bg-gradient-to-b from-gold/40 via-border to-transparent max-md:hidden" />

            <div className="space-y-16">
              {steps.map((step, i) => (
                <div key={step.number} className="relative flex items-start gap-8">
                  <div className="relative z-10 flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full border border-gold/30 bg-card text-sm font-semibold text-gold max-md:hidden">
                    {step.number}
                  </div>

                  <div className="flex-1">
                    <h3 className="font-heading text-2xl font-semibold text-text-primary">
                      {step.title}
                    </h3>
                    <p className="mt-2 max-w-lg text-text-muted">
                      {step.description}
                    </p>

                    {i < steps.length - 1 && (
                      <div className="mt-6 hidden h-8 w-px bg-gradient-to-b from-gold/20 to-transparent md:block" />
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>

      <section className="mx-auto max-w-content px-6 pb-section-tablet pt-section-tablet text-center md:pb-section md:pt-section">
        <h2 className="font-heading text-3xl font-semibold text-text-primary md:text-4xl">
          Ready to Start Your{" "}
          <span className="text-gold">Practice?</span>
        </h2>
        <p className="mx-auto mt-4 max-w-xl text-text-secondary">
          Join Verve and begin your journey to becoming a more confident,
          articulate communicator.
        </p>
        <Link
          href="/signup"
          className="mt-10 inline-flex h-[52px] items-center rounded-full bg-gold px-7 text-base font-semibold text-[#4A131C] transition-all duration-300 hover:translate-y-[-3px] hover:shadow-glow"
        >
          Start Practicing Free
        </Link>
      </section>

      <footer className="border-t border-border">
        <div className="mx-auto flex max-w-content flex-col items-center justify-between gap-4 px-6 py-8 md:flex-row">
          <p className="font-heading text-xl font-semibold text-text-primary">
            Verve
          </p>
          <p className="text-sm text-text-muted">
            &copy; {new Date().getFullYear()} Verve. All rights reserved.
          </p>
        </div>
      </footer>
    </main>
  );
}
