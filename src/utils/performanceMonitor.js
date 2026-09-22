// src/utils/performanceMonitor.js

class PerformanceMonitor {
    constructor() {
        this.metrics = [];
        this.enabled = import.meta.env.VITE_ENABLE_PERFORMANCE_MONITORING !== 'false';
        this.maxMetrics = 1000;
        this.observers = [];
    }

    /**
     * Initialize performance monitoring
     */
    init() {
        if (!this.enabled) return;

        // Monitor page load performance
        this.monitorPageLoad();
        
        // Monitor resource loading
        this.monitorResources();
        
        // Monitor long tasks
        this.monitorLongTasks();
        
        // Monitor API requests
        this.monitorAPIRequests();
        
        console.log('Performance monitoring initialized');
    }

    /**
     * Monitor page load performance
     */
    monitorPageLoad() {
        if (typeof window === 'undefined' || !window.performance) return;

        window.addEventListener('load', () => {
            const perfData = window.performance.timing;
            const pageLoadTime = perfData.loadEventEnd - perfData.navigationStart;
            const domReadyTime = perfData.domContentLoadedEventEnd - perfData.navigationStart;
            
            this.recordMetric('page_load', {
                pageLoadTime,
                domReadyTime,
                dnsLookup: perfData.domainLookupEnd - perfData.domainLookupStart,
                tcpConnection: perfData.connectEnd - perfData.connectStart,
                serverResponse: perfData.responseStart - perfData.requestStart,
                pageRender: perfData.domComplete - perfData.domLoading,
            });
        });
    }

    /**
     * Monitor resource loading
     */
    monitorResources() {
        if (typeof window === 'undefined' || !window.performance) return;

        const observer = new PerformanceObserver((list) => {
            list.getEntries().forEach((entry) => {
                if (entry.entryType === 'resource') {
                    this.recordMetric('resource_load', {
                        name: entry.name,
                        duration: entry.duration,
                        size: entry.transferSize,
                        type: entry.initiatorType,
                    });
                }
            });
        });

        observer.observe({ entryTypes: ['resource'] });
        this.observers.push(observer);
    }

    /**
     * Monitor long tasks (blocking main thread)
     */
    monitorLongTasks() {
        if (typeof window === 'undefined' || !window.PerformanceObserver) return;

        try {
            const observer = new PerformanceObserver((list) => {
                list.getEntries().forEach((entry) => {
                    this.recordMetric('long_task', {
                        duration: entry.duration,
                        startTime: entry.startTime,
                    });
                });
            });

            observer.observe({ entryTypes: ['longtask'] });
            this.observers.push(observer);
        } catch (e) {
            console.warn('Long task monitoring not supported');
        }
    }

    /**
     * Monitor API requests
     */
    monitorAPIRequests() {
        // This will be used with axios interceptors
        this.apiMetrics = {
            requests: [],
            responses: [],
        };
    }

    /**
     * Record a performance metric
     */
    recordMetric(type, data) {
        if (!this.enabled) return;

        const metric = {
            type,
            data,
            timestamp: Date.now(),
            url: typeof window !== 'undefined' ? window.location.href : 'unknown',
        };

        this.metrics.push(metric);

        // Keep only recent metrics
        if (this.metrics.length > this.maxMetrics) {
            this.metrics.shift();
        }

        // Log in development
        if (import.meta.env.DEV) {
            console.log(`[Performance] ${type}:`, data);
        }
    }

    /**
     * Start timing a custom operation
     */
    startTimer(name) {
        if (!this.enabled) return () => {};
        
        const startTime = performance.now();
        
        return () => {
            const duration = performance.now() - startTime;
            this.recordMetric('custom_timer', {
                name,
                duration,
            });
            return duration;
        };
    }

    /**
     * Create a performance hook for component measurement
     */
    createUsePerformance(componentName) {
        if (!this.enabled) {
            return () => ({ startTimer: () => () => {}, recordMetric: () => {} });
        }
        
        return () => {
            const startTimer = this.startTimer.bind(this);
            const recordMetric = this.recordMetric.bind(this);
            
            return {
                startTimer: (name) => startTimer(`${componentName}_${name}`),
                recordMetric: (type, data) => recordMetric(type, { ...data, component: componentName }),
            };
        };
    }

    /**
     * Get performance metrics
     */
    getMetrics(filter = null) {
        if (filter) {
            return this.metrics.filter(metric => metric.type === filter);
        }
        return [...this.metrics];
    }

    /**
     * Get performance summary
     */
    getSummary() {
        const summary = {
            totalMetrics: this.metrics.length,
            byType: {},
            averages: {},
        };

        this.metrics.forEach(metric => {
            if (!summary.byType[metric.type]) {
                summary.byType[metric.type] = [];
            }
            summary.byType[metric.type].push(metric);
        });

        // Calculate averages for each type
        Object.keys(summary.byType).forEach(type => {
            const metrics = summary.byType[type];
            const durations = metrics
                .map(m => m.data.duration)
                .filter(d => typeof d === 'number');
            
            if (durations.length > 0) {
                summary.averages[type] = {
                    avg: durations.reduce((a, b) => a + b, 0) / durations.length,
                    min: Math.min(...durations),
                    max: Math.max(...durations),
                    count: durations.length,
                };
            }
        });

        return summary;
    }

    /**
     * Clear metrics
     */
    clearMetrics() {
        this.metrics = [];
    }

    /**
     * Cleanup observers
     */
    cleanup() {
        this.observers.forEach(observer => observer.disconnect());
        this.observers = [];
    }
}

// Export singleton instance
export const performanceMonitor = new PerformanceMonitor();

// Auto-initialize in browser
if (typeof window !== 'undefined') {
    performanceMonitor.init();
}

export default performanceMonitor;