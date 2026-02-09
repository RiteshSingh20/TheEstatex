import React from "react";

interface DashboardHeaderProps {
  title?: string;
  subtitle?: string;
}

const DashboardHeader: React.FC<DashboardHeaderProps> = ({
  title = "Property Dashboard",
  subtitle = "Find and manage properties across your subscribed locations"
}) => {
  return (
    <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
      <div>
        <h1 className="text-2xl font-bold text-neutral-800">{title}</h1>
        <p className="text-neutral-500">{subtitle}</p>
      </div>
    </div>
  );
};

export default DashboardHeader;
