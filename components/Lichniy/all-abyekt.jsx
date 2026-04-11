import React from "react";
import ObyektCard from "../ui/obyekt-card";
import { obyektData } from "../ui/data/data";

export default function AllAbyekt() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {obyektData.map((item) => (
        <ObyektCard
          key={item.id}
          color={item.statusColor}
          textMap={item.texts}
          title={item.title}
          code={item.code}
          price={item.price}
          statusText={item.statusText}
          id={item.id}  
        />
      ))}
    </div>
  );
}