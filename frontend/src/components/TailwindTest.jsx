import React from 'react';

/**
 * TailwindTest Component
 * A simple component to verify Tailwind CSS is working correctly
 * You can import this component anywhere to test Tailwind utilities
 */
const TailwindTest = () => {
    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="text-center mb-12">
                    <h1 className="text-4xl font-bold text-gray-900 mb-4">
                        🎉 Tailwind CSS is Working!
                    </h1>
                    <p className="text-lg text-gray-600">
                        Your project now has Tailwind CSS v4 configured and ready to use
                    </p>
                </div>

                {/* Color Palette Demo */}
                <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
                    <h2 className="text-2xl font-bold text-gray-900 mb-6">Custom Color Palette</h2>

                    {/* Primary Green Colors */}
                    <div className="mb-6">
                        <h3 className="text-lg font-semibold text-gray-700 mb-3">Primary (Agriculture Green)</h3>
                        <div className="grid grid-cols-5 gap-4">
                            <div className="text-center">
                                <div className="bg-primary-100 h-20 rounded-md mb-2"></div>
                                <span className="text-xs text-gray-600">100</span>
                            </div>
                            <div className="text-center">
                                <div className="bg-primary-300 h-20 rounded-md mb-2"></div>
                                <span className="text-xs text-gray-600">300</span>
                            </div>
                            <div className="text-center">
                                <div className="bg-primary-500 h-20 rounded-md mb-2"></div>
                                <span className="text-xs text-gray-600">500</span>
                            </div>
                            <div className="text-center">
                                <div className="bg-primary-700 h-20 rounded-md mb-2"></div>
                                <span className="text-xs text-gray-600">700</span>
                            </div>
                            <div className="text-center">
                                <div className="bg-primary-900 h-20 rounded-md mb-2"></div>
                                <span className="text-xs text-gray-600">900</span>
                            </div>
                        </div>
                    </div>

                    {/* Supplier Brown Colors */}
                    <div className="mb-6">
                        <h3 className="text-lg font-semibold text-gray-700 mb-3">Supplier (Brown/Tan)</h3>
                        <div className="grid grid-cols-5 gap-4">
                            <div className="text-center">
                                <div className="bg-supplier-100 h-20 rounded-md mb-2"></div>
                                <span className="text-xs text-gray-600">100</span>
                            </div>
                            <div className="text-center">
                                <div className="bg-supplier-300 h-20 rounded-md mb-2"></div>
                                <span className="text-xs text-gray-600">300</span>
                            </div>
                            <div className="text-center">
                                <div className="bg-supplier-500 h-20 rounded-md mb-2"></div>
                                <span className="text-xs text-gray-600">500</span>
                            </div>
                            <div className="text-center">
                                <div className="bg-supplier-700 h-20 rounded-md mb-2"></div>
                                <span className="text-xs text-gray-600">700</span>
                            </div>
                            <div className="text-center">
                                <div className="bg-supplier-900 h-20 rounded-md mb-2"></div>
                                <span className="text-xs text-gray-600">900</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Component Examples */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                    {/* Card 1 */}
                    <div className="bg-white rounded-lg shadow-soft hover:shadow-hover transition-all duration-200 p-6">
                        <h3 className="text-xl font-bold text-primary-500 mb-3">Primary Theme Card</h3>
                        <p className="text-gray-600 mb-4">
                            This card uses the primary agriculture green color scheme.
                        </p>
                        <button className="bg-primary-500 hover:bg-primary-600 text-white font-semibold py-2 px-6 rounded-md transition-all duration-200 transform hover:-translate-y-0.5">
                            Primary Button
                        </button>
                    </div>

                    {/* Card 2 */}
                    <div className="bg-white rounded-lg shadow-soft hover:shadow-hover transition-all duration-200 p-6">
                        <h3 className="text-xl font-bold text-supplier-500 mb-3">Supplier Theme Card</h3>
                        <p className="text-gray-600 mb-4">
                            This card uses the supplier brown/tan color scheme.
                        </p>
                        <button className="bg-supplier-500 hover:bg-supplier-600 text-white font-semibold py-2 px-6 rounded-md transition-all duration-200 transform hover:-translate-y-0.5">
                            Supplier Button
                        </button>
                    </div>
                </div>

                {/* Utility Classes Demo */}
                <div className="bg-white rounded-lg shadow-lg p-8">
                    <h2 className="text-2xl font-bold text-gray-900 mb-6">Common Tailwind Utilities</h2>

                    <div className="space-y-4">
                        <div className="flex items-center gap-4">
                            <span className="font-semibold text-gray-700 w-32">Spacing:</span>
                            <div className="flex gap-2">
                                <div className="bg-blue-500 p-2 rounded">p-2</div>
                                <div className="bg-blue-500 p-4 rounded">p-4</div>
                                <div className="bg-blue-500 p-6 rounded">p-6</div>
                            </div>
                        </div>

                        <div className="flex items-center gap-4">
                            <span className="font-semibold text-gray-700 w-32">Text Sizes:</span>
                            <div className="space-x-4">
                                <span className="text-sm">text-sm</span>
                                <span className="text-base">text-base</span>
                                <span className="text-lg">text-lg</span>
                                <span className="text-xl">text-xl</span>
                                <span className="text-2xl">text-2xl</span>
                            </div>
                        </div>

                        <div className="flex items-center gap-4">
                            <span className="font-semibold text-gray-700 w-32">Shadows:</span>
                            <div className="flex gap-4">
                                <div className="bg-white shadow-sm p-4 rounded">shadow-sm</div>
                                <div className="bg-white shadow-md p-4 rounded">shadow-md</div>
                                <div className="bg-white shadow-lg p-4 rounded">shadow-lg</div>
                            </div>
                        </div>

                        <div className="flex items-center gap-4">
                            <span className="font-semibold text-gray-700 w-32">Animations:</span>
                            <div className="flex gap-4">
                                <div className="bg-primary-500 text-white p-4 rounded animate-fade-in">Fade In</div>
                                <div className="bg-supplier-500 text-white p-4 rounded animate-slide-in">Slide In</div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Usage Instructions */}
                <div className="mt-8 bg-gradient-to-r from-primary-500 to-supplier-500 rounded-lg p-8 text-white">
                    <h2 className="text-2xl font-bold mb-4">✨ How to Use Tailwind CSS</h2>
                    <ul className="space-y-2 text-white/90">
                        <li>• Use utility classes directly in your JSX: <code className="bg-white/20 px-2 py-1 rounded">className="bg-primary-500 text-white p-4"</code></li>
                        <li>• Custom colors: <code className="bg-white/20 px-2 py-1 rounded">bg-primary-500</code>, <code className="bg-white/20 px-2 py-1 rounded">bg-supplier-500</code></li>
                        <li>• Responsive design: <code className="bg-white/20 px-2 py-1 rounded">md:grid-cols-2 lg:grid-cols-3</code></li>
                        <li>• Hover states: <code className="bg-white/20 px-2 py-1 rounded">hover:bg-primary-600</code></li>
                        <li>• Animations: <code className="bg-white/20 px-2 py-1 rounded">animate-fade-in</code></li>
                    </ul>
                </div>
            </div>
        </div>
    );
};

export default TailwindTest;
