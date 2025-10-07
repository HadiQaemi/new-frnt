'use client'

import React from 'react';
import Link from 'next/link';
import OrkgLogo from '../../../assets/images/logo.svg';
import Image from 'next/image';

const Footer = () => {
    const footerSections = {
        orkg: {
            logo: true,
            title: 'ORKG',
            description: 'TIB Knowledge Loom is a digital library of machine-readable scientific knowledge.',
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
        <footer className="pt-6 pb-4 border-t border-gray-200 min-h-[15.1rem] bg-[#1e3a5f]">
            <section className="w-full px-4 mx-auto sm:px-6 md:px-8 lg:px-12 xl:max-w-screen-xl 2xl:max-w-screen-2xl">
                <ul className="grid grid-cols-1 md:grid-cols-3 gap-8 list-none p-0 m-0">
                    <li>
                        <h3 className="font-inter font-bold text-[#FDF6EC] text-lg mb-3">
                            {footerSections.about.title}
                        </h3>
                        <ul>
                            {footerSections.about.links.map(link => (
                                <li key={link.href}>
                                    <Link href={link.href} className="font-[400] text-md leading-7 text-[#FDF6EC]">
                                        {link.text}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </li>
                    <li>
                        <h3 className="font-inter font-bold text-[#FDF6EC] text-lg mb-3">
                            {footerSections.technical.title}
                        </h3>
                        <ul>
                            {footerSections.technical.links.map(link => (
                                <li key={link.href}>
                                    <Link href={link.href} className="font-[400] text-md leading-7 text-[#FDF6EC]">
                                        {link.text}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </li>
                    <li>
                        <h3 className="font-inter font-bold text-[#FDF6EC] text-lg mb-3">
                            {footerSections.more.title}
                        </h3>
                        <ul>
                            {footerSections.more.links.map(link => (
                                <li key={link.href}>
                                    <Link href={link.href} className="font-[400] text-md leading-7 text-[#FDF6EC]">
                                        {link.text}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                        <p className="font-[400] text-md leading-7 text-[#FDF6EC] mt-2">
                            Version <span className="bg-gray-200 px-2 py-1 rounded text-[#1e3a5f]">0.001.1</span>
                        </p>
                    </li>

                </ul>
            </section>
        </footer>
    );
};

export default Footer;