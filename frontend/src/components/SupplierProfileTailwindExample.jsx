import React from 'react';

/**
 * Example: SupplierProfile with Tailwind CSS
 * This is a demonstration of how you can use Tailwind CSS in your components
 * You can gradually migrate your existing components to use Tailwind utilities
 */
const SupplierProfileTailwindExample = () => {
    return (
        <div className="flex min-h-screen bg-gray-50">
            {/* Sidebar would go here */}

            {/* Main Content */}
            <div className="flex-1 ml-0 md:ml-[280px] p-8 transition-all">

                {/* Header */}
                <div className="flex justify-between items-center mb-8 bg-white p-6 rounded-lg shadow-soft">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 mb-1">My Profile</h1>
                        <p className="text-gray-600">Manage your business information and KYC details</p>
                    </div>
                    <button className="flex items-center gap-2 bg-supplier-500 hover:bg-supplier-600 text-white font-semibold px-6 py-3 rounded-md transition-all transform hover:-translate-y-0.5 shadow-md">
                        <span>✏️</span>
                        Edit Profile
                    </button>
                </div>

                {/* Basic Details Section */}
                <div className="bg-white rounded-lg shadow-soft hover:shadow-hover transition-all p-8 mb-6">
                    <div className="mb-6 pb-4 border-b-2 border-gray-100">
                        <h2 className="text-xl font-bold text-gray-900 flex items-center gap-3">
                            <span>🏪</span>
                            Basic Details
                        </h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Shop Name */}
                        <div className="flex flex-col">
                            <label className="flex items-center gap-2 text-sm font-semibold text-gray-600 mb-2">
                                <span>🏪</span>
                                Shop Name *
                            </label>
                            <input
                                type="text"
                                className="w-full px-4 py-3 text-base border border-gray-300 rounded-md transition-all focus:outline-none focus:border-supplier-500 focus:ring-4 focus:ring-supplier-100"
                                placeholder="Enter shop name"
                            />
                        </div>

                        {/* Owner Name */}
                        <div className="flex flex-col">
                            <label className="flex items-center gap-2 text-sm font-semibold text-gray-600 mb-2">
                                <span>👤</span>
                                Owner Name *
                            </label>
                            <input
                                type="text"
                                className="w-full px-4 py-3 text-base border border-gray-300 rounded-md transition-all focus:outline-none focus:border-supplier-500 focus:ring-4 focus:ring-supplier-100"
                                placeholder="Enter owner name"
                            />
                        </div>

                        {/* Business Name */}
                        <div className="flex flex-col">
                            <label className="flex items-center gap-2 text-sm font-semibold text-gray-600 mb-2">
                                <span>🏢</span>
                                Business Name *
                            </label>
                            <input
                                type="text"
                                className="w-full px-4 py-3 text-base border border-gray-300 rounded-md transition-all focus:outline-none focus:border-supplier-500 focus:ring-4 focus:ring-supplier-100"
                                placeholder="Enter business name"
                            />
                        </div>

                        {/* Phone Number */}
                        <div className="flex flex-col">
                            <label className="flex items-center gap-2 text-sm font-semibold text-gray-600 mb-2">
                                <span>📞</span>
                                Phone Number
                            </label>
                            <input
                                type="tel"
                                disabled
                                className="w-full px-4 py-3 text-base border border-gray-300 rounded-md bg-gray-50 cursor-not-allowed text-gray-500"
                                placeholder="From user account"
                            />
                        </div>
                    </div>
                </div>

                {/* Business Type Section */}
                <div className="bg-white rounded-lg shadow-soft hover:shadow-hover transition-all p-8 mb-6">
                    <div className="mb-6 pb-4 border-b-2 border-gray-100">
                        <h2 className="text-xl font-bold text-gray-900 flex items-center gap-3">
                            <span>🏭</span>
                            Business Type
                        </h2>
                        <p className="text-gray-600 text-sm mt-1">Select all that apply</p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        {/* Seeds Card */}
                        <div className="relative bg-white border-2 border-gray-200 hover:border-supplier-500 hover:bg-supplier-50 rounded-md p-6 cursor-pointer transition-all transform hover:-translate-y-1 hover:shadow-md text-center">
                            <div className="text-4xl mb-3 text-supplier-500">🌱</div>
                            <span className="font-semibold text-gray-900">Seeds</span>
                        </div>

                        {/* Fertilizer Card */}
                        <div className="relative bg-white border-2 border-gray-200 hover:border-supplier-500 hover:bg-supplier-50 rounded-md p-6 cursor-pointer transition-all transform hover:-translate-y-1 hover:shadow-md text-center">
                            <div className="text-4xl mb-3 text-supplier-500">🏭</div>
                            <span className="font-semibold text-gray-900">Fertilizer</span>
                        </div>

                        {/* Manure Card */}
                        <div className="relative bg-white border-2 border-supplier-500 bg-supplier-50 rounded-md p-6 cursor-pointer transition-all shadow-md text-center">
                            <div className="absolute top-2 right-2 w-6 h-6 bg-supplier-500 text-white rounded-full flex items-center justify-center text-xs font-bold">
                                ✓
                            </div>
                            <div className="text-4xl mb-3 text-supplier-500">🌾</div>
                            <span className="font-semibold text-gray-900">Manure</span>
                        </div>

                        {/* Equipment Rental Card */}
                        <div className="relative bg-white border-2 border-gray-200 hover:border-supplier-500 hover:bg-supplier-50 rounded-md p-6 cursor-pointer transition-all transform hover:-translate-y-1 hover:shadow-md text-center">
                            <div className="text-4xl mb-3 text-supplier-500">🚜</div>
                            <span className="font-semibold text-gray-900">Equipment Rental</span>
                        </div>
                    </div>
                </div>

                {/* Documents Section */}
                <div className="bg-white rounded-lg shadow-soft hover:shadow-hover transition-all p-8">
                    <div className="mb-6 pb-4 border-b-2 border-gray-100">
                        <h2 className="text-xl font-bold text-gray-900 flex items-center gap-3">
                            <span>📄</span>
                            Documents Upload
                        </h2>
                        <p className="text-gray-600 text-sm mt-1">Upload required business documents</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {/* ID Proof */}
                        <div className="bg-gray-50 border-2 border-dashed border-gray-300 hover:border-supplier-500 hover:bg-supplier-50 rounded-md p-8 text-center transition-all">
                            <div className="text-5xl mb-4 text-supplier-500">🆔</div>
                            <h3 className="text-lg font-bold text-gray-900 mb-2">ID Proof</h3>
                            <p className="text-sm text-gray-600 mb-4">No document uploaded</p>
                            <button className="bg-supplier-500 hover:bg-supplier-600 text-white font-semibold px-6 py-2 rounded-md text-sm transition-all transform hover:-translate-y-0.5">
                                Choose File
                            </button>
                        </div>

                        {/* Business License */}
                        <div className="bg-gray-50 border-2 border-dashed border-gray-300 hover:border-supplier-500 hover:bg-supplier-50 rounded-md p-8 text-center transition-all">
                            <div className="text-5xl mb-4 text-supplier-500">📋</div>
                            <h3 className="text-lg font-bold text-gray-900 mb-2">Business License</h3>
                            <p className="text-sm text-gray-600 mb-4">No document uploaded</p>
                            <button className="bg-supplier-500 hover:bg-supplier-600 text-white font-semibold px-6 py-2 rounded-md text-sm transition-all transform hover:-translate-y-0.5">
                                Choose File
                            </button>
                        </div>

                        {/* Shop Image */}
                        <div className="bg-gray-50 border-2 border-dashed border-gray-300 hover:border-supplier-500 hover:bg-supplier-50 rounded-md p-8 text-center transition-all">
                            <div className="text-5xl mb-4 text-supplier-500">🖼️</div>
                            <h3 className="text-lg font-bold text-gray-900 mb-2">Shop Image</h3>
                            <p className="text-sm text-gray-600 mb-4">No image uploaded</p>
                            <button className="bg-supplier-500 hover:bg-supplier-600 text-white font-semibold px-6 py-2 rounded-md text-sm transition-all transform hover:-translate-y-0.5">
                                Choose File
                            </button>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default SupplierProfileTailwindExample;
