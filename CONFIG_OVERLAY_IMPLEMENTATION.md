# Configuration Panel - Overlay Implementation

## Summary of Changes

The Training Configuration panel has been transformed from an inline collapsible section into a **modal overlay panel** that opens on demand, providing a cleaner main interface and focused configuration experience.

## Key Changes

### 1. **Configuration Button Added**
- **Location**: Fixed position, top-right (below theme toggle)
- **Appearance**: Themed button with gear icon (⚙)
- **Text**:
  - LOTR: "Configuration"
  - Terminator: "CONFIG"
- **Action**: Opens modal overlay with configuration panel

### 2. **Modal Overlay Experience**
- **Dark backdrop** with blur effect when panel is open
- **Centered modal** with smooth slide-in animation
- **Scrollable content** for mobile devices
- **Click outside to close** - backdrop click closes panel
- **Close button (×)** in top-right corner of panel
- **Body scroll locked** when panel is open

### 3. **Default Value Labels**
Every input field now displays its current default value:
- **Format**: "Default: [value]"
- **Location**: Right side of field label
- **Color**: Primary theme color with reduced opacity
- **Updates**: Refreshes after save to show new defaults

### 4. **Enhanced Button Actions**
Three action buttons at bottom of panel:
1. **Save Configuration** - Validates, saves, and closes panel (2s delay)
2. **Reset to Defaults** - Reverts all fields to current saved values
3. **Cancel** - Closes panel without saving changes

### 5. **Theme Integration**
All new elements fully support both themes:

**LOTR Theme:**
- ⚙ Configuration button
- Medieval styling
- "💾 Save Configuration"
- "🔄 Reset to Defaults"
- "✖ Cancel"

**Terminator Theme:**
- ◉ CONFIG button
- Cyber styling with scan lines
- "▣ SAVE PARAMETERS"
- "🔄 RESET DEFAULTS"
- "✖ ABORT"

## Visual Layout

```
┌─────────────────────────────────────────────────────┐
│  Header                    [Theme] [⚙ Config]       │
│  Stats Dashboard                                     │
│  Main Panel (Generate/Publish)                      │
└─────────────────────────────────────────────────────┘

When Config button clicked:
┌─────────────────────────────────────────────────────┐
│ ████████████████████ DARK OVERLAY ████████████████████
│ ████                                          ████████
│ ████  ┌────────────────────────────────┐    ████████
│ ████  │ ⚙ Configuration          [×]  │    ████████
│ ████  ├────────────────────────────────┤    ████████
│ ████  │ Hevy API Settings              │    ████████
│ ████  │ ┌────────────────────────────┐│    ████████
│ ████  │ │ Timeout  Default: 30000    ││    ████████
│ ████  │ │ [30000]                    ││    ████████
│ ████  │ └────────────────────────────┘│    ████████
│ ████  │                                │    ████████
│ ████  │ Training Parameters            │    ████████
│ ████  │ Hypertrophy Settings           │    ████████
│ ████  │ Focus Muscle Groups            │    ████████
│ ████  │                                │    ████████
│ ████  │ [💾 Save] [🔄 Reset] [✖ Cancel]│    ████████
│ ████  └────────────────────────────────┘    ████████
│ ████████████████████████████████████████████████████
└─────────────────────────────────────────────────────┘
```

## Files Modified

### `public/index.html`

**CSS Changes:**
- Added `.config-button` - Fixed position config button
- Added `.config-overlay` - Full-screen modal backdrop
- Modified `.config-panel` - Now centered with animation
- Added `.config-close` - Close button (×) styling
- Updated `.config-field label` - Flexbox for default values
- Added `.default-value` - Styling for default value labels
- Updated media queries for mobile responsiveness

**HTML Structure Changes:**
```html
<!-- NEW: Config button -->
<button class="config-button" onclick="openConfigPanel()">
    <span>⚙</span>
    <span>Configuration</span>
</button>

<!-- NEW: Modal overlay wrapper -->
<div class="config-overlay" onclick="closeConfigPanelOnOverlay(event)">
    <div class="config-panel" onclick="event.stopPropagation()">
        <!-- Config header with close button -->
        <div class="config-header">
            <h2>⚙ Training Configuration</h2>
            <span class="config-close" onclick="closeConfigPanel()">&times;</span>
        </div>

        <!-- All config sections -->
        <!-- ... -->

        <!-- Updated action buttons -->
        <div class="config-actions">
            <button onclick="saveConfiguration()">Save</button>
            <button onclick="resetConfiguration()">Reset</button>
            <button onclick="closeConfigPanel()">Cancel</button>
        </div>
    </div>
</div>
```

**Label Structure Changes:**
```html
<!-- OLD -->
<label for="apiTimeout">API Timeout (ms)</label>

<!-- NEW -->
<label for="apiTimeout">
    <span>API Timeout (ms)</span>
    <span class="default-value" id="defaultApiTimeout"></span>
</label>
```

**JavaScript Changes:**
- **Removed**: `toggleConfigPanel()` function
- **Added**: `openConfigPanel()` - Opens modal overlay
- **Added**: `closeConfigPanel()` - Closes modal and clears alerts
- **Added**: `closeConfigPanelOnOverlay(event)` - Close on backdrop click
- **Updated**: `loadConfiguration()` - Populates default value labels
- **Updated**: `saveConfiguration()` - Auto-closes panel after 2s success
- **Updated**: Theme objects with new button text

## Field Labels with Defaults

All 18 configuration fields now show defaults:

### Hevy API Settings
- API Timeout (ms) → Default: 30000
- Max Retries → Default: 3
- Page Size → Default: 100

### Training Parameters
- Target Session (minutes) → Default: 60
- Sessions Per Week → Default: 3
- History Months → Default: 12
- Min Exercises → Default: 6
- Max Exercises → Default: 8

### Hypertrophy Settings
- Min Sets Per Exercise → Default: 3
- Max Sets Per Exercise → Default: 4
- Min Reps → Default: 6
- Max Reps → Default: 12
- Rest Compound (seconds) → Default: 120s
- Rest Isolation (seconds) → Default: 90s

### Focus Muscle Groups
- Visual chips showing selected muscles

## User Experience Flow

### Opening Configuration
1. User clicks "⚙ Configuration" button (top-right)
2. Dark overlay appears with blur effect
3. Configuration panel slides in from center
4. Main page scroll is locked
5. All fields populated with current values
6. Default values displayed next to each field

### Modifying Settings
1. User changes desired fields
2. Default values remain visible for reference
3. Can toggle muscle group chips
4. Can click "Reset to Defaults" to revert changes
5. Can click "Cancel" to close without saving

### Saving Configuration
1. User clicks "💾 Save Configuration"
2. Client-side validation runs
3. If valid: Sends PUT request to server
4. Server validates and writes to config/default.json
5. Success alert appears in panel
6. Default value labels update
7. Panel auto-closes after 2 seconds
8. Stats refresh to reflect changes

### Closing Panel
Multiple ways to close:
- Click "✖ Cancel" button
- Click "×" close button in header
- Click dark backdrop outside panel
- Auto-closes after successful save

## Benefits

### Cleaner Main Interface
- Configuration hidden by default
- More screen space for stats and routines
- Focused workflow: generate → publish
- Configuration is intentional action

### Better User Experience
- Modal focus prevents accidental interaction
- Clear default values for reference
- Easy comparison between current and default
- Visual feedback on what's changed
- Auto-close on save reduces clicks

### Mobile Friendly
- Full-screen overlay on mobile
- Scrollable content area
- Touch-friendly close actions
- Responsive button layout

### Professional Feel
- Smooth animations (slide-in, fade)
- Proper modal patterns
- Clear visual hierarchy
- Consistent with modern web UX

## Technical Implementation

### Modal Pattern
```javascript
// Open: Add overlay class, lock body scroll
function openConfigPanel() {
    document.getElementById('configOverlay').classList.add('active');
    document.body.style.overflow = 'hidden';
}

// Close: Remove overlay class, unlock scroll
function closeConfigPanel() {
    document.getElementById('configOverlay').classList.remove('active');
    document.body.style.overflow = 'auto';
    clearConfigAlerts();
}

// Close on backdrop click (not panel click)
function closeConfigPanelOnOverlay(event) {
    if (event.target === document.getElementById('configOverlay')) {
        closeConfigPanel();
    }
}
```

### Default Value Display
```javascript
// Set both input value AND default label
document.getElementById('apiTimeout').value = config.hevy.timeout;
document.getElementById('defaultApiTimeout').textContent = `Default: ${config.hevy.timeout}`;
```

### Auto-close on Save
```javascript
async function saveConfiguration() {
    // ... validation and save ...

    if (success) {
        showConfigAlert('Success!', 'success');
        loadConfiguration(); // Refresh defaults
        setTimeout(loadStats, 500); // Refresh stats
        setTimeout(closeConfigPanel, 2000); // Auto-close
    }
}
```

## Testing Checklist

- [ ] Config button appears in top-right
- [ ] Button opens modal overlay
- [ ] Backdrop is dark and blurred
- [ ] Panel is centered and scrollable
- [ ] Close (×) button works
- [ ] Cancel button works
- [ ] Click outside panel closes it
- [ ] All default values display correctly
- [ ] Save button validates and saves
- [ ] Panel auto-closes after successful save
- [ ] Reset button reverts all fields
- [ ] Body scroll locks when open
- [ ] Theme switching updates all text
- [ ] Mobile responsive (full-screen)

## Browser Compatibility

**CSS Features Used:**
- Flexbox (widely supported)
- CSS Grid (modern browsers)
- Backdrop filter (Safari 9+, Chrome 76+, Firefox 103+)
- CSS animations (all modern browsers)
- CSS custom properties (IE not supported)

**JavaScript Features:**
- ES6+ (const, arrow functions, template literals)
- Async/await
- Fetch API
- DOM manipulation

**Target Browsers:**
- Chrome 90+
- Firefox 90+
- Safari 14+
- Edge 90+

## Accessibility Notes

**Keyboard Navigation:**
- Tab through inputs normally
- Esc key could be added to close panel (future enhancement)

**Screen Readers:**
- Label text includes field description
- Default values announced separately
- Button actions are clear

**Visual:**
- High contrast between text and background
- Clear focus states on inputs
- Large touch targets for mobile

## Future Enhancements

1. **Keyboard Shortcuts**
   - Esc to close panel
   - Ctrl+S to save (with preventDefault)

2. **Change Detection**
   - Highlight modified fields
   - Confirm dialog if closing with unsaved changes

3. **Field Tooltips**
   - Hover over labels for detailed explanations
   - Best practice recommendations

4. **Live Preview**
   - Show estimated routine duration as you change settings
   - Preview muscle group coverage

5. **Import/Export**
   - Button to export config as JSON
   - Button to import config from file

## Summary

The configuration panel is now a **professional modal overlay** with:

✅ Cleaner main interface (hidden by default)
✅ Clear default value labels on every field
✅ Multiple ways to close (×, cancel, backdrop, auto-close)
✅ Smooth animations and transitions
✅ Full theme integration (LOTR + Terminator)
✅ Mobile responsive design
✅ Save button with validation
✅ Auto-close after successful save

The UI now follows modern web app patterns with a focused, distraction-free configuration experience!

**Try it now:**
```bash
npm run web
# Open http://localhost:3000
# Click "⚙ Configuration" button (top-right)
# See all default values displayed
# Make changes and click Save
# Panel closes automatically after save!
```
