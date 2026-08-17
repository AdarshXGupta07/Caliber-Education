"use client";

import { motion } from "framer-motion";
import { Target, Heart, Lightbulb, MessageCircle, BookOpen, Users } from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import { LinkedInIcon } from "@/components/SocialIcons";

const mentors = [
  {
    name: "CA Aditya Kanal",
    role: "Mentor",
    initials: "AK",
    image: "/MENTOR6.jpg",
    linkedin: "https://www.linkedin.com/in/aditya-kanal-3081561b4?utm_source=share_via&utm_content=profile&utm_medium=member_ios",
    bio: "Aditya is a first attempt Chartered Accountant and has passed level 1 of the CFA program. He is also an alumni of NMIMS, Mumbai, from where he studied Bsc Finance and passed out with a certificate of merit.\n\nHe works in valuations at a leading global advisory firm, where his day-to-day revolves around financial modelling, business valuation, and the kind of rigorous analytical work that CA students spend years training toward. Aditya also worked in valuations for his articleship, at a Big 4 firm.\n\nAlongside his practice, Aditya is an educator at heart — he built CAliber to bring that same rigour to CA aspirants, pairing real-world professional insight with structured mentorship and a results-driven approach. His goal is simple: help serious students not just clear their exams, but understand the “why” behind the numbers and walk into their careers genuinely prepared.",
    specialties: ["Financial Modelling", "Business Valuation", "Mentorship"],
  },
  {
    name: "CA Soumyadeep Pramanick",
    role: "Mentor",
    initials: "SP",
    image: "/MENTOR3.png",
    linkedin: "https://www.linkedin.com/in/ca-soumyadeep-pramanick?utm_source=share_via&utm_content=profile&utm_medium=member_ios",
    bio: "Co-founder of CAliber Mentorships, CA Soumyadeep Pramanick is a finance professional with experience in Financial Due Diligence (FDD) and Startup Advisory through his articleship at Big5 and Boutique TAS Firm at Mumbai. He has secured exemptions in Direct Tax (DT), Indirect Tax (IDT), and Integrated Business Solutions (IBS) in the Chartered Accountancy course and is currently pursuing CPA Australia. Having mentored 50+ students and built a community of 10,000+ followers across social media, he is passionate about simplifying finance and guiding aspiring professionals through mentorship and industry-focused learning.",
    specialties: ["Financial Due Diligence", "Startup Advisory", "Direct & Indirect Tax"],
  },
  {
    name: "CA Madhya Jasani",
    role: "Mentor",
    initials: "MJ",
    image: "/MENTOR1.png", // Provided photo
    bio: "Hey everyone, I'm CA Madhya Jasani, and I'm super excited to help you all with your CA Final journey! I'm based in Mumbai and currently work as an AM for department Funds Practice and Transaction Advisory. I've been through this myself, so I know that passing the CA Final isn't just about how many hours you study—it's about how smart you are with those hours. We'll focus on studying smarter, not just harder. We'll work on realistic revision plans and use active recall techniques to make sure you remember everything for that crucial 1.5-day exam gap. I'll also help you with paper presentation and time management under pressure. If you're stuck on something or need help with your strategy, just reach out whenever you need me—let's make this effort count and get you to the finish line!",
    specialties: ["Transaction Advisory", "Revision Planning", "Time Management"],
    linkedin: "https://www.linkedin.com/in/madhya-jasani-5321911b7?utm_source=share_via&utm_content=profile&utm_medium=member_ios",
  },
  {
    name: "CA Ishika Khurana",
    role: "Mentor",
    initials: "IK",
    image: "/MENTOR5.png", // Uploaded photo
    bio: "Ishika Khurana is a Chartered Accountant and finance professional with articleship experience in Business Valuation, having worked on valuation engagements for both listed and private companies across diverse sectors. A strong academic performer, she secured four exemptions in the CA Final examination, reflecting her dedication and technical proficiency.\n\nThrough structured guidance, practical study strategies, and continuous support, she aims to help students clear their examinations with confidence.",
    specialties: ["Business Valuation", "Study Strategies", "Exemptions"],
    linkedin: "https://www.linkedin.com/in/ishika-khurana-its?utm_source=share_via&utm_content=profile&utm_medium=member_ios",
  },
  {
    name: "CA Ishaan Wadekar",
    role: "Mentor",
    initials: "IW",
    image: "/MENTOR2.png",
    bio: "CA Ishaan Wadekar is an All India Rank 37 holder in the CA Final examination, having cleared all three levels of the Chartered Accountancy course on his first attempt. He secured exemptions in all six subjects at the CA Final level, including an outstanding 76 marks in Auditing, the highest among all his subjects. During his articleship at Deloitte, he gained exposure to statutory audits of listed and large private companies across multiple industries. As a mentor, Ishaan is passionate about helping CA students develop effective study strategies, strengthen conceptual understanding, and approach the examination with confidence and clarity, drawing from his own journey of consistent academic excellence.",
    specialties: ["AIR 37 Holder", "Auditing", "Study Strategies"],
    linkedin: "https://www.linkedin.com/in/ca-ishaan-wadekar?utm_source=share_via&utm_content=profile&utm_medium=member_ios",
  },
];
const values = [
  { icon: <Target className="w-5 h-5" />, title: "Exam-first design", desc: "Every MCQ, every explanation, every timer is built to replicate actual CA exam conditions — not textbook reading." },
  { icon: <Heart className="w-5 h-5" />, title: "Student-centred", desc: "We obsess over the student experience. Mobile-first, no distractions, instant feedback on every question." },
  { icon: <Lightbulb className="w-5 h-5" />, title: "Understand, don't memorise", desc: "Every answer comes with a full explanation. We care about building conceptual clarity, not rote recall." },
  { icon: <MessageCircle className="w-5 h-5" />, title: "Human access", desc: "Our WhatsApp groups give you direct access to mentors. Real answers to real doubts, not chatbots." },
];

function MentorCard({ m, i, onZoom }: { m: (typeof mentors)[number]; i: number; onZoom: (image: string) => void }) {
  return (
    <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.05 }}
      className="flex flex-col p-6 bg-white dark:bg-line-gray-dark/20 rounded-xl border border-line-gray-light dark:border-line-gray-dark hover:border-slate/40 dark:hover:border-paper/40 transition-colors">
      <div className="flex items-center gap-4 mb-4">
        <div
          className="w-16 h-16 rounded-xl border-2 border-line-gray-light dark:border-line-gray-dark bg-line-gray-light/35 dark:bg-line-gray-dark/30 flex-shrink-0 flex items-center justify-center text-ink-navy dark:text-paper font-heading font-bold text-lg overflow-hidden relative shadow-sm cursor-zoom-in hover:scale-105 transition-transform"
          onClick={() => { if (m.image) onZoom(m.image); }}
        >
          {m.image ? (
            <Image src={m.image} alt={m.name} fill className="object-cover" quality={95} />
          ) : (
            m.initials
          )}
        </div>
        <div>
          <div className="flex items-center gap-1.5">
            <p className="font-heading font-bold text-sm text-ink-navy dark:text-paper">{m.name}</p>
            {m.linkedin && (
              <a href={m.linkedin} target="_blank" rel="noopener noreferrer" aria-label={`${m.name} on LinkedIn`}
                className="opacity-70 hover:opacity-100 hover:scale-110 transition-all">
                <LinkedInIcon className="w-3.5 h-3.5" />
              </a>
            )}
          </div>
          <p className="text-[10px] font-bold text-slate dark:text-paper/50 uppercase mt-0.5">{m.role}</p>
        </div>
      </div>
      <div className="flex-1 space-y-4">
        <p className="text-xs text-slate dark:text-paper/70 leading-relaxed max-h-[140px] overflow-y-auto pr-1 stylish-scrollbar">{m.bio}</p>
        <div className="flex flex-wrap gap-1.5 pt-2 border-t border-line-gray-light dark:border-line-gray-dark">
          {m.specialties.map((s) => (
            <span key={s} className="text-[9px] px-2 py-0.5 rounded bg-line-gray-light/60 dark:bg-line-gray-dark/40 text-slate dark:text-paper/60 font-semibold border border-line-gray-light/30">{s}</span>
          ))}
        </div>
      </div>
    </motion.div>
  );
}

export default function AboutClient() {
  const [zoomedImage, setZoomedImage] = useState<string | null>(null);
  // First 2 entries are the co-founders — shown in their own 2-column row
  // above the rest of the mentor grid (3-column), per the requested layout.
  const founderMentors = mentors.slice(0, 2);
  const otherMentors = mentors.slice(2);

  return (
    <div className="pt-6">
      {/* ─── FOUNDERS & MENTORS ─── */}
      <section id="mentors" className="pt-12 pb-24 bg-paper dark:bg-ink-navy/40 border-b border-line-gray-light dark:border-line-gray-dark">
        <div className="max-w-6xl mx-auto px-6 sm:px-8">
          <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-8">
            <span className="text-xs font-semibold text-slate dark:text-paper/50 uppercase tracking-widest">Leadership & Mentors</span>
            <h2 className="font-heading font-bold text-3xl sm:text-4xl text-ink-navy dark:text-paper mt-2">Meet the team</h2>
          </motion.div>

          {/* Mentors Layer — founders get their own 2-col row, rest are 3-col */}
          <div className="max-w-6xl mx-auto">
            <h3 className="font-heading font-bold text-xl text-center text-ink-navy dark:text-paper border-b border-line-gray-light dark:border-line-gray-dark pb-3 mb-8">Expert Mentors</h3>
            <div className="grid sm:grid-cols-2 gap-6 mb-6">
              {founderMentors.map((m, i) => (
                <MentorCard key={m.name} m={m} i={i} onZoom={setZoomedImage} />
              ))}
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {otherMentors.map((m, i) => (
                <MentorCard key={m.name} m={m} i={i} onZoom={setZoomedImage} />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ─── HERO ─── */}
      <section className="relative py-32 bg-paper dark:bg-ink-navy border-b border-line-gray-light dark:border-line-gray-dark">
        <div className="relative max-w-4xl mx-auto px-6 sm:px-8 text-center">
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
            <span className="text-xs font-semibold text-slate dark:text-paper/50 uppercase tracking-widest">About Us</span>
            <h1 className="font-heading font-extrabold text-4xl sm:text-5xl text-ink-navy dark:text-paper mt-4 leading-tight tracking-tight">
              Two Chartered Accountants building the mentorship they wished they'd had.
            </h1>
          </motion.div>
        </div>
      </section>

      {/* ─── WHY WE BUILT THIS ─── */}
      <section className="py-24 bg-white dark:bg-ink-navy border-b border-line-gray-light dark:border-line-gray-dark">
        <div className="max-w-4xl mx-auto px-6 sm:px-8 space-y-8">
          <span className="text-xs font-semibold text-slate dark:text-paper/50 uppercase tracking-widest">Our Mission</span>
          <h2 className="font-heading font-bold text-3xl sm:text-4xl text-ink-navy dark:text-paper">
            Why we built CAliber Education
          </h2>

          <div className="grid sm:grid-cols-3 gap-6 mt-8">
            {[
              { stat: "200+", label: "Mentorship hours", desc: "Hours of live 1:1 and group mentorship sessions completed with students." },
              { stat: "3 hours", label: "Per exam paper", desc: "CA exams demand mental stamina and quick retrieval under strict time limits." },
              { stat: "1 platform", label: "Focused on MCQs", desc: "Purpose-built for timed MCQ practice with step-by-step rationales, not just key codes." },
            ].map((item, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.05 }}
                className="p-6 rounded-xl border border-line-gray-light dark:border-line-gray-dark bg-white dark:bg-line-gray-dark/20">
                <div className="font-heading font-extrabold text-3xl text-ink-navy dark:text-paper">{item.stat}</div>
                <div className="font-semibold text-xs text-slate dark:text-paper/70 mt-1">{item.label}</div>
                <p className="text-xs text-slate dark:text-paper/60 mt-2 leading-relaxed">{item.desc}</p>
              </motion.div>
            ))}
          </div>

          <div className="mt-8 space-y-6 text-slate dark:text-paper/70 text-sm leading-relaxed">
            <p>
              That's the gap CAliber closes. Not another set of lectures or another book to get through — a workspace built around timed, active retrieval, where every session behaves like the real exam.
            </p>
            <p>
              Attempt under pressure. See exactly where it broke. Fix it before it costs you another attempt.
            </p>
          </div>
        </div>
      </section>

      {/* ─── VALUES ─── */}
      <section className="py-24 bg-white dark:bg-ink-navy border-b border-line-gray-light dark:border-line-gray-dark">
        <div className="max-w-5xl mx-auto px-6 sm:px-8">
          <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-16">
            <span className="text-xs font-semibold text-slate dark:text-paper/50 uppercase tracking-widest">Our Values</span>
            <h2 className="font-heading font-bold text-3xl sm:text-4xl text-ink-navy dark:text-paper mt-3">What we stand for</h2>
          </motion.div>
          <div className="grid sm:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {values.map((v, i) => (
              <motion.div key={v.title} initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.05 }}
                className="flex gap-4 p-6 rounded-xl border border-line-gray-light dark:border-line-gray-dark bg-white dark:bg-line-gray-dark/20">
                <div className="flex-shrink-0 w-10 h-10 rounded-lg border border-line-gray-light dark:border-line-gray-dark bg-line-gray-light/35 dark:bg-line-gray-dark/30 flex items-center justify-center text-ink-navy dark:text-paper">{v.icon}</div>
                <div>
                  <h3 className="font-heading font-bold text-sm text-ink-navy dark:text-paper">{v.title}</h3>
                  <p className="text-xs text-slate dark:text-paper/60 mt-1.5 leading-relaxed">{v.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── CREDENTIALS ─── */}
      <section className="py-24 bg-paper dark:bg-ink-navy/40">
        <div className="max-w-4xl mx-auto px-6 sm:px-8">
          <div className="grid sm:grid-cols-3 gap-8 text-center">
            {[
              { icon: <BookOpen className="w-5 h-5 text-slate dark:text-paper/50" />, stat: "1,200+", label: "MCQs in the library" },
              { icon: <Users className="w-5 h-5 text-slate dark:text-paper/50" />, stat: "20+", label: "Team members" },
              { icon: <MessageCircle className="w-5 h-5 text-slate dark:text-paper/50" />, stat: "12", label: "WhatsApp groups active" },
            ].map((item, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.05 }} className="flex flex-col items-center gap-2.5 p-6 border border-line-gray-light dark:border-line-gray-dark rounded-xl bg-white dark:bg-line-gray-dark/20">
                <div className="w-10 h-10 rounded-lg border border-line-gray-light dark:border-line-gray-dark bg-line-gray-light/35 dark:bg-line-gray-dark/30 flex items-center justify-center">{item.icon}</div>
                <div className="font-heading font-extrabold text-2xl text-ink-navy dark:text-paper mt-1">{item.stat}</div>
                <div className="text-xs text-slate dark:text-paper/50">{item.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* FULLSCREEN IMAGE MODAL */}
      {zoomedImage && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-ink-navy/95 backdrop-blur-sm cursor-zoom-out p-4 sm:p-8"
          onClick={() => setZoomedImage(null)}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="relative max-w-7xl max-h-[90vh] w-full h-full flex items-center justify-center"
          >
            <Image src={zoomedImage} alt="Zoomed view" fill className="object-contain drop-shadow-2xl" quality={95} />
          </motion.div>
          <button
            onClick={() => setZoomedImage(null)}
            className="absolute top-6 right-6 w-10 h-10 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center text-white transition-colors"
          >
            ✕
          </button>
        </div>
      )}
    </div>
  );
}
