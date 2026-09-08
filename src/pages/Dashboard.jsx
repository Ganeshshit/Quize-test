import React from 'react';
import { useNavigate } from 'react-router-dom';
import TrainerLayout from '../../components/Layout/TrainerLayout'; // Import it here
import { BookOpen, Users, Clock, Activity, PlusCircle, Database, ArrowRight, ChevronRight } from 'lucide-react';

const Dashboard = () => {
  // ... (keep all your existing stats and recentQuizzes arrays here) ...

  return (
    <TrainerLayout> {/* Wrap the whole page in the layout */}
      <div className="p-4 sm:p-6 lg:p-8 max-w-[1400px] mx-auto w-full font-sans selection:bg-yellow-200">

        {/* ... (keep all the dashboard JSX here) ... */}

      </div>
    </TrainerLayout>
  );
};

export default Dashboard;