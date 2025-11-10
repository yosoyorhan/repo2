import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Camera, ShoppingBag, Users } from 'lucide-react';
import { motion } from 'framer-motion';

const HomePage = () => {
  return (
    <div className="flex flex-col items-center justify-center text-center p-8 bg-gradient-to-br from-yellow-50 via-red-50 to-blue-50 h-full">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="w-24 h-24 bg-[#FFDE59] rounded-full flex items-center justify-center mb-6 shadow-lg">
          <span className="text-5xl font-bold text-gray-900">W</span>
        </div>
      </motion.div>
      <motion.h1 
        className="text-5xl md:text-7xl font-extrabold text-gray-900 mb-4"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        Canlı Alışverişin Kalbi
      </motion.h1>
      <motion.p 
        className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto mb-8"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.4 }}
      >
        Sevdiğin markaların canlı yayınlarını izle, özel ürünleri keşfet ve anında satın al. Whatnot dünyasına katıl!
      </motion.p>
      <motion.div
        className="flex flex-col sm:flex-row gap-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.6 }}
      >
        <Link to="/streams">
          <Button size="lg" className="w-full sm:w-auto bg-[#FFDE59] text-gray-900 hover:bg-[#FFD700] rounded-full text-lg px-8 py-6 shadow-md transition-transform hover:scale-105">
            <Camera className="mr-2 h-6 w-6" />
            Yayınları Keşfet
          </Button>
        </Link>
        <Button size="lg" variant="outline" className="w-full sm:w-auto rounded-full text-lg px-8 py-6 shadow-md transition-transform hover:scale-105">
          <ShoppingBag className="mr-2 h-6 w-6" />
          Alışverişe Başla
        </Button>
      </motion.div>
    </div>
  );
};

export default HomePage;