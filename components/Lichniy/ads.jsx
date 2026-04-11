'use client'
import React from 'react'
import ObyektCard from '../ui/obyekt-card'
import { obyektData } from '../ui/data/data'

export default function Ads() {
  const selectedIndexes = [1,4,5];

  return (
    <div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">

        {obyektData
          .filter((_, index) => selectedIndexes.includes(index))
          .map((item, index) => (
            <ObyektCard
              key={index}
              color={item.statusColor}
              textMap={item.texts}
              title={item.title}
              code={item.code}
              price={item.price}
              statusText={item.statusText}
            />
          ))}
      </div>
    </div>
  )
}
