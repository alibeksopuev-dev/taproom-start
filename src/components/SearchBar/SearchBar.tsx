import { Search, X } from 'lucide-react';
import { Input } from '#/components/ui/input';
import { Button } from '#/components/ui/button';
import { useUIStore } from '#/lib/store';
import { getTranslation } from '#/lib/i18n/translations';

interface SearchBarProps {
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export function SearchBar({ value = '', onChange, placeholder, className }: SearchBarProps) {
  const { language } = useUIStore();
  const t = getTranslation(language);

  const handleClear = () => {
    onChange?.('');
  };

  return (
    <div className={`relative ${className || ''}`}>
      <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
        <Search size={18} className="text-gray-400" />
      </div>

      <Input
        type="text"
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        placeholder={placeholder || t.searchPlaceholder}
        className="pl-10 pr-10 h-12 text-base"
      />

      {value && (
        <Button
          variant="ghost"
          size="sm"
          onClick={handleClear}
          className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 p-0"
        >
          <X size={18} />
        </Button>
      )}
    </div>
  );
}
