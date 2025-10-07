'use client';

import { useRef, useState } from 'react';
import { motion } from 'framer-motion';
import TabComponent from '../components/shared/TabComponent';
import MultiSelect, { ResearchField } from '../components/shared/MultiSelect';
import SideSearchForm from '../components/search/SideSearchForm';
import { useSearchParams } from 'next/navigation';
import { InitialParams } from '../components/json/types';

// export type InitialParams = {
//   title?: string;
//   start_year: number;
//   end_year: number;
//   page: number;
//   per_page: number;
//   resource_type: 'articles' | 'statements';
//   search_type: 'keyword' | 'semantic' | 'hybrid';
//   authors: string[];
//   scientific_venues: string[];
//   research_fields: string[];
//   concepts: string[];
// };

export default function PageClient({ initialParams }: { initialParams: InitialParams }) {

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

  // **********SideSearchForm**********

  interface TimeRange {
    start: number;
    end: number;
  }

  interface QueryParams {
    timeRange?: TimeRange;
    authors?: string[];
    scientific_venues?: string[];
    concepts?: string[];
  }
  const [filterParams, setFilterParams] = useState<QueryParams>({
    timeRange: {
      start: 2000,
      end: 2025
    },
    authors: [],
    scientific_venues: [],
    concepts: []
  });
  const handleFilter = (formData: QueryParams) => {
    setFilterParams(formData);
  };
  const [ranking, setRanking] = useState('a-z');
  const sideSearchFormRef = useRef<any>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const searchParams = useSearchParams();
  const conceptParam = searchParams.get('concept');
  const titleParam = searchParams.get('title');

  // **********SideSearchForm**********

  const [selectedResearchFields, setSelectedResearchFields] = useState<ResearchField[]>([]);


  return (
    <div className="min-h-[calc(100vh-19.1rem)] flex flex-col pt-[10px]">
      <div className="flex-grow">
        <motion.div
          className="w-full mx-auto sm:px-6 md:px-8 lg:px-12 xl:max-w-screen-xl 2xl:max-w-screen-2xl px-4 pt-[20px]"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.div
            className="grid grid-cols-1 md:grid-cols-4"
            variants={containerVariants}
          >
            <motion.div
              className="md:col-span-3"
              variants={itemVariants}
            >
              <TabComponent selectedResearchFields={selectedResearchFields} initialParams={initialParams} ranking={ranking} />
            </motion.div>

            <motion.div variants={itemVariants}>
              <div className="bg-white mb-4 round-[10px] ml-4">
                <SideSearchForm
                  ref={sideSearchFormRef}
                  initialParams={initialParams}
                  handleFilter={handleFilter}
                  currentPage={currentPage}
                  pageSize={pageSize}
                  isSubmitting={isSubmitting}
                  submitError={submitError}
                  conceptParam={conceptParam}
                  titleParam={titleParam}
                />
              </div>
            </motion.div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}