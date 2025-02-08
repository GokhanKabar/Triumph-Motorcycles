import React, { useState } from 'react';
import { Link } from 'react-router-dom';

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
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    motorcycle: '',
    date: '',
    message: ''
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Réservation d\'essai:', formData);
    // TODO: Ajouter la logique d'envoi du formulaire
  };

  return (
    <div className="bg-gray-100 min-h-screen">
      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white shadow-md">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="text-3xl font-bold text-gray-800 tracking-wider">
            TRIUMPH
          </div>
          <Link 
            to="/login" 
            className="bg-red-700 text-white px-6 py-2 rounded-full text-sm font-semibold hover:bg-red-800 transition duration-300"
          >
            Connexion
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <header className="pt-20 bg-gradient-to-br from-gray-100 to-gray-200">
        <div className="container mx-auto px-4 py-16 text-center">
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
            Découvrez la Légende Triumph
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-12">
            Chaque moto raconte une histoire. Découvrez notre héritage, notre passion et notre innovation.
          </p>
        </div>
      </header>

      {/* Motorcycle Showcase */}
      <section className="container mx-auto px-4 py-16">
        <div className="grid md:grid-cols-3 gap-8">
          {motorcycles.map((moto) => (
            <div 
              key={moto.id} 
              className="bg-white rounded-xl shadow-lg overflow-hidden transform transition hover:scale-105 hover:shadow-xl"
            >
              <img 
                src={moto.image} 
                alt={moto.name} 
                className="w-full h-64 object-cover"
              />
              <div className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-2xl font-bold text-gray-900">{moto.name}</h2>
                  <span className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded-full">
                    {moto.category}
                  </span>
                </div>
                <p className="text-gray-600 mb-4">{moto.description}</p>
                <div className="space-y-2">
                  {moto.features.map((feature, index) => (
                    <div key={index} className="flex items-center text-gray-700">
                      <svg className="w-5 h-5 text-red-600 mr-2" fill="currentColor" viewBox="0 0 20 20">
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
      <section className="bg-gray-900 text-white py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto">
            <h2 className="text-4xl font-bold text-center mb-12">Réservez Votre Essai</h2>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="name" className="block mb-2 text-gray-300">Nom Complet</label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 bg-gray-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600"
                  />
                </div>
                <div>
                  <label htmlFor="email" className="block mb-2 text-gray-300">Email</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 bg-gray-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600"
                  />
                </div>
              </div>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="phone" className="block mb-2 text-gray-300">Téléphone</label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 bg-gray-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600"
                  />
                </div>
                <div>
                  <label htmlFor="motorcycle" className="block mb-2 text-gray-300">Modèle souhaité</label>
                  <select
                    id="motorcycle"
                    name="motorcycle"
                    value={formData.motorcycle}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 bg-gray-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600"
                  >
                    <option value="">Sélectionnez un modèle</option>
                    {motorcycles.map(moto => (
                      <option key={moto.id} value={moto.name}>{moto.name}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <label htmlFor="date" className="block mb-2 text-gray-300">Date souhaitée</label>
                <input
                  type="date"
                  id="date"
                  name="date"
                  value={formData.date}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 bg-gray-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600"
                />
              </div>
              <div>
                <label htmlFor="message" className="block mb-2 text-gray-300">Message supplémentaire (optionnel)</label>
                <textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleInputChange}
                  rows={4}
                  className="w-full px-4 py-3 bg-gray-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600"
                ></textarea>
              </div>
              <div className="text-center">
                <button 
                  type="submit" 
                  className="bg-red-700 text-white px-10 py-4 rounded-full text-lg font-semibold hover:bg-red-800 transition duration-300"
                >
                  Réserver un essai
                </button>
              </div>
            </form>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8">
        <div className="container mx-auto px-4 text-center">
          <p>&copy; 2025 Triumph Motorcycles. Tous droits réservés.</p>
        </div>
      </footer>
    </div>
  );
};

export default Home;