const NavbarSkeleton = () => {
    return (
        <div className="h-[4.5rem] bg-[#FDF6EB] border-b border-gray-200 w-full top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 h-full">
                <div className="flex items-center justify-between h-full">
                    <div className="flex items-center">
                        <div className="h-8 w-32 bg-gray-200 rounded animate-pulse"></div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default NavbarSkeleton;