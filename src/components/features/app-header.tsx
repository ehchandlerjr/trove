'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Avatar } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { TroveIcon, TroveText } from '@/components/ui/logo';
import { ThemeToggle } from '@/components/features/theme-toggle';
import { createClient } from '@/lib/db/client';
import { LogOut, Plus, Settings, User } from 'lucide-react';

interface AppHeaderProps {
  user: {
    id: string;
    email: string;
    display_name: string | null;
    avatar_url: string | null;
  };
}

export function AppHeader({ user }: AppHeaderProps) {
  const router = useRouter();
  const [showMenu, setShowMenu] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const menuRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const menuItemsRef = useRef<(HTMLAnchorElement | HTMLButtonElement | null)[]>([]);

  const menuItems = [
    { type: 'link' as const, href: '/settings', icon: Settings, label: 'Settings' },
    { type: 'link' as const, href: '/profile', icon: User, label: 'Profile' },
    { type: 'button' as const, action: 'signout', icon: LogOut, label: 'Sign out', danger: true },
  ];

  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/');
    router.refresh();
  };

  const closeMenu = useCallback(() => {
    setShowMenu(false);
    setFocusedIndex(-1);
    buttonRef.current?.focus();
  }, []);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (!showMenu) return;

    switch (e.key) {
      case 'Escape':
        e.preventDefault();
        closeMenu();
        break;
      case 'ArrowDown':
        e.preventDefault();
        setFocusedIndex(prev => (prev + 1) % menuItems.length);
        break;
      case 'ArrowUp':
        e.preventDefault();
        setFocusedIndex(prev => (prev - 1 + menuItems.length) % menuItems.length);
        break;
      case 'Home':
        e.preventDefault();
        setFocusedIndex(0);
        break;
      case 'End':
        e.preventDefault();
        setFocusedIndex(menuItems.length - 1);
        break;
      case 'Tab':
        // Allow tab to close menu and move focus naturally
        closeMenu();
        break;
    }
  }, [showMenu, menuItems.length, closeMenu]);

  // Focus management
  useEffect(() => {
    if (focusedIndex >= 0 && menuItemsRef.current[focusedIndex]) {
      menuItemsRef.current[focusedIndex]?.focus();
    }
  }, [focusedIndex]);

  // Keyboard listener
  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  // Focus first item when menu opens
  useEffect(() => {
    if (showMenu) {
      setFocusedIndex(0);
    }
  }, [showMenu]);

  const handleButtonKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown' || e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      setShowMenu(true);
    }
  };

  return (
    <header className="bg-[var(--color-surface)]/80 backdrop-blur-sm border-b border-[var(--color-border-subtle)] sticky top-0 z-50">
      <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/dashboard" className="flex items-center gap-2 text-[var(--color-text)] hover:text-[var(--color-accent)] transition-colors">
          <TroveIcon size="sm" />
          <TroveText className="text-xl" />
        </Link>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <Link href="/lists/new">
            <Button size="sm">
              <Plus className="h-4 w-4" />
              New List
            </Button>
          </Link>

          {/* Theme Toggle */}
          <ThemeToggle />

          {/* User Menu */}
          <div className="relative" ref={menuRef}>
            <button
              ref={buttonRef}
              onClick={() => setShowMenu(!showMenu)}
              onKeyDown={handleButtonKeyDown}
              className="flex items-center gap-2 p-1 rounded-full hover:bg-[var(--color-bg-subtle)] transition-colors"
              aria-label="User menu"
              aria-expanded={showMenu}
              aria-haspopup="menu"
            >
              <Avatar 
                src={user.avatar_url} 
                name={user.display_name || user.email} 
                size="sm" 
              />
            </button>

            {showMenu && (
              <>
                <div 
                  className="fixed inset-0 z-10" 
                  onClick={closeMenu} 
                />
                <div 
                  className="absolute right-0 top-full mt-2 w-56 bg-[var(--color-surface)] rounded-xl shadow-[var(--shadow-xl)] border border-[var(--color-border-subtle)] py-2 z-20"
                  role="menu"
                  aria-label="User menu"
                >
                  <div className="px-4 py-2 border-b border-[var(--color-border-subtle)]">
                    <p className="font-medium text-[var(--color-text)] truncate">
                      {user.display_name || 'User'}
                    </p>
                    <p className="text-sm text-[var(--color-text-secondary)] truncate">{user.email}</p>
                  </div>
                  
                  <div className="py-1">
                    {menuItems.map((item, index) => {
                      const Icon = item.icon;
                      const isFocused = focusedIndex === index;
                      
                      if (item.type === 'link') {
                        return (
                          <Link
                            key={item.href}
                            ref={el => { menuItemsRef.current[index] = el; }}
                            href={item.href}
                            className={`flex items-center gap-2 px-4 py-2 text-[var(--color-text-secondary)] hover:text-[var(--color-text)] hover:bg-[var(--color-bg-subtle)] transition-colors outline-none ${isFocused ? 'bg-[var(--color-bg-subtle)] text-[var(--color-text)]' : ''}`}
                            onClick={closeMenu}
                            role="menuitem"
                            tabIndex={-1}
                          >
                            <Icon className="h-4 w-4" aria-hidden="true" />
                            {item.label}
                          </Link>
                        );
                      }
                      
                      return (
                        <button
                          key={item.action}
                          ref={el => { menuItemsRef.current[index] = el; }}
                          onClick={() => {
                            if (item.action === 'signout') {
                              handleSignOut();
                            }
                            closeMenu();
                          }}
                          className={`flex items-center gap-2 px-4 py-2 w-full transition-colors outline-none ${
                            item.danger 
                              ? `text-[var(--color-danger)] hover:bg-[var(--color-danger-bg)] ${isFocused ? 'bg-[var(--color-danger-bg)]' : ''}`
                              : `text-[var(--color-text-secondary)] hover:text-[var(--color-text)] hover:bg-[var(--color-bg-subtle)] ${isFocused ? 'bg-[var(--color-bg-subtle)] text-[var(--color-text)]' : ''}`
                          }`}
                          role="menuitem"
                          tabIndex={-1}
                        >
                          <Icon className="h-4 w-4" aria-hidden="true" />
                          {item.label}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
