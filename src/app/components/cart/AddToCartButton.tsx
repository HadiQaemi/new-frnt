'use client';

import React, { useEffect, useState } from 'react';
import { Square, Check } from 'lucide-react';
import { useCartStore, Statement } from '@/app/stores/cartStore';
import { useToast } from '@/components/ui/use-toast';

interface AddToCartButtonProps {
    statement: any;
    article: any;
    size?: 'sm' | 'md' | 'lg';
    className?: string;
}

const AddToCartButton: React.FC<AddToCartButtonProps> = ({
    statement,
    article,
    size = 'md',
    className = '',
}) => {
    const { addItem, removeItem, isInCart } = useCartStore();
    const { toast } = useToast();
    const [isLoad, setIsLoad] = useState(false);
    useEffect(() => {
        if (typeof window !== 'undefined') {
            setIsLoad(true)
        }
    }, []);
    const inCart = isInCart(statement.statement_id);

    const sizeClasses = {
        sm: 'p-1 text-xs',
        md: 'p-2 text-sm',
        lg: 'p-3 text-base',
    };

    const handleClick = (e: React.MouseEvent) => {
        e.stopPropagation();

        if (inCart) {
            removeItem(statement.statement_id);
            toast({
                title: 'Removed from list',
                description: 'Statement has been removed from your list',
                className: 'bg-yellow-100',
            });
        } else {
            addItem(statement, article);
            toast({
                title: 'Added to list',
                description: 'Statement has been added to your list',
                className: 'bg-green-100',
            });
        }
    };

    return (
        isLoad ? (
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
        ) : (
            <div className={`${sizeClasses[size]} rounded-full flex items-center justify-center ${className}`}>
                <div className={`${size === 'md' ? 'h-3 w-3' : 'h-4 w-4'} animate-spin rounded-full border-2 border-gray-300 border-t-blue-600`}></div>
            </div>
        )
    );
};

export default AddToCartButton;