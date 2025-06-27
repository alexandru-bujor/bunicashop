import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import './CategoryTabs.css';

const categories = [
    { id: 'all', name: 'Toate Categoriile', slug: '' },
    { id: 'garden', name: 'Terasa și Grădină', slug: 'garden' },
    { id: 'sports', name: 'Sport și Aer Liber', slug: 'sports' },
    { id: 'home', name: 'Casă și Bucătărie', slug: 'home' },
    { id: 'electronics', name: 'TV & Electronice', slug: 'electronics' },
    { id: 'auto', name: 'Auto & Moto', slug: 'auto' }
];

const CategoryTabs = () => {
    const [showScrollButtons, setShowScrollButtons] = useState(false);
    const [canScrollLeft, setCanScrollLeft] = useState(false);
    const [canScrollRight, setCanScrollRight] = useState(false);
    const tabsRef = useRef(null);
    const location = useLocation();

    const checkScroll = () => {
        if (tabsRef.current) {
            const { scrollLeft, scrollWidth, clientWidth } = tabsRef.current;
            setShowScrollButtons(scrollWidth > clientWidth);
            setCanScrollLeft(scrollLeft > 0);
            setCanScrollRight(scrollLeft < scrollWidth - clientWidth);
        }
    };

    useEffect(() => {
        checkScroll();
        window.addEventListener('resize', checkScroll);
        return () => window.removeEventListener('resize', checkScroll);
    }, []);

    const scroll = (direction) => {
        if (tabsRef.current) {
            const scrollAmount = direction === 'left' ? -200 : 200;
            tabsRef.current.scrollBy({
                left: scrollAmount,
                behavior: 'smooth'
            });
            setTimeout(checkScroll, 300);
        }
    };

    const getCurrentCategory = () => {
        const path = location.pathname;
        if (path === '/') return 'all';
        const match = path.match(/\/category\/(.+)/);
        return match ? match[1] : 'all';
    };

    const currentCategory = getCurrentCategory();

    return (
        <div className="category-tabs-container">
            {showScrollButtons && canScrollLeft && (
                <button 
                    className="scroll-button left"
                    onClick={() => scroll('left')}
                    aria-label="Scroll left"
                >
                    <FaChevronLeft />
                </button>
            )}
            
            <div className="category-tabs" ref={tabsRef} onScroll={checkScroll}>
                {categories.map((category) => (
                    <Link
                        key={category.id}
                        to={category.id === 'all' ? '/' : `/category/${category.slug}`}
                        className={`category-tab ${currentCategory === category.id ? 'active' : ''}`}
                    >
                        {category.name}
                    </Link>
                ))}
            </div>

            {showScrollButtons && canScrollRight && (
                <button 
                    className="scroll-button right"
                    onClick={() => scroll('right')}
                    aria-label="Scroll right"
                >
                    <FaChevronRight />
                </button>
            )}
        </div>
    );
};

export default CategoryTabs;