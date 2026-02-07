import { Activity } from "lucide-react";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen w-full overflow-hidden bg-background-light dark:bg-background-dark font-display text-slate-900 dark:text-slate-200">
      {/* Left Pane: Imagery & Quote (Desktop Only) - Reusable Sidebar */}
      <div className="hidden lg:flex lg:w-1/2 relative flex-col justify-center items-center p-12 bg-primary overflow-hidden">
        {/* Background Image with Overlay */}
        <div
          className="absolute inset-0 z-0 bg-cover bg-center opacity-40 mix-blend-overlay"
          style={{
            backgroundImage:
              "url('https://lh3.googleusercontent.com/aida-public/AB6AXuD92mIN3B68x2FjwTGNj8mRYmnxYdjH34Jyi_kWl8o3NaNakd2UTUp4NMMgj2bzGdksSPVzDcvkfZJEryvI55s6vwe7r0fuKHfd2NBZE8OP3AudtAcBPLjaU8hKudXXdagJ-6hg2zfWXR3v3pNFaqzaAkpacvNFClyr8Rb9j_ndluD6aR4bZgIQ67D5gMX8YBc1xEVYaGgA-ykCePaJxR98tMz9zJrxZ3QW76Po9f8IGOJUkUJdR9wMqfIoeAtw5rRYlDtIK9JoyZg')",
          }}
        ></div>
        {/* Abstract Shapes for Modern Look */}
        <div className="absolute top-[-10%] left-[-10%] w-[400px] h-[400px] bg-white/10 rounded-full blur-3xl z-1"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[300px] h-[300px] bg-primary/30 rounded-full blur-3xl z-1"></div>

        {/* Content */}
        <div className="relative z-10 max-w-md text-center">
          <div className="mb-8 flex justify-center">
            <Activity className="text-white h-16 w-16" />
          </div>
          <h2 className="text-white text-3xl font-bold mb-6 italic">
            &quot;Discipline is the bridge between goals and
            accomplishment.&quot;
          </h2>
          <p className="text-white/80 text-lg font-medium">— Jim Rohn</p>
          <div className="mt-12 grid grid-cols-3 gap-4 opacity-70">
            <div className="h-1 bg-white/30 rounded-full"></div>
            <div className="h-1 bg-white rounded-full"></div>
            <div className="h-1 bg-white/30 rounded-full"></div>
          </div>
        </div>
      </div>

      {/* Right Pane: Content */}
      <div className="flex w-full lg:w-1/2 flex-col justify-center items-center px-6 py-12 bg-white dark:bg-background-dark overflow-y-auto">
        <div className="w-full max-w-[440px]">{children}</div>
      </div>
    </div>
  );
}
