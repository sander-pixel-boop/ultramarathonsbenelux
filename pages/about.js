import Head from 'next/head';
import Link from 'next/link';
import { useState } from 'react';

const i18n = {
    en: {
        title: "About Us",
        subtitle: "Benelux Ultra Expertise",
        content1: "Welcome to the Benelux Ultra Race Directory. We are deeply passionate about the toughest footraces and gravel events across Belgium, the Netherlands, and Luxembourg.",
        content2: "Our mission is to provide a comprehensive, accurate, and easy-to-use directory for ultra runners of all levels. Whether you are looking for your first 50k or a multi-day backyard ultra, we curate the best events in the region.",
        content3: "Built by runners, for runners. We understand the specific terrain, weather challenges, and the unique ultra community in the Benelux. This platform is our contribution to growing and supporting this incredible sport.",
        backToHome: "Back to Home",
        footerText: "Made with",
        footerCommunity: "for the ultra running community"
    },
    nl: {
        title: "Over Ons",
        subtitle: "Benelux Ultra Expertise",
        content1: "Welkom bij de Benelux Ultra Race Gids. Wij hebben een diepe passie voor de zwaarste hardloop- en gravel-evenementen in België, Nederland en Luxemburg.",
        content2: "Onze missie is om een uitgebreide, nauwkeurige en gebruiksvriendelijke gids te bieden voor ultra lopers van alle niveaus. Of je nu op zoek bent naar je eerste 50k of een meerdaagse backyard ultra, wij verzamelen de beste evenementen in de regio.",
        content3: "Gemaakt door hardlopers, voor hardlopers. We begrijpen het specifieke terrein, de weersuitdagingen en de unieke ultra-gemeenschap in de Benelux. Dit platform is onze bijdrage aan het laten groeien en ondersteunen van deze geweldige sport.",
        backToHome: "Terug naar Home",
        footerText: "Gemaakt met",
        footerCommunity: "voor de ultra hardloop gemeenschap"
    },
    fr: {
        title: "À Propos de Nous",
        subtitle: "Expertise Ultra Benelux",
        content1: "Bienvenue dans l'Annuaire des Ultra Courses du Benelux. Nous sommes passionnés par les courses à pied et les événements gravel les plus difficiles de Belgique, des Pays-Bas et du Luxembourg.",
        content2: "Notre mission est de fournir un annuaire complet, précis et facile à utiliser pour les ultra-marathoniens de tous niveaux. Que vous cherchiez votre premier 50 km ou un backyard ultra de plusieurs jours, nous sélectionnons les meilleurs événements de la région.",
        content3: "Conçu par des coureurs, pour des coureurs. Nous comprenons le terrain spécifique, les défis météorologiques et la communauté ultra unique du Benelux. Cette plateforme est notre contribution au développement et au soutien de ce sport incroyable.",
        backToHome: "Retour à l'Accueil",
        footerText: "Fait avec",
        footerCommunity: "pour la communauté de l'ultra course"
    }
};

export default function About() {
    const [lang, setLang] = useState('en');
    const t = i18n[lang];

    return (
        <>
            <Head>
                <title>{t.title} - Benelux Ultra Race Directory</title>
                <link rel="preconnect" href="https://fonts.googleapis.com" />
                <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
                <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
                <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" />
            </Head>

            <div className="language-flags">
                <img src="https://flagcdn.com/w40/gb.png" alt="English" title="English" className={`flag ${lang === 'en' ? 'active' : ''}`} onClick={() => setLang('en')} />
                <img src="https://flagcdn.com/w40/nl.png" alt="Nederlands" title="Nederlands" className={`flag ${lang === 'nl' ? 'active' : ''}`} onClick={() => setLang('nl')} />
                <img src="https://flagcdn.com/w40/fr.png" alt="Français" title="Français" className={`flag ${lang === 'fr' ? 'active' : ''}`} onClick={() => setLang('fr')} />
            </div>

            <div className="hero">
                <h1>{t.title}</h1>
                <p>{t.subtitle}</p>
            </div>

            <div className="container" style={{ maxWidth: '800px', lineHeight: '1.6', fontSize: '1.1em' }}>
                <p>{t.content1}</p>
                <p>{t.content2}</p>
                <p>{t.content3}</p>

                <div style={{ marginTop: '40px', textAlign: 'center' }}>
                    <Link href="/" style={{
                        display: 'inline-block',
                        padding: '12px 24px',
                        backgroundColor: '#3b82f6',
                        color: 'white',
                        textDecoration: 'none',
                        borderRadius: '8px',
                        fontWeight: '600',
                        transition: 'background-color 0.2s'
                    }}>
                        <i className="fas fa-arrow-left"></i> {t.backToHome}
                    </Link>
                </div>
            </div>

            <footer>
                <p><span>{t.footerText}</span> <i className="fas fa-heart"></i> <span>{t.footerCommunity}</span></p>
            </footer>
        </>
    );
}
