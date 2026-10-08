import React, { useRef, useEffect } from 'react';
import { StudentProfile } from '../../types';
import { soundManager } from '../../utils/audio';
import { Award, Download, Printer, Sparkles, CheckCircle2 } from 'lucide-react';

interface CertificateGeneratorProps {
  profile: StudentProfile;
}

export const CertificateGenerator: React.FC<CertificateGeneratorProps> = ({ profile }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const currentDate = new Date().toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  const gradeText =
    profile.grade === 'grade3-5' ? 'Elementary Computer Essentials (Grades 3-5)' : 'Middle School Computer Essentials (Grades 6-8)';

  // Draw certificate on high-res canvas
  const drawCertificate = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // High resolution setup (1600 x 1130 for crisp 300 DPI print quality)
    canvas.width = 1600;
    canvas.height = 1130;

    // Background fill (Rich deep obsidian with gold/slate borders)
    ctx.fillStyle = '#090d16';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Outer subtle gold hairline border
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 4;
    ctx.strokeRect(36, 36, canvas.width - 72, canvas.height - 72);

    // Inner gold decorative border
    ctx.strokeStyle = '#10b981';
    ctx.lineWidth = 2;
    ctx.strokeRect(52, 52, canvas.width - 104, canvas.height - 104);

    // Header Kicker
    ctx.font = 'bold 24px "Plus Jakarta Sans", sans-serif';
    ctx.fillStyle = '#10b981';
    ctx.textAlign = 'center';
    ctx.letterSpacing = '6px';
    ctx.fillText('BYTEQUEST ACADEMY OF COMPUTING', 800, 150);

    // Main Title
    ctx.font = '800 64px "Plus Jakarta Sans", sans-serif';
    ctx.fillStyle = '#ffffff';
    ctx.letterSpacing = '1px';
    ctx.fillText('CERTIFICATE OF ACHIEVEMENT', 800, 240);

    // Subtitle
    ctx.font = '30px "Plus Jakarta Sans", sans-serif';
    ctx.fillStyle = '#94a3b8';
    ctx.fillText('THIS HONORS AND CERTIFIES THAT', 800, 320);

    // Student Name (large, highlighted)
    ctx.font = 'bold 74px "Plus Jakarta Sans", sans-serif';
    ctx.fillStyle = '#38bdf8';
    ctx.fillText(profile.name || 'Student Explorer', 800, 430);

    // Decorative underline under name
    ctx.strokeStyle = '#10b981';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(400, 465);
    ctx.lineTo(1200, 465);
    ctx.stroke();

    // Body Text
    ctx.font = '28px "Plus Jakarta Sans", sans-serif';
    ctx.fillStyle = '#cbd5e1';
    ctx.fillText(
      `has demonstrated exemplary mastery in ${gradeText},`,
      800,
      540
    );
    ctx.fillText(
      'successfully completing interactive curricula in Algorithmic Coding Logic, Touch Typing Speed,',
      800,
      590
    );
    ctx.fillText(
      'Digital Citizenship & Cyber Safety Ethics, and Computer Architecture.',
      800,
      640
    );

    // 4 Mastery Badges row
    const badgeY = 770;
    const badges = [
      { label: 'Algorithmic Coding', color: '#10b981', x: 380 },
      { label: 'Touch Typing Speed', color: '#38bdf8', x: 660 },
      { label: 'Cyber Citizenship', color: '#a855f7', x: 940 },
      { label: 'Computer Systems', color: '#f59e0b', x: 1220 },
    ];

    badges.forEach((b) => {
      // Circle seal
      ctx.beginPath();
      ctx.arc(b.x, badgeY, 46, 0, Math.PI * 2);
      ctx.fillStyle = '#1e293b';
      ctx.fill();
      ctx.strokeStyle = b.color;
      ctx.lineWidth = 3;
      ctx.stroke();

      // Checkmark icon
      ctx.font = 'bold 32px sans-serif';
      ctx.fillStyle = b.color;
      ctx.fillText('✓', b.x, badgeY + 11);

      // Label
      ctx.font = 'bold 19px "Plus Jakarta Sans", sans-serif';
      ctx.fillStyle = '#e2e8f0';
      ctx.fillText(b.label, b.x, badgeY + 80);
    });

    // Date and Signature footer
    const footerY = 990;
    ctx.font = '22px "Plus Jakarta Sans", sans-serif';
    ctx.fillStyle = '#94a3b8';
    ctx.textAlign = 'left';
    ctx.fillText(`Issued: ${currentDate}`, 150, footerY);
    ctx.fillText(`Total Experience: ${profile.xp} XP`, 150, footerY + 35);

    ctx.textAlign = 'right';
    ctx.font = 'bold 24px "Plus Jakarta Sans", sans-serif';
    ctx.fillStyle = '#ffffff';
    ctx.fillText('ByteQuest Academic Board', 1450, footerY);
    ctx.font = '20px "Plus Jakarta Sans", sans-serif';
    ctx.fillStyle = '#64748b';
    ctx.fillText('Certified Curriculum Verification', 1450, footerY + 30);
  };

  useEffect(() => {
    drawCertificate();
    soundManager.playFanfare();
  }, [profile.name, profile.grade, profile.xp]);

  const handleDownload = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    soundManager.playSuccess();
    const link = document.createElement('a');
    link.download = `ByteQuest_Certificate_${profile.name.replace(/\s+/g, '_')}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  };

  const handlePrint = () => {
    soundManager.playKeyClick();
    window.print();
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
      {/* Header */}
      <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <span>Certification</span>
            <span aria-hidden="true">·</span>
            <span className="text-emerald-400 font-medium">Official Student Honor</span>
            <span aria-hidden="true">·</span>
            <span>Grade 8 Completion</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white mt-1">
            Certificate of Achievement
          </h1>
          <p className="text-sm text-slate-300 mt-0.5 max-w-2xl">
            You've built real digital superpowers! Download or print your verified completion certificate to celebrate your progress.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handlePrint}
            className="flex items-center gap-2 rounded-lg border border-slate-700 bg-slate-800 px-4 py-2 text-xs font-semibold text-slate-200 hover:bg-slate-700 transition-colors"
          >
            <Printer className="h-4 w-4" />
            <span>Print</span>
          </button>
          <button
            onClick={handleDownload}
            className="flex items-center gap-2 rounded-lg bg-emerald-500 px-4 py-2 text-xs font-bold text-slate-950 hover:bg-emerald-400 transition-colors shadow-sm"
          >
            <Download className="h-4 w-4" />
            <span>Download PNG</span>
          </button>
        </div>
      </div>

      {/* Interactive Certificate Preview Frame */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-4 sm:p-6 shadow-2xl flex flex-col items-center">
        <div className="w-full max-w-4xl overflow-hidden rounded-xl border border-emerald-500/30 shadow-2xl bg-slate-950">
          <canvas
            ref={canvasRef}
            className="w-full h-auto block select-none"
            style={{ aspectRatio: '1600 / 1130' }}
          />
        </div>

        {/* Verification Checkmarks */}
        <div className="mt-8 grid grid-cols-2 sm:grid-cols-4 gap-4 w-full max-w-4xl">
          {[
            { title: 'Coding Logic', desc: 'Sequencing & Loops' },
            { title: 'Touch Typing', desc: 'Muscle Memory & WPM' },
            { title: 'Cyber Safety', desc: 'Phishing & Upstander' },
            { title: 'Hardware Architecture', desc: 'Components & 8-Bit' },
          ].map((item, idx) => (
            <div
              key={idx}
              className="rounded-xl border border-slate-800 bg-slate-950 p-3.5 text-center"
            >
              <CheckCircle2 className="h-5 w-5 text-emerald-400 mx-auto mb-1.5" />
              <h4 className="font-bold text-xs text-white">{item.title}</h4>
              <p className="text-[11px] text-slate-400 mt-0.5">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
