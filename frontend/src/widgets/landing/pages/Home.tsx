import { Navbar } from '../components/Navbar';
import { Hero } from '../components/Hero';
import { TechStack } from '../components/TechStack';
import { Features } from '../components/Features';
import { CostComparison } from '../components/CostComparison';
import { Projects } from '../components/Projects';
import { Footer } from '../components/Footer';


export const Home = () => {
    return (
        <div className="min-h-screen bg-brand-dark text-slate-300">
            <Navbar />
            <Hero />
            <TechStack />
            <Features />
            <CostComparison />
            <Projects />
            <Footer />
        </div>
    );
};
