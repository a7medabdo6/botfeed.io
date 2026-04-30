/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { Button } from "@/src/elements/ui/button";
import { Input } from "@/src/elements/ui/input";
import { Textarea } from "@/src/elements/ui/textarea";
import { useReactFlow } from "@xyflow/react";
import { Loader2, MapPin, Search } from "lucide-react";
import dynamic from "next/dynamic";
import { useState } from "react";
import { toast } from "sonner";
import { BaseNode } from "./BaseNode";
import { NodeField } from "./NodeField";

const InteractiveMap = dynamic(() => import("./InteractiveMap"), {
  ssr: false,
  loading: () => (
    <div className="flex h-full w-full items-center justify-center bg-gray-100">
      <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
    </div>
  ),
});

export function LocationNode({ data, id }: any) {
  const { setNodes } = useReactFlow();
  const [isSearching, setIsSearching] = useState(false);
  const [touched, setTouched] = useState(false);

  const errors: string[] = [];
  if (touched || data.forceValidation) {
    if (!data.lat || !data.lng) errors.push("Valid coordinates are required.");
  }

  const updateNodeData = (field: string, value: any) => {
    if (!touched) setTouched(true);
    setNodes((nds) => nds.map((node) => (node.id === id ? { ...node, data: { ...node.data, [field]: value } } : node)));
  };

  const handleSearch = async () => {
    if (!data.searchQuery?.trim()) return;

    setIsSearching(true);
    try {
      const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(data.searchQuery)}&limit=1`);
      const results = await response.json();

      if (results && results.length > 0) {
        const { lat, lon, display_name } = results[0];
        setNodes((nds) =>
          nds.map((node) =>
            node.id === id
              ? {
                  ...node,
                  data: {
                    ...node.data,
                    lat: parseFloat(lat),
                    lng: parseFloat(lon),
                    address: display_name,
                    name: display_name.split(",")[0],
                  },
                }
              : node
          )
        );
      } else {
        toast.error("Location not found");
      }
    } catch {
      toast.error("Search failed. Please try again.");
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <BaseNode id={id} title="Location Message" icon={<MapPin size={18} />} iconBgColor="bg-blue-100" iconColor="text-blue-600" borderColor="border-blue-200" handleColor="bg-blue-500!" errors={errors} showOutHandle={false}>
      <NodeField label="Search Location">
        <div className="relative">
          <Input value={data.searchQuery || ""} onFocus={() => setTouched(true)} onChange={(e) => updateNodeData("searchQuery", e.target.value)} onKeyDown={(e) => e.key === "Enter" && handleSearch()} placeholder="Search for a location..." className="h-9 pr-10 text-sm bg-(--input-color)" />
          <Button size="icon" variant="default" onClick={handleSearch} disabled={isSearching} className="absolute right-0 top-0 h-9 w-9 bg-sky-600 hover:bg-sky-700 text-white rounded-l-none">
            {isSearching ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search size={16} />}
          </Button>
        </div>
      </NodeField>

      <div className="relative h-48 w-full rounded-lg border border-gray-100 bg-gray-100 overflow-hidden">
        <InteractiveMap
          lat={data.lat}
          lng={data.lng}
          onChange={(lat, lng) => {
            if (!touched) setTouched(true);
            updateNodeData("lat", lat);
            updateNodeData("lng", lng);
          }}
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <NodeField label="Latitude">
          <Input type="number" value={data.lat || ""} onFocus={() => setTouched(true)} onChange={(e) => updateNodeData("lat", parseFloat(e.target.value))} placeholder="Latitude" className="h-8 text-xs bg-(--input-color)" />
        </NodeField>
        <NodeField label="Longitude">
          <Input type="number" value={data.lng || ""} onFocus={() => setTouched(true)} onChange={(e) => updateNodeData("lng", parseFloat(e.target.value))} placeholder="Longitude" className="h-8 text-xs bg-(--input-color)" />
        </NodeField>
      </div>

      <NodeField label="Location Name">
        <Input value={data.name || ""} onFocus={() => setTouched(true)} onChange={(e) => updateNodeData("name", e.target.value)} placeholder="e.g. Company Headquarters" className="h-9 text-sm bg-(--input-color)" maxLength={100} />
      </NodeField>

      <NodeField label="Address">
        <Textarea value={data.address || ""} onFocus={() => setTouched(true)} onChange={(e) => updateNodeData("address", e.target.value)} placeholder="Enter full address" className="min-h-16 resize-none bg-(--input-color) text-sm dark:bg-(--page-body-bg)" maxLength={200} />
      </NodeField>
    </BaseNode>
  );
}
