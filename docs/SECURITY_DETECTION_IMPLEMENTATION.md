# Security Detection Implementation for Quiz Attempt Page

## Overview
This document describes the anti-cheating security detection features implemented in the QuizAttempt page that log events to the backend audit API.

## Implemented Security Features

### 1. Tab Switch Detection
**Event**: `tab_switch`
**Trigger**: When user switches to another browser tab (document.hidden)

```javascript
document.addEventListener("visibilitychange", handleVisibilityChange);
```

**Behavior**:
- Counts tab switches
- Logs each switch with count
- Warns user when approaching limit
- Auto-submits when limit exceeded (default: 5)
- Displays warning toast

**Configurable via**: `quiz.antiCheatSettings.maxTabSwitches`

---

### 2. Window Focus/Blur Detection
**Events**: `window_blur`, `window_focus`
**Trigger**: When browser window loses or gains focus

```javascript
window.addEventListener('blur', handleBlur);
window.addEventListener('focus', handleFocus);
```

**Behavior**:
- Logs when window loses focus (user clicked outside browser)
- Logs when window regains focus
- Shows warning toast on blur

---

### 3. Fullscreen Exit Detection
**Events**: `fullscreen_enter`, `fullscreen_exit`
**Trigger**: When user enters or exits fullscreen mode

```javascript
document.addEventListener("fullscreenchange", handleFullScreenChange);
```

**Behavior**:
- Auto-enters fullscreen on load (if enabled)
- Logs fullscreen exit events
- Shows error toast on exit
- Forces interaction overlay to prevent tab switching
- Auto-enters fullscreen when user clicks overlay

**Configurable via**: `quiz.antiCheatSettings.enableFullScreen`

---

### 4. Copy/Paste/Cut Detection
**Events**: `copy`, `paste`, `cut`
**Trigger**: When user attempts to copy, paste, or cut content

```javascript
document.addEventListener("copy", copy);
document.addEventListener("paste", paste);
document.addEventListener("cut", cut);
```

**Behavior**:
- Prevents default action
- Logs the event
- Shows warning toast

**Configurable via**: `quiz.antiCheatSettings.disableCopyPaste`

---

### 5. Right Click/Context Menu Detection
**Event**: `context_menu`
**Trigger**: When user right-clicks on the page

```javascript
document.addEventListener("contextmenu", rightClick);
```

**Behavior**:
- Prevents context menu
- Logs the event

---

### 6. Keyboard Shortcut Detection
**Event**: `keyboard_shortcut`
**Trigger**: When user presses suspicious keyboard shortcuts

```javascript
document.addEventListener('keydown', handleKeyDown);
```

**Behavior**:
- Detects Ctrl+C, Ctrl+V, Ctrl+X, Ctrl+A, Ctrl+I, Ctrl+J, Ctrl+U
- Logs the shortcut
- Shows warning toast
- Prevents F12 and Ctrl+Shift+I (dev tools)

---

### 7. Developer Tools Detection
**Event**: `dev_tools_detected`
**Trigger**: Detects when DevTools is open

```javascript
const detectDevTools = () => {
  const threshold = 160;
  const widthThreshold = window.outerWidth - window.innerWidth > threshold;
  const heightThreshold = window.outerHeight - window.innerHeight > threshold;
  return widthThreshold || heightThreshold;
};
```

**Behavior**:
- Checks every 1 second
- Detects if DevTools is open by comparing window sizes
- Logs detection event
- Shows error toast

---

### 8. Camera Proctoring
**Events**: `camera_enabled`, `camera_blocked`
**Trigger**: When camera access is requested or blocked

```javascript
navigator.mediaDevices.getUserMedia({
  video: { width: { ideal: 1280 }, height: { ideal: 720 }, facingMode: 'user' },
  audio: false
});
```

**Behavior**:
- Requests camera access (if enabled)
- Logs when camera is enabled
- Logs when camera is blocked
- Shows live video feed in header
- Auto-redirects if camera blocked

**Configurable via**: `quiz.antiCheatSettings.enableWebcamProctoring`

---

### 9. Quiz Start/Submit Logging
**Events**: `quiz_start`, `quiz_submit`, `quiz_auto_submit`
**Trigger**: When quiz starts or is submitted

**Behavior**:
- Logs quiz start with quiz ID and timestamp
- Logs manual submit with answer count
- Logs auto-submit with reason (time up, violation)

---

## Event Types Logged to Backend

All events are logged to `/api/audit/event` with the following structure:

```javascript
{
  attemptId: "string",
  eventType: "string",
  clientTimestamp: "ISO string",
  meta: {
    // Event-specific metadata
    screenResolution: "1920x1080",
    viewportSize: "1920x1080"
  }
}
```

### Event Types

| Event Type | Description | Risk Weight |
|------------|-------------|-------------|
| `tab_switch` | User switched browser tab | +3 |
| `window_blur` | Window lost focus | +2 |
| `window_focus` | Window gained focus | 0 |
| `fullscreen_enter` | Entered fullscreen mode | 0 |
| `fullscreen_exit` | Exited fullscreen mode | +4 |
| `copy` | User copied content | +2 |
| `paste` | User pasted content | +3 |
| `cut` | User cut content | +2 |
| `context_menu` | User opened context menu | +1 |
| `keyboard_shortcut` | Suspicious keyboard shortcut | +2 |
| `dev_tools_detected` | Developer tools detected | +5 |
| `camera_enabled` | Camera successfully enabled | 0 |
| `camera_blocked` | Camera access blocked | +3 |
| `quiz_start` | Quiz attempt started | 0 |
| `quiz_submit` | Quiz submitted manually | 0 |
| `quiz_auto_submit` | Quiz auto-submitted | 0 |
| `tab_switch_limit_exceeded` | Tab switch limit exceeded | +5 |

## Backend Integration

### API Endpoint
```
POST /api/audit/event
```

### Request Format
```javascript
{
  attemptId: "507f1f77bcf86cd799439011",
  eventType: "tab_switch",
  clientTimestamp: "2026-09-16T10:30:00.000Z",
  meta: {
    count: 3,
    maxAllowed: 5,
    screenResolution: "1920x1080",
    viewportSize: "1920x1080"
  }
}
```

### Response Format
```javascript
{
  success: true,
  message: "Event logged",
  eventId: "507f1f77bcf86cd799439014",
  riskScore: 3,
  riskLevel: "low"
}
```

## Risk Scoring

The backend calculates risk scores based on detected events:

- **Low Risk**: 0-6 points
- **Medium Risk**: 7-14 points  
- **High Risk**: 15-24 points
- **Critical Risk**: 25+ points

### Risk Actions

Based on risk level, the backend may:
- Log the event
- Update attempt risk score
- Flag the attempt for review
- Auto-submit the quiz
- Disable the attempt

## Configuration

### Quiz Anti-Cheat Settings

Each quiz can have the following anti-cheat settings:

```javascript
{
  antiCheatSettings: {
    enableTabSwitchDetection: true,
    maxTabSwitches: 5,
    enableFullScreen: true,
    disableCopyPaste: true,
    enableWebcamProctoring: false,
    trackIPAddress: true,
    allowIPChange: false
  }
}
```

## Files Modified

1. **src/pages/student/QuizAttempt.jsx**
   - Removed proctor API dependencies
   - Added audit API integration
   - Implemented comprehensive event detection
   - Added window focus/blur detection
   - Added keyboard shortcut detection
   - Fixed dev tools detection
   - Simplified camera handling

2. **src/api/audit.api.js**
   - Already existed, used for logging events

## Testing

### Manual Testing Steps

1. **Tab Switch Detection**
   - Start a quiz
   - Switch to another tab
   - Verify warning toast appears
   - Verify event is logged

2. **Fullscreen Detection**
   - Start a quiz with fullscreen enabled
   - Exit fullscreen
   - Verify error toast appears
   - Verify interaction overlay appears

3. **Copy/Paste Detection**
   - Start a quiz with copy-paste disabled
   - Try to copy content
   - Verify action is blocked
   - Verify warning toast appears

4. **Keyboard Shortcuts**
   - Start a quiz
   - Press Ctrl+C, Ctrl+V, etc.
   - Verify warning toast appears
   - Try F12
   - Verify it's blocked

5. **Dev Tools Detection**
   - Start a quiz
   - Open DevTools
   - Verify detection toast appears after 1 second

## Security Best Practices

### Implemented
✅ All events logged to backend for server-side validation
✅ Risk-based scoring system
✅ User feedback via toast notifications
✅ Configurable per quiz
✅ Does not rely solely on client-side enforcement

### Limitations
⚠️ Client-side detection can be bypassed by skilled users
⚠️ Browser extensions can interfere with detection
⚠️ Some events may have false positives
⚠️ Backend validation is the authoritative source

### Recommendations
1. Always validate events on the backend
2. Use server-side violation counting
3. Implement IP change detection (backend)
4. Use session-based validation (backend)
5. Consider WebRTC-based proctoring for enhanced security

## Future Enhancements

### Potential Additions
- [ ] Screen recording detection
- [ ] Virtual machine detection
- [ ] Multiple monitor detection
- [ ] Network monitoring
- [ ] Browser fingerprinting
- [ ] AI-based behavior analysis
- [ ] WebRTC screen sharing proctoring
- [ ] Real-time remote monitoring

### Integration
- [ ] WebSocket-based real-time alerts to trainers
- [ ] Live video streaming to proctor dashboard
- [ ] Automated suspicious activity reports
- [ ] Integration with learning management systems

## Troubleshooting

### Events Not Logging
1. Check if `attemptId` is available
2. Verify backend API endpoint is accessible
3. Check browser console for errors
4. Verify user is authenticated

### False Positives
1. Adjust dev tools detection threshold
2. Increase tab switch limit
3. Disable fullscreen enforcement
4. Review event logs to identify patterns

### Performance Issues
1. Reduce dev tools detection frequency
2. Batch audit events instead of sending individually
3. Implement event throttling/debouncing
4. Use request queue for failed events

## Conclusion

The QuizAttempt page now has comprehensive security detection that logs all suspicious activities to the backend audit API. The backend is responsible for:
- Validating events
- Calculating risk scores
- Enforcing security policies
- Flagging suspicious attempts
- Auto-submitting when necessary

The frontend provides:
- Event detection
- User feedback
- Configurable behavior
- Event logging to backend
