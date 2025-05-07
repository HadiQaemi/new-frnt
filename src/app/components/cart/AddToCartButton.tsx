'use client';

import React from 'react';
import { Square, Check } from 'lucide-react';
import { useCartStore, Statement } from '@/app/stores/cartStore';
import { useToast } from '@/components/ui/use-toast';

interface AddToCartButtonProps {
    statement: Statement;
    size?: 'sm' | 'md' | 'lg';
    className?: string;
}

const AddToCartButton: React.FC<AddToCartButtonProps> = ({
    statement,
    size = 'md',
    className = '',
}) => {
    const { addItem, removeItem, isInCart } = useCartStore();
    const { toast } = useToast();
    const inCart = isInCart(statement._id);

    const sizeClasses = {
        sm: 'p-1 text-xs',
        md: 'p-2 text-sm',
        lg: 'p-3 text-base',
    };

    const handleClick = (e: React.MouseEvent) => {
        e.stopPropagation();

        if (inCart) {
            removeItem(statement._id);
            toast({
                title: 'Removed from list',
                description: 'Statement has been removed from your list',
                className: 'bg-yellow-100',
            });
        } else {
            addItem(statement);
            toast({
                title: 'Added to list',
                description: 'Statement has been added to your list',
                className: 'bg-green-100',
            });
        }
    };

    return (
        <button
            onClick={handleClick}
            className={`${sizeClasses[size]} ${inCart ? 'text-green-700' : 'text-blue-700'} rounded-full transition-colors flex items-center justify-center ${className}`}
            title={inCart ? 'Remove from list' : 'Add to list'}
        >
            {inCart ? (
                <Check className={size === 'md' ? 'h-3 w-3' : 'h-4 w-4'} />
            ) : (
                <Square className={size === 'md' ? 'h-3 w-3' : 'h-4 w-4'} />
            )}
        </button>
    );
};

export default AddToCartButton;