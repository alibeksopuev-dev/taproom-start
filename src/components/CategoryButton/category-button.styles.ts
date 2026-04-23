import { cva } from 'class-variance-authority';

export const categoryButtonStyles = cva(
  [
    'group relative flex items-center justify-between',
    'w-full min-h-[100px] py-6 px-2',
    'border-b border-[#C9C6C6]',
    'transition-all duration-200',
    'hover:bg-gray-50/50',
    'touch-manipulation',
  ],
  {
    variants: {
      size: {
        default: 'py-6',
        large: 'py-8',
      },
    },
    defaultVariants: {
      size: 'default',
    },
  }
);

export const categoryNumberStyles = cva([
  'text-xs font-light text-gray-400 mt-1',
  'transition-colors duration-200',
]);

export const categoryNameStyles = cva([
  'text-2xl md:text-4xl font-normal text-gray-800 lowercase tracking-tight',
  'transition-all duration-200',
  'group-hover:underline decoration-1 underline-offset-8',
]);

export const categoryArrowStyles = cva([
  'text-[#C9C6C6] mt-1',
  'transition-all duration-200',
  'group-hover:text-gray-900 group-hover:translate-x-1',
]);
