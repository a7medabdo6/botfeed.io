/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import CommonHeader from "@/src/shared/CommonHeader";
import {
  useGetWidgetConfigsQuery,
  WidgetConfigData,
} from "@/src/redux/api/widgetConfigApi";
import React, { useState } from "react";
import WidgetConfigCard from "./WidgetConfigCard";

const WidgetSettingsView: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState("");

  const { data, isLoading, refetch } = useGetWidgetConfigsQuery();

  const configs = (data?.data || []).filter((c: WidgetConfigData) =>
    c.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex-1 flex flex-col min-w-0 sm:p-6 p-4 overflow-y-auto custom-scrollbar">
      <CommonHeader
        title="Chat Widgets"
        description="Widgets are created automatically when you add a Chatbot Widget trigger in the Flow Builder"
        onSearch={setSearchTerm}
        searchTerm={searchTerm}
        searchPlaceholder="Search widgets..."
        onRefresh={refetch}
      />

      {isLoading ? (
        <div className="flex items-center justify-center py-20 text-sm text-gray-500">Loading…</div>
      ) : configs.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center text-sm text-gray-500 dark:text-gray-400">
          <p>No widgets yet. Create one by adding a <strong>Chatbot Widget</strong> trigger in the Flow Builder.</p>
        </div>
      ) : (
        <div className="grid gap-4 grid-cols-1 md:grid-cols-2 xl:grid-cols-3">
          {configs.map((cfg: WidgetConfigData) => (
            <WidgetConfigCard
              key={cfg._id}
              config={cfg}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default WidgetSettingsView;
