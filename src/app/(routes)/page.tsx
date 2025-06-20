'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import TabComponent from '../components/shared/TabComponent';
import MultiSelect, { ResearchField } from '../components/shared/MultiSelect';

export default function HomePage() {

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2
      }
    }
  };


  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5
      }
    }
  };

  const [ranking, setRanking] = useState('a-z');
  const handleRankingChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setRanking(e.target.value);
  };

  const [selectedResearchFields, setSelectedResearchFields] = useState<ResearchField[]>([]);

  return (
    <div className="min-h-[calc(100vh-19.1rem)] flex flex-col bg-white">
      <div className="flex-grow">
        <motion.div
          className="w-full px-4 mx-auto sm:px-6 md:px-8 lg:px-12 xl:max-w-screen-xl 2xl:max-w-screen-2xl px-4 pt-[40px]"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.div
            className="grid grid-cols-1 md:grid-cols-4 gap-6"
            variants={containerVariants}
          >
            <motion.div variants={itemVariants}>
              <div className="bg-white mb-4 pt-8">
                <MultiSelect
                  selectedFields={selectedResearchFields}
                  onChange={setSelectedResearchFields}
                  placeholder="Select research fields..."
                />
              </div>
              <div className="bg-white mb-4">
                <select
                  value={ranking}
                  onChange={handleRankingChange}
                  className="w-full px-4 py-2 border rounded-lg shadow-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="a-z">A-Z</option>
                  <option value="z-a">Z-A</option>
                  <option value="newest">Newest</option>
                </select>
              </div>
            </motion.div>

            <motion.div
              className="md:col-span-3"
              variants={itemVariants}
            >
              <TabComponent selectedResearchFields={selectedResearchFields} ranking={ranking} />
            </motion.div>

          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}