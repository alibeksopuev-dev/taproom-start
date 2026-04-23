import { ArrowRight } from 'lucide-react';
import { Link } from '@tanstack/react-router';
import type { Category } from '#/types/menu';
import type { Language } from '#/types/i18n';
import {
  categoryButtonStyles,
  categoryNumberStyles,
  categoryNameStyles,
  categoryArrowStyles,
} from './category-button.styles';

interface CategoryButtonProps {
  category: Category;
  language: Language;
}

export function CategoryButton({ category, language }: CategoryButtonProps) {
  const getCategoryName = () => {
    switch (language) {
      case 'vi': return category.nameVi;
      case 'ja': return category.nameJa;
      case 'ko': return category.nameKo;
      default: return category.name;
    }
  };

  const formattedNumber = `(${String(category.order).padStart(2, '0')})`;

  return (
    <Link to="/category/$categoryId" params={{ categoryId: category.id }} className={categoryButtonStyles()}>
      <div className="flex gap-4 items-start">
        <span className={categoryNumberStyles()}>{formattedNumber}</span>
        <span className={categoryNameStyles()}>{getCategoryName()}</span>
      </div>
      <ArrowRight className={categoryArrowStyles()} size={28} />
    </Link>
  );
}
