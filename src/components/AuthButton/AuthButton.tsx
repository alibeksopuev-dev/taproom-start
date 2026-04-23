import { useState, useRef, useEffect } from 'react';
import { LogOut, Percent } from 'lucide-react';
import { Button } from '#/components/ui/button';
import { LanguageSwitcher } from '#/components/LanguageSwitcher/LanguageSwitcher';
import { useAuthStore } from '#/lib/authStore';
import { useUIStore } from '#/lib/store';
import { getTranslation } from '#/lib/i18n/translations';

export function AuthButton() {
    const { user, isLoading, discount, signInWithGoogle, signOut } = useAuthStore();
    const { language } = useUIStore();
    const t = getTranslation(language);
    const [showDropdown, setShowDropdown] = useState(false);
    const [signingIn, setSigningIn] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Close dropdown on outside click — but ignore clicks inside Radix UI portals
    // (e.g. the LanguageSwitcher's Select dropdown, which renders outside the DOM tree)
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            const target = event.target as Element;
            // Radix portals are wrapped in [data-radix-popper-content-wrapper]
            if (target.closest?.('[data-radix-popper-content-wrapper]')) return;
            if (dropdownRef.current && !dropdownRef.current.contains(target)) {
                setShowDropdown(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    if (isLoading) return null;

    const handleGoogleSignIn = async () => {
        try {
            setSigningIn(true);
            await signInWithGoogle();
        } catch {
            setSigningIn(false);
        }
    };

    const handleSignOut = async () => {
        setShowDropdown(false);
        await signOut();
    };

    // Not signed in — show compact language switcher + sign-in button
    if (!user) {
        return (
            <div className="flex items-center">
                <LanguageSwitcher />
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleGoogleSignIn}
                    disabled={signingIn}
                    className="min-h-[44px] px-2 text-xs font-medium text-gray-600 hover:text-gray-900"
                    title={t.signIn}
                >
                    {signingIn ? (
                        <div className="h-5 w-5 animate-spin rounded-full border-2 border-gray-400 border-t-transparent" />
                    ) : (
                        <svg width="18" height="18" viewBox="0 0 24 24" className="mr-1">
                            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
                            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                        </svg>
                    )}
                    <span className="hidden sm:inline">{t.signIn}</span>
                </Button>
            </div>
        );
    }

    // Signed in — show avatar with optional discount badge
    const avatarUrl = user.user_metadata?.avatar_url || user.user_metadata?.picture;
    const displayName = user.user_metadata?.full_name || user.user_metadata?.name || user.email;

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={() => setShowDropdown(!showDropdown)}
                className="flex items-center gap-1.5 min-h-[44px] px-1 rounded-md hover:bg-gray-100 transition-colors"
            >
                {avatarUrl ? (
                    <img
                        src={avatarUrl}
                        alt={displayName || ''}
                        className="h-7 w-7 rounded-full border border-gray-200"
                        referrerPolicy="no-referrer"
                    />
                ) : (
                    <div className="h-7 w-7 rounded-full bg-gray-300 flex items-center justify-center text-xs font-bold text-gray-600">
                        {(displayName || '?')[0].toUpperCase()}
                    </div>
                )}

                {/* Discount badge */}
                {discount && (
                    <span className="inline-flex items-center gap-0.5 bg-green-100 text-green-700 text-xs font-semibold px-1.5 py-0.5 rounded-full">
                        <Percent size={10} />
                        {discount.discount_percent}
                    </span>
                )}
            </button>

            {/* Dropdown */}
            {showDropdown && (
                <div className="absolute right-0 top-full mt-1 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                    {/* User info */}
                    <div className="px-3 py-2 border-b border-gray-100">
                        <p className="text-sm font-medium text-gray-900 truncate">{displayName}</p>
                        <p className="text-xs text-gray-500 truncate">{user.email}</p>
                    </div>

                    {/* Discount info */}
                    {discount && (
                        <div className="px-3 py-2 border-b border-gray-100">
                            <div className="flex items-center gap-2">
                                <span className="inline-flex items-center gap-1 bg-green-100 text-green-700 text-xs font-semibold px-2 py-1 rounded-full">
                                    <Percent size={12} />
                                    {discount.discount_percent}% {t.discount}
                                </span>
                            </div>
                            {discount.label && (
                                <p className="text-xs text-gray-500 mt-1">{discount.label}</p>
                            )}
                        </div>
                    )}

                    {/* Language switcher */}
                    <div className="px-3 py-2 border-b border-gray-100 flex items-center justify-between">
                        <span className="text-sm text-gray-500">Language</span>
                        <LanguageSwitcher />
                    </div>

                    {/* Sign out */}
                    <button
                        onClick={handleSignOut}
                        className="flex items-center gap-2 w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                        <LogOut size={16} />
                        {t.signOut}
                    </button>
                </div>
            )}
        </div>
    );
}
