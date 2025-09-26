'use client'

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import NavbarSkeleton from '../shared/Loading/NavbarSkeleton';
import OrkgLogo from '../../../assets/images/logo.svg';

const Navbar = () => {
    const [isLoading, setIsLoading] = useState(true);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    useEffect(() => {
        const timer = setTimeout(() => {
            setIsLoading(false);
        }, 500);

        return () => clearTimeout(timer);
    }, []);

    if (isLoading) {
        return <NavbarSkeleton />;
    }

    return (
        <nav className="h-[4rem] bg-[#fffcf7] border-b border-gray-200 w-full top-0 z-50 sticky">
            <div className="w-full px-4 mx-auto sm:px-6 md:px-8 lg:px-12 xl:max-w-screen-xl 2xl:max-w-screen-2xl">
                <div className="flex items-center justify-between h-full">
                    <div className="flex items-center animate-fade-in">
                        <Link href="/" className="items-center relative">
                            <Image
                                src={OrkgLogo}
                                alt="ORKG Logo"
                                width={50}
                                height={32}
                                className="object-contain pt-1"
                            />
                            <div className="relative -top-[45px] left-[55px] text-[#191e20] text-md font-bold">
                                <div>TIB Knowledge L<span className="text-[#f08a4b]">oo</span>m</div>
                                <div className='text-[10px] text-[#555] font-semibold'>Weaving Knowledge Threads</div>
                            </div>
                        </Link>
                    </div>
                    <div className="hidden md:flex items-center space-x-8 animate-fade-in">
                        <Link href="/" className="text-[#353839]">
                            Search
                        </Link>
                        <Link href="/pages/submit" className="text-[#353839]">
                            Submit
                        </Link>
                        <Link href="/pages/help" className="text-[#353839]">
                            Help
                        </Link>
                        <Link href="/pages/about" className="text-[#353839]">
                            About
                        </Link>
                        <Link href="/pages/contact-us" className="text-[#353839]">
                            Contact
                        </Link>
                    </div>

                    <div className="md:hidden animate-fade-in">
                        <button
                            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                            className="p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none"
                        >
                            <span className="sr-only">Open menu</span>
                            <svg
                                className="h-6 w-6"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d={isMobileMenuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"}
                                />
                            </svg>
                        </button>
                    </div>
                </div>

                {isMobileMenuOpen && (
                    <div className="md:hidden absolute top-16 left-0 w-full bg-white border-b border-gray-200 animate-fade-in">
                        <div className="px-4 pt-2 pb-3 space-y-1">
                            <Link href="/" className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50">
                                Search
                            </Link>
                            <Link href="/pages/submit" className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50">
                                Submit
                            </Link>
                            <Link href="/pages/help" className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50">
                                Help
                            </Link>
                            <Link href="/pages/about" className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50">
                                About
                            </Link>
                            <Link href="/pages/contact-us" className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50">
                                Contact
                            </Link>
                        </div>
                    </div>
                )}
            </div>
        </nav>
    );
};

export default Navbar;