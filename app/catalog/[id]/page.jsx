import CatalogDetail from '@/components/catalog/CatalogDetail'
import Navbar from '@/components/Navbar'
import React from 'react'

export default function page() {
  return (
    <div>
      <Navbar />
      <div className="mt-[-40px]">

        <CatalogDetail />
      </div>
    </div>
  )
}
