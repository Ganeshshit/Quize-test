// src/components/common/VirtualList.jsx
import { memo, forwardRef } from 'react';

const VirtualList = memo(forwardRef(({ 
    items, 
    renderItem, 
    itemHeight = 60, 
    height = 400, 
    width = '100%',
    className = '',
    overscanCount = 5 
}, ref) => {
    // For now, use regular rendering as react-window has compatibility issues
    // This can be replaced with react-window once compatibility is resolved
    
    if (!items || items.length === 0) {
        return (
            <div className={`flex items-center justify-center ${className}`} style={{ height }}>
                <p className="text-gray-500 text-sm">No items to display</p>
            </div>
        );
    }

    // Regular rendering with performance optimizations
    const visibleItems = items.slice(0, 50); // Limit to first 50 items for performance
    
    return (
        <div 
            ref={ref}
            className={className} 
            style={{ height, overflowY: 'auto', width }}
        >
            {visibleItems.map((item, index) => (
                <div key={index} style={{ height: itemHeight }}>
                    {renderItem(item, index)}
                </div>
            ))}
            {items.length > 50 && (
                <div className="text-center p-4 text-gray-500 text-sm">
                    Showing first 50 of {items.length} items. Use filters to narrow results.
                </div>
            )}
        </div>
    );
}));

VirtualList.displayName = 'VirtualList';

export default VirtualList;