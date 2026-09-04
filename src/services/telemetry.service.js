// src/services/telemetry.service.js
import { auditAPI } from '../api/audit.api';

class TelemetryService {
    constructor() {
        this.eventQueue = [];
        this.batchSize = 10;
        this.flushInterval = 30000; // 30 seconds
        this.attemptId = null;
        this.isActive = false;

        // Start flush interval
        this.startFlushInterval();
    }

    /**
     * Initialize telemetry for quiz attempt
     */
    init(attemptId) {
        this.attemptId = attemptId;
        this.isActive = true;
        this.eventQueue = [];

        // Log quiz start
        this.logEvent('QUIZ_STARTED', {
            timestamp: new Date().toISOString(),
        });
    }

    /**
     * Stop telemetry
     */
    stop() {
        this.isActive = false;
        this.flush(); // Flush remaining events
        this.attemptId = null;
    }

    /**
     * Log an event
     */
    logEvent(eventType, data = {}) {
        if (!this.isActive || !this.attemptId) {
            return;
        }

        const event = {
            attemptId: this.attemptId,
            eventType,
            timestamp: new Date().toISOString(),
            data: {
                ...data,
                userAgent: navigator.userAgent,
                screenSize: `${window.screen.width}x${window.screen.height}`,
                viewport: `${window.innerWidth}x${window.innerHeight}`,
                timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
            },
        };

        this.eventQueue.push(event);

        // Flush if batch size reached
        if (this.eventQueue.length >= this.batchSize) {
            this.flush();
        }
    }

    /**
     * Log tab visibility change
     */
    logTabVisibility(isVisible) {
        this.logEvent(isVisible ? 'TAB_FOCUSED' : 'TAB_BLURRED', {
            visible: isVisible,
            hiddenTime: document.hidden ? new Date().toISOString() : null,
        });
    }

    /**
     * Log window focus/blur
     */
    logWindowFocus(isFocused) {
        this.logEvent(isFocused ? 'WINDOW_FOCUSED' : 'WINDOW_BLURRED', {
            focused: isFocused,
        });
    }

    /**
     * Log copy/paste attempt
     */
    logCopyPaste(action, content = '') {
        this.logEvent('COPY_PASTE_DETECTED', {
            action, // 'copy' or 'paste'
            contentLength: content.length,
            suspicious: true,
        });
    }

    /**
     * Log right-click
     */
    logRightClick(target) {
        this.logEvent('RIGHT_CLICK_DETECTED', {
            target,
            suspicious: true,
        });
    }

    /**
     * Log fullscreen change
     */
    logFullscreenChange(isFullscreen) {
        this.logEvent('FULLSCREEN_CHANGED', {
            fullscreen: isFullscreen,
            suspicious: !isFullscreen,
        });
    }

    /**
     * Log answer change
     */
    logAnswerChange(questionId, answer) {
        this.logEvent('ANSWER_CHANGED', {
            questionId,
            answerLength: typeof answer === 'string' ? answer.length : 0,
        });
    }

    /**
     * Log question navigation
     */
    logQuestionNavigation(fromQuestionId, toQuestionId) {
        this.logEvent('QUESTION_NAVIGATED', {
            from: fromQuestionId,
            to: toQuestionId,
        });
    }

    /**
     * Log suspicious activity
     */
    logSuspiciousActivity(type, details) {
        this.logEvent('SUSPICIOUS_ACTIVITY', {
            type,
            details,
            suspicious: true,
        });
    }

    /**
     * Log multiple tabs detection
     */
    logMultipleTabs() {
        this.logEvent('MULTIPLE_TABS_DETECTED', {
            suspicious: true,
        });
    }

    /**
     * Log device change
     */
    logDeviceChange(oldDevice, newDevice) {
        this.logEvent('DEVICE_CHANGED', {
            oldDevice,
            newDevice,
            suspicious: true,
        });
    }

    /**
     * Flush events to server
     */
    async flush() {
        if (this.eventQueue.length === 0) {
            return;
        }

        const eventsToSend = [...this.eventQueue];
        this.eventQueue = [];

        try {
            await auditAPI.batchLogEvents(eventsToSend);
        } catch (error) {
            console.error('Failed to send telemetry events:', error);
            // Re-add failed events to queue
            this.eventQueue = [...eventsToSend, ...this.eventQueue];
        }
    }

    /**
     * Start automatic flush interval
     */
    startFlushInterval() {
        setInterval(() => {
            if (this.isActive && this.eventQueue.length > 0) {
                this.flush();
            }
        }, this.flushInterval);
    }

    /**
     * Setup event listeners for quiz monitoring
     */
    setupMonitoring() {
        // Tab visibility
        document.addEventListener('visibilitychange', () => {
            this.logTabVisibility(!document.hidden);
        });

        // Window focus/blur
        window.addEventListener('focus', () => {
            this.logWindowFocus(true);
        });
        window.addEventListener('blur', () => {
            this.logWindowFocus(false);
        });

        // Copy/paste
        document.addEventListener('copy', (e) => {
            const selection = window.getSelection().toString();
            this.logCopyPaste('copy', selection);
        });
        document.addEventListener('paste', (e) => {
            const pastedText = e.clipboardData?.getData('text') || '';
            this.logCopyPaste('paste', pastedText);
        });

        // Right-click
        document.addEventListener('contextmenu', (e) => {
            this.logRightClick(e.target.tagName);
        });

        // Fullscreen change
        document.addEventListener('fullscreenchange', () => {
            this.logFullscreenChange(!!document.fullscreenElement);
        });

        // Before unload
        window.addEventListener('beforeunload', () => {
            this.flush();
        });
    }

    /**
     * Remove all event listeners
     */
    cleanup() {
        // Flush remaining events
        this.flush();

        // Remove listeners would require storing references
        // For simplicity, they'll be cleaned up on page unload
    }
}

export const telemetryService = new TelemetryService();