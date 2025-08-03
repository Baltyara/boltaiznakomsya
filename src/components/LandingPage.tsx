import React from 'react';
import HeroSection from './landing/HeroSection';
import ProblemSolutionSection from './landing/ProblemSolutionSection';
import FeaturesSection from './landing/FeaturesSection';
import HowItWorksSection from './landing/HowItWorksSection';
import SocialProofSection from './landing/SocialProofSection';
import CTASection from './landing/CTASection';
import Footer from './landing/Footer';

const LandingPage = () => (
    <div className="min-h-screen bg-gradient-voice-subtle">
    <HeroSection />
    <ProblemSolutionSection />
    <FeaturesSection />
    <HowItWorksSection />
    <SocialProofSection />
    <CTASection />
    <Footer />
    </div>
  );

export default LandingPage;