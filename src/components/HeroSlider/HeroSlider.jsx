import React, { useState, useEffect } from 'react';
import './HeroSlider.css';

const slides = [
    {
        id: 1,
        image: '/img/hero/slide1.jpg',
        title: 'Summer Collection',
        subtitle: 'Up to 50% Off',
        description: 'Discover our latest summer collection with amazing discounts',
        buttonText: 'Shop Now',
        buttonLink: '/summer-collection'
    },
    {
        id: 2,
        image: '/img/hero/slide2.jpg',
        title: 'New Arrivals',
        subtitle: 'Fresh Styles',
        description: 'Check out our newest products and trending items',
        buttonText: 'Explore',
        buttonLink: '/new-arrivals'
    },
    {
        id: 3,
        image: '/img/hero/slide3.jpg',
        title: 'Special Offers',
        subtitle: 'Limited Time',
        description: 'Don\'t miss out on our exclusive deals and promotions',
        buttonText: 'View Deals',
        buttonLink: '/special-offers'
    }
];

export default function HeroSlider() {
    const [currentSlide, setCurrentSlide] = useState(0);
    const [isAnimating, setIsAnimating] = useState(false);

    useEffect(() => {
        const interval = setInterval(() => {
            nextSlide();
        }, 5000);

        return () => clearInterval(interval);
    }, [currentSlide]);

    const nextSlide = () => {
        if (!isAnimating) {
            setIsAnimating(true);
            setCurrentSlide((prev) => (prev + 1) % slides.length);
            setTimeout(() => setIsAnimating(false), 500);
        }
    };

    const prevSlide = () => {
        if (!isAnimating) {
            setIsAnimating(true);
            setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
            setTimeout(() => setIsAnimating(false), 500);
        }
    };

    const goToSlide = (index) => {
        if (!isAnimating && index !== currentSlide) {
            setIsAnimating(true);
            setCurrentSlide(index);
            setTimeout(() => setIsAnimating(false), 500);
        }
    };

    return (
        <div className="hero-slider">
            <div className="slider-container">
                {slides.map((slide, index) => (
                    <div
                        key={slide.id}
                        className={`slide ${index === currentSlide ? 'active' : ''}`}
                        style={{ backgroundImage: `url(${slide.image})` }}
                    >
                        <div className="slide-content">
                            <h2 className="slide-subtitle">{slide.subtitle}</h2>
                            <h1 className="slide-title">{slide.title}</h1>
                            <p className="slide-description">{slide.description}</p>
                            <a href={slide.buttonLink} className="slide-button">
                                {slide.buttonText}
                            </a>
                        </div>
                    </div>
                ))}
            </div>

            <button className="slider-nav prev" onClick={prevSlide}>
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
            </button>
            <button className="slider-nav next" onClick={nextSlide}>
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
            </button>

            <div className="slider-dots">
                {slides.map((_, index) => (
                    <button
                        key={index}
                        className={`slider-dot ${index === currentSlide ? 'active' : ''}`}
                        onClick={() => goToSlide(index)}
                    />
                ))}
            </div>
        </div>
    );
}
