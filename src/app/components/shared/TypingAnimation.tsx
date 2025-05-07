import { useState, useEffect } from 'react';

const TypingAnimation = () => {
    const words = ['Accurate.', 'Reusable.', 'Reproducible.'];
    const [currentWordIndex, setCurrentWordIndex] = useState(0);
    const [isVisible, setIsVisible] = useState(true);

    useEffect(() => {
        const interval = setInterval(() => {
            setIsVisible(false);
            setTimeout(() => {
                setCurrentWordIndex((prev) => (prev + 1) % words.length);
                setIsVisible(true);
            }, 200);
        }, 2000);

        return () => clearInterval(interval);
    }, []);

    return (
        <div className="flex items-center justify-center pt-2">
            <div className="relative">
                <div className="flex">
                    <span className="text-[12px] font-semibold whitespace-nowrap">
                        Scientific Knowledge. {` `}
                        <span className={`text-[12px] transition-opacity duration-200 ${isVisible ? 'opacity-100' : 'opacity-0'}`}>
                            {words[currentWordIndex]}
                        </span>
                    </span>
                </div>
            </div>
        </div>
    );
};

export default TypingAnimation;