import React from 'react';
import { Link } from 'react-router-dom';
import { TestRideForm } from '../components/test-rides/TestRideForm';

const motorcycles = [
  {
    id: 1,
    name: 'Rocket 3',
    category: 'Roadster',
    description: 'Le roadster ultime avec le moteur trois cylindres le plus puissant au monde.',
    image: 'https://thegoodlife.fr/wp-content/uploads/sites/2/2020/04/numerisation-tgl-43-motos-roadsters-insert-benelli.jpg',
    features: [
      'Moteur 3 cylindres 2500cc',
      'Couple maximal : 221 Nm',
      'Puissance : 167 ch'
    ]
  },
  {
    id: 2,
    name: 'Tiger 900',
    category: 'Adventure',
    description: 'L\'aventure sans compromis, conçue pour les terrains les plus difficiles.',
    image: 'https://cdn.shopify.com/s/files/1/0951/1406/files/2023-suzuki-v-strom-1050de.png?v=1683226878',
    features: [
      'Suspension réglable',
      'Modes de conduite multiples',
      'Pneus tout-terrain'
    ]
  },
  {
    id: 3,
    name: 'Bonneville T120',
    category: 'Classic',
    description: 'Le classique intemporel, symbole de l\'élégance britannique.',
    image: 'https://fcr-original.com/wp-content/uploads/2023/05/TRIUMPH-STREET-TWIN-ALIENOR-03-2-1280x905.webp',
    features: [
      'Design rétro moderne',
      'Moteur refroidi par air',
      'Technologie avancée'
    ]
  }
];

const Home: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-100">
      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white shadow-md">
        <div className="container flex items-center justify-between px-4 py-4 mx-auto">
          <div className="text-3xl font-bold tracking-wider text-gray-800">
            TRIUMPH
          </div>
          <Link 
            to="/login" 
            className="px-6 py-2 text-sm font-semibold text-white transition duration-300 bg-red-700 rounded-full hover:bg-red-800"
          >
            Connexion
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <header className="pt-20 bg-gradient-to-br from-gray-100 to-gray-200">
        <div className="container px-4 py-16 mx-auto text-center">
          <h1 className="mb-6 text-5xl font-bold text-gray-900 md:text-6xl">
            Découvrez la Légende Triumph
          </h1>
          <p className="max-w-2xl mx-auto mb-12 text-xl text-gray-600">
            Chaque moto raconte une histoire. Découvrez notre héritage, notre passion et notre innovation.
          </p>
        </div>
      </header>

      {/* Motorcycle Showcase */}
      <section className="container px-4 py-16 mx-auto">
        <div className="grid gap-8 md:grid-cols-3">
          {motorcycles.map((moto) => (
            <div 
              key={moto.id} 
              className="overflow-hidden transition transform bg-white shadow-lg rounded-xl hover:scale-105 hover:shadow-xl"
            >
              <img 
                src={moto.image} 
                alt={moto.name} 
                className="object-cover w-full h-64"
              />
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-2xl font-bold text-gray-900">{moto.name}</h2>
                  <span className="px-2 py-1 text-xs text-red-800 bg-red-100 rounded-full">
                    {moto.category}
                  </span>
                </div>
                <p className="mb-4 text-gray-600">{moto.description}</p>
                <div className="space-y-2">
                  {moto.features.map((feature, index) => (
                    <div key={index} className="flex items-center text-gray-700">
                      <svg className="w-5 h-5 mr-2 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      {feature}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Test Ride Reservation */}
      <section className="py-16 text-white bg-gray-900">
        <div className="container px-4 mx-auto">
          <div className="max-w-2xl mx-auto">
            <h2 className="mb-12 text-4xl font-bold text-center">Réservez Votre Essai</h2>
            <TestRideForm />
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 text-white bg-gray-900">
        <div className="container px-4 mx-auto text-center">
          <p>&copy; 2025 Triumph Motorcycles. Tous droits réservés.</p>
        </div>
      </footer>
    </div>
  );
};

export default Home;