import React from 'react';
import Sidebar from './Sidebar';

function Inventory() {
  return (
    <div className="flex h-screen bg-transparent">
      <Sidebar />
      <div className="flex-1 p-6 md:p-10 overflow-auto bg-transparent relative">
        <div className="max-w-5xl mx-auto relative z-10">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl md:text-3xl font-semibold tracking-wide">INVENTORY</h1>
            <div className="text-sm md:text-base">Date: {new Date().toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}</div>
          </div>

          <div className="mb-8">
            <input
              type="text"
              placeholder="Search"
              className="w-full md:w-1/2 rounded-full bg-white px-4 py-2 shadow focus:outline-none focus:ring-2 focus:ring-sky-400"
            />
          </div>

          <form className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="block text-base font-medium">INVENTORY ID:</label>
              <input
                type="text"
                placeholder="Enter inventory id"
                className="w-full bg-white text-gray-900 rounded-md px-4 py-3 shadow focus:outline-none focus:ring-2 focus:ring-sky-400"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-base font-medium">Name of Item:</label>
              <input
                type="text"
                placeholder="Enter item name"
                className="w-full bg-white text-gray-900 rounded-md px-4 py-3 shadow focus:outline-none focus:ring-2 focus:ring-sky-400"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-base font-medium">Description:</label>
              <textarea
                placeholder="Short description"
                rows="3"
                className="w-full bg-white text-gray-900 rounded-md px-4 py-3 shadow focus:outline-none focus:ring-2 focus:ring-sky-400"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-base font-medium">Qty of Stack:</label>
              <input
                type="number"
                placeholder="Enter quantity in stock"
                className="w-full bg-white text-gray-900 rounded-md px-4 py-3 shadow focus:outline-none focus:ring-2 focus:ring-sky-400"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-base font-medium">Unit of price:</label>
              <input
                type="number"
                step="0.01"
                placeholder="Enter unit price"
                className="w-full bg-white text-gray-900 rounded-md px-4 py-3 shadow focus:outline-none focus:ring-2 focus:ring-sky-400"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-base font-medium">ReOrder:</label>
              <input
                type="number"
                placeholder="Reorder threshold"
                className="w-full bg-white text-gray-900 rounded-md px-4 py-3 shadow focus:outline-none focus:ring-2 focus:ring-sky-400"
              />
            </div>

            <div className="md:col-span-2 flex items-center justify-between pt-2">
              <button type="button" className="text-sky-700 underline font-medium">View ITEMS</button>
              <div className="flex gap-4">
                <button type="button" className="bg-[#126280] text-white rounded-full px-6 py-3 shadow hover:opacity-90">New ITEM</button>
                <button type="submit" className="bg-[#126280] text-white rounded-full px-6 py-3 shadow hover:opacity-90">SUBMIT</button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Inventory;


