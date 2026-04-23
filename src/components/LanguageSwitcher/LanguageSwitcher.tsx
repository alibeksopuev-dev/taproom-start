import { Globe } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '#/components/ui/select';
import { useUIStore } from '#/lib/store';
import type { Language } from '#/types/i18n';

const languages: Array<{ code: Language; label: string }> = [
  { code: 'en', label: 'EN' },
  { code: 'vi', label: 'VN' },
  { code: 'ja', label: 'JP' },
  { code: 'ko', label: 'KR' },
];

export function LanguageSwitcher() {
  const { language, setLanguage } = useUIStore();

  const currentLanguage = languages.find((lang) => lang.code === language);

  return (
    <Select value={language} onValueChange={(value) => setLanguage(value as Language)}>
      <SelectTrigger className="min-h-[44px] w-[70px] border-0 bg-transparent hover:bg-gray-100 [&>svg]:hidden">
        <div className="flex items-center gap-2">
          <Globe size={14} />
          <SelectValue>
            <span className="font-medium">{currentLanguage?.label}</span>
          </SelectValue>
        </div>
      </SelectTrigger>
      <SelectContent className="min-w-[70px] bg-white border-gray-300">
        {languages.map((lang) => (
          <SelectItem key={lang.code} value={lang.code} className="cursor-pointer">
            <span className="font-medium">{lang.label}</span>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
