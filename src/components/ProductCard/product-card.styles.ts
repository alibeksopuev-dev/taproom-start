import { cva } from 'class-variance-authority';

export const productCardStyles = cva(
  [
    'group relative w-full min-w-0 overflow-hidden',
    'bg-white border border-gray-200',
    'transition-all duration-200',
    'hover:shadow-md hover:border-gray-300',
  ],
  {
    variants: {
      variant: {
        default: 'p-4',
        compact: 'p-3',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

export const productNameStyles = cva([
  'text-base font-semibold text-gray-900',
  'mb-2',
]);

export const productDescriptionStyles = cva([
  'text-sm text-gray-600',
  'mb-3',
]);

export const productPriceStyles = cva([
  'text-lg font-bold text-gray-900',
  'mb-3',
]);

export const productMetadataStyles = cva([
  'flex flex-wrap gap-2 mb-2',
]);

export const metadataBadgeStyles = cva([
  'text-xs px-2 py-1',
  'bg-gray-100 text-gray-700',
  'rounded-full',
  'font-medium',
]);
