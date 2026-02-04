import { useEffect, useState } from 'react';
import { useLanguage } from '../i18n/LanguageContext';

// ⚙️ SETTINGS - เปลี่ยน URL รูปตรงนี้
const POPUP_IMAGE_TH = '/achievement-popup-th.png';
const POPUP_IMAGE_EN = '/achievement-popup-en.png';

interface AchievementPopupProps {
    isOpen: boolean;
    onClose: () => void;
    completedCount: number;
    totalCount: number;
}

// Elegant Celebration Effects - Clean and beautiful
const CelebrationEffects = () => {
    // Fewer confetti particles for a cleaner look
    const [confetti] = useState(() =>
        Array.from({ length: 40 }, (_, i) => ({
            id: i,
            left: Math.random() * 100,
            delay: Math.random() * 2,
            duration: 3 + Math.random() * 2,
            color: ['#FFD700', '#FF69B4', '#00CED1', '#9370DB', '#FFFFFF'][Math.floor(Math.random() * 5)],
            size: 5 + Math.random() * 5,
            rotation: Math.random() * 360,
            swingAmplitude: 15 + Math.random() * 25,
        }))
    );

    // Subtle sparkles
    const [sparkles] = useState(() =>
        Array.from({ length: 15 }, (_, i) => ({
            id: i,
            left: 5 + Math.random() * 90,
            top: 5 + Math.random() * 70,
            delay: Math.random() * 3,
            duration: 1 + Math.random() * 1,
            size: 2 + Math.random() * 3,
        }))
    );

    return (
        <div className="absolute inset-0 overflow-hidden pointer-events-none z-50">
            {/* Confetti */}
            {confetti.map((p) => (
                <div
                    key={`confetti-${p.id}`}
                    className="absolute animate-confetti-enhanced"
                    style={{
                        left: `${p.left}%`,
                        top: '-10px',
                        animationDelay: `${p.delay}s`,
                        animationDuration: `${p.duration}s`,
                        '--swing': `${p.swingAmplitude}px`,
                    } as React.CSSProperties}
                >
                    <div
                        style={{
                            width: p.size,
                            height: p.size * 1.5,
                            backgroundColor: p.color,
                            transform: `rotate(${p.rotation}deg)`,
                            borderRadius: '1px'
                        }}
                    />
                </div>
            ))}

            {/* Subtle Sparkles */}
            {sparkles.map((s) => (
                <div
                    key={`sparkle-${s.id}`}
                    className="absolute animate-sparkle"
                    style={{
                        left: `${s.left}%`,
                        top: `${s.top}%`,
                        animationDelay: `${s.delay}s`,
                        animationDuration: `${s.duration}s`,
                    }}
                >
                    <div
                        className="bg-white rounded-full opacity-60"
                        style={{
                            width: s.size,
                            height: s.size,
                            boxShadow: `0 0 ${s.size * 3}px ${s.size}px rgba(255,255,255,0.4)`
                        }}
                    />
                </div>
            ))}
        </div>
    );
};

export default function AchievementPopup({ isOpen, onClose, completedCount, totalCount }: AchievementPopupProps) {
    const { language } = useLanguage();
    const [showConfetti, setShowConfetti] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setShowConfetti(true);
            const timer = setTimeout(() => setShowConfetti(false), 5000);
            return () => clearTimeout(timer);
        }
    }, [isOpen]);

    if (!isOpen) return null;

    const shareText = language === 'th'
        ? `🏆 ขอแสดงความยินดี "คุณคือหม่ามี๊ดีเด่น นักล่า EMV ตัวยงของ ฟีมฟีม~"!\n\n✨ ทำ Film x Loewe Mission ครบ ${completedCount}/${totalCount} (100%)!\n\n#LOEWExFilmRacha #filmracha `
        : `🏆 Congratulations! "You're the ultimate supportive fan, always chasing those EMV numbers for FeemFeem~"!\n\n✨ Completed Film x Loewe Mission ${completedCount}/${totalCount} (100%)!\n\n#LOEWExFilmRacha #filmracha`;

    const handleShareToX = () => {
        const encodedText = encodeURIComponent(shareText);
        const xUrl = `https://x.com/intent/tweet?text=${encodedText}`;
        window.open(xUrl, '_blank');
    };

    const handleSaveImage = async () => {
        try {
            const popupImage = language === 'th' ? POPUP_IMAGE_TH : POPUP_IMAGE_EN;
            const response = await fetch(popupImage);
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'film-loewe-achievement.png';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);
        } catch (err) {
            console.error('Save failed:', err);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4" onClick={onClose}>
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/85 backdrop-blur-md" />

            {/* Confetti */}
            {showConfetti && <CelebrationEffects />}

            {/* Modal */}
            <div
                className="relative w-full max-w-md animate-popup"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="bg-gradient-to-b from-slate-800/95 to-slate-900/95 backdrop-blur-xl rounded-3xl border border-amber-400/30 shadow-2xl shadow-amber-500/20 overflow-hidden">
                    {/* Glow effect */}
                    <div className="absolute -inset-1 bg-gradient-to-r from-amber-400 via-pink-500 to-purple-500 rounded-3xl blur-xl opacity-30 animate-pulse" />

                    {/* Content */}
                    <div className="relative">
                        {/* Close button */}
                        <button
                            onClick={onClose}
                            className="absolute top-3 right-3 z-20 w-8 h-8 rounded-full bg-black/50 hover:bg-black/70 flex items-center justify-center text-white/80 hover:text-white transition-colors"
                        >
                            ✕
                        </button>

                        {/* Hero Achievement Image - FULL WIDTH */}
                        <div className="relative w-full aspect-square overflow-hidden">
                            {/* Fallback trophy design (shows behind image) */}
                            <div className="absolute inset-0 bg-gradient-to-br from-amber-600 via-yellow-500 to-amber-700 flex items-center justify-center">
                                <div className="text-center">
                                    <div className="text-8xl">🏆</div>
                                    <div className="text-white font-bold text-xl mt-4">ENGAGEMENT</div>
                                    <div className="text-white font-bold text-xl">CHAMPION</div>
                                </div>
                            </div>
                            {/* Actual image on top */}
                            <img
                                src={language === 'th' ? POPUP_IMAGE_TH : POPUP_IMAGE_EN}
                                alt="Achievement Badge"
                                className="absolute inset-0 w-full h-full object-cover z-10"
                            />
                        </div>

                        {/* Info Section */}
                        <div className="p-5 text-center">
                            {/* Title */}
                            <h2 className="text-2xl font-bold bg-gradient-to-r from-amber-300 via-yellow-200 to-amber-300 bg-clip-text text-transparent mb-2">
                                {language === 'th' ? '🏆 คุณคือหม่ามี๊ดีเด่น นักล่า EMV ตัวยงของ ฟีมฟีม~' : '🏆 You are the ultimate supportive fan, always chasing those EMV numbers for FeemFeem~'}
                            </h2>

                            {/* Description */}
                            <p className="text-white/70 text-sm mb-4">
                                {language === 'th'
                                    ? `ขอแสดงความยินดี! คุณทำ Mission ครบ ${completedCount}/${totalCount} รายการ 🎉`
                                    : `Congratulations! You completed ${completedCount}/${totalCount} tasks 🎉`}
                            </p>

                            {/* Buttons */}
                            <div className="space-y-2">
                                {/* Save Image Button */}
                                <button
                                    onClick={handleSaveImage}
                                    className="w-full py-3 rounded-xl font-semibold bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-900 transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-[1.02] flex items-center justify-center gap-2"
                                >
                                    <span>📥</span>
                                    <span>{language === 'th' ? 'บันทึกรูปไปแชร์' : 'Save Image to Share'}</span>
                                </button>

                                {/* Share to X Button */}
                                <button
                                    onClick={handleShareToX}
                                    className="w-full py-3 rounded-xl font-semibold bg-gradient-to-r from-zinc-700 to-zinc-800 hover:from-zinc-600 hover:to-zinc-700 text-white transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-[1.02] flex items-center justify-center gap-2 border border-white/10"
                                >
                                    <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                                        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                                    </svg>
                                    <span>{language === 'th' ? 'แชร์ไป X' : 'Share to X'}</span>
                                </button>


                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

// Floating button component
export function AchievementFloatingButton({ onClick, isUnlocked }: { onClick: () => void; isUnlocked: boolean }) {
    if (!isUnlocked) return null;

    return (
        <button
            onClick={onClick}
            className="fixed bottom-24 right-4 z-40 w-14 h-14 rounded-full bg-gradient-to-br from-amber-500 to-yellow-600 shadow-lg shadow-amber-500/40 flex items-center justify-center text-2xl hover:scale-110 transition-transform duration-300 border-2 border-amber-300/50 animate-pulse hover:animate-none"
            title="View Achievement"
        >
            🏆
        </button>
    );
}
