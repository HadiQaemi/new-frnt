'use client'

import React from 'react';
import Link from 'next/link';
import vertical_logo from '../../../assets/images/vertical_logo.svg';
import Image from 'next/image';

const Footer = () => {
    const footerSections = {
        orkg: {
            logo: true,
            title: 'ORKG',
            description: 'ORKG reborn is a digital library for reborn articles where scientific knowledge is born reusable.',
        },
        about: {
            title: 'About',
            links: [
                { text: 'About us', href: '/pages/about' },
                { text: 'Help center', href: '/pages/help' },
                { text: 'Data protection (Info sheet)', href: '/pages/data-protection' },
                { text: 'Terms of use', href: '/pages/terms-of-use' },
                { text: 'Imprint', href: '/pages/imprint' },
            ],
        },
        technical: {
            title: 'Technical',
            links: [
                { text: 'User experiences', href: '/pages/user-experiences' },
                { text: 'GitLab', href: 'https://gitlab.com/TIBHannover/orkg/orkg-reborn' },
                { text: 'License', href: '/pages/license' },
                { text: 'Report issue', href: 'https://gitlab.com/TIBHannover/orkg/orkg-reborn/frontend/issues/' },
            ],
        },
        more: {
            title: 'More',
            links: [
                { text: 'Follow us', href: 'https://mastodon.social/@orkg' },
                { text: 'Contact us', href: '/pages/contact-us' },
                { text: 'Accessibility', href: '/pages/accessibility' },
            ],
        },
    };

    return (
        <footer className="bg-gray-100 pt-6 pb-4 border-t border-gray-200 min-h-[15.1rem]">
            <div className="w-full px-4 mx-auto sm:px-6 md:px-8 lg:px-12 xl:max-w-screen-xl 2xl:max-w-screen-2xl">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                    <div>
                        <h3 className="font-inter font-bold text-gray-800 text-lg mb-3 h-5"></h3>
                        <div className="mb-4">
                            <span className="inline-block pr-5 relative">
                                <Image
                                    src={vertical_logo}
                                    alt="ORKG Logo"
                                    width={60}
                                    height={100}
                                    className="object-contain pt-1"
                                />
                                <div className="absolute left-[20px] -bottom-[15px]">
                                    <span className="text-[12px]">
                                        <span className="font-black text-[#e86161]">re</span>
                                        <span>born</span>
                                    </span>
                                </div>
                            </span>
                            <div className='font-inter font-[400] text-md inline-block w-3/4 text-left align-top pt-2.5'>
                                {footerSections.orkg.description}
                            </div>
                        </div>
                    </div>

                    <div>
                        <h3 className="font-inter font-bold text-gray-800 text-lg mb-3">{footerSections.about.title}</h3>
                        <ul>
                            {footerSections.about.links.map((link) => (
                                <li key={link.href}>
                                    <Link href={link.href} className="font-[400] text-md leading-7 hover:text-gray-900">
                                        {link.text}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div>
                        <h3 className="font-inter font-bold text-gray-800 text-lg mb-3">{footerSections.technical.title}</h3>
                        <ul>
                            {footerSections.technical.links.map((link) => (
                                <li key={link.href}>
                                    <Link href={link.href} className="font-[400] text-md leading-7 hover:text-gray-900">
                                        {link.text}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div>
                        <h3 className="font-inter font-bold text-gray-800 text-lg mb-3">{footerSections.more.title}</h3>
                        <ul>
                            {footerSections.more.links.map((link) => (
                                <li key={link.href}>
                                    <Link href={link.href} className="font-[400] text-md leading-7 hover:text-gray-900">
                                        {link.text}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                        <div className="font-[400] text-md leading-7">
                            <span>Version </span>
                            <span className="bg-gray-200 px-2 py-1 rounded">0.001.1</span>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;