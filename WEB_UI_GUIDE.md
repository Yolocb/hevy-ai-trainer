# 🌐 Web UI for Hevy AI Trainer

## 🎉 Quick Start

### **Start the Web Server:**

```bash
npm run web
```

### **Open Your Browser:**

Navigate to: **http://localhost:3000**

---

## 🖥️ **Features**

### **1. Dashboard Overview**
- **Total Workouts**: See your workout history count
- **Exercises Tracked**: Number of unique exercises in your data
- **Focus Exercises**: Exercises matching your target muscles
- **Last Workout**: Date of your most recent training session

### **2. Generate Routine**
Click **"Generate New Routine"** to:
- Analyze your last 12 months of Hevy data
- Apply adaptive progressive overload
- Create a personalized routine with:
  - Dynamic weight/rep progression per exercise
  - Multiple progression strategies (Pyramid, Reverse Pyramid, Wave, Flat)
  - Performance trend indicators (📈 improving, ➡️ plateaued, 📉 regressing)

### **3. Preview Routine**
Before publishing, you can:
- Review all exercises with detailed set-by-set breakdown
- See progression strategy for each exercise
- Check estimated duration
- View performance trends and notes

### **4. Publish to Hevy**
Click **"Publish to Hevy"** to:
- Send the routine directly to your Hevy app
- Routine appears immediately in Hevy under your routines
- Ready to start your workout!

---

## 🎨 **UI Features**

### **Beautiful Design**
- Modern gradient background
- Responsive layout (works on mobile, tablet, desktop)
- Smooth animations and transitions
- Clear visual hierarchy

### **Exercise Cards**
Each exercise shows:
- 🔥 **Compound** or 💪 **Isolation** badge
- Progression strategy emoji (📈 📉 〰️ ➖)
- Set-by-set breakdown with weight, reps, rest
- Performance notes with trends

### **Real-Time Feedback**
- Loading indicators during generation
- Success/error alerts
- Disabled buttons prevent double-clicks
- Progress updates

---

## 🔧 **API Endpoints**

The web UI communicates with these endpoints:

### **GET `/api/health`**
Health check

**Response:**
```json
{
  "status": "ok",
  "timestamp": "2026-02-11T15:00:00.000Z"
}
```

### **GET `/api/stats`**
Get training statistics

**Response:**
```json
{
  "totalWorkouts": 72,
  "totalExercises": 29,
  "focusedExercises": 25,
  "lastWorkout": "2026-02-11T07:13:51+00:00",
  "muscleGroups": ["chest", "shoulders", "biceps", "triceps", "lats", "upper_back"]
}
```

### **POST `/api/generate`**
Generate a new routine (preview)

**Response:**
```json
{
  "routine": {
    "title": "AI Routine 2026-02-11",
    "exercises": [...],
    "totalMinutes": 48,
    "notes": "AI-generated hypertrophy routine..."
  }
}
```

### **POST `/api/publish`**
Publish the last generated routine to Hevy

**Response:**
```json
{
  "success": true,
  "routineId": "89e717b1-7297-40ba-9833-62ec9763397c",
  "title": "AI Routine 2026-02-11",
  "createdAt": "2026-02-11T15:45:15.150Z"
}
```

### **GET `/api/config`**
Get current training configuration

**Response:**
```json
{
  "targetSessionMinutes": 60,
  "focusMuscles": ["chest", "shoulders", "biceps", "triceps", "lats", "upper_back"],
  "hypertrophy": {
    "setsPerExercise": [3, 4],
    "repsRange": [6, 12],
    "restCompound": 120,
    "restIsolation": 90,
    "progressiveOverload": 2.5
  },
  "exerciseCount": [6, 8]
}
```

---

## 🚀 **Workflow**

```
1. User opens http://localhost:3000
        ↓
2. Dashboard loads with stats from Hevy API
        ↓
3. User clicks "Generate New Routine"
        ↓
4. Server fetches workout history
        ↓
5. Agent B analyzes and plans routine
        ↓
6. Routine preview displayed in browser
        ↓
7. User reviews and clicks "Publish to Hevy"
        ↓
8. Agent C publishes routine via API
        ↓
9. Success message shown
        ↓
10. User opens Hevy app and starts workout!
```

---

## 📱 **Mobile Responsive**

The UI adapts to different screen sizes:
- **Desktop**: Full grid layout with side-by-side stats
- **Tablet**: Adjusted grid, comfortable buttons
- **Mobile**: Stacked layout, full-width buttons, readable cards

---

## 🎯 **Development**

### **File Structure**
```
src/
├── server.ts          # Express web server
public/
└── index.html         # Complete web UI (HTML/CSS/JS)
```

### **Technology Stack**
- **Backend**: Express + TypeScript
- **Frontend**: Vanilla HTML/CSS/JavaScript (no framework needed!)
- **Styling**: Modern CSS with gradients and animations
- **API**: RESTful endpoints
- **Real-time**: Async/await with fetch API

### **Customization**

#### Change Port:
```bash
PORT=8080 npm run web
```

#### Modify Colors:
Edit `public/index.html` CSS variables:
```css
background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
```

#### Add Features:
The server is modular - add new endpoints in `src/server.ts`:
```typescript
app.get('/api/my-feature', (req, res) => {
  // Your code here
});
```

---

## 🔒 **Security Notes**

- The web UI is for **local use only** (localhost)
- API key stored securely in `.env` file (not exposed to browser)
- No authentication required (single-user local app)
- CORS enabled for local development

For production deployment:
- Add authentication
- Use HTTPS
- Implement rate limiting
- Add input validation
- Use environment-based configuration

---

## 🐛 **Troubleshooting**

### **Port Already in Use**
```bash
PORT=3001 npm run web
```

### **API Key Error**
Make sure `.env` file exists with valid `HEVY_API_KEY`

### **Browser Shows Blank Page**
- Check console for errors (F12)
- Ensure server is running (`npm run web`)
- Try refreshing with Ctrl+F5

### **Generation Fails**
- Check server logs in terminal
- Verify Hevy API key is valid
- Ensure you have workout history in Hevy

---

## 🎓 **Usage Tips**

1. **Generate Before Each Workout**: Get fresh adaptive routines
2. **Review Before Publishing**: Check weights make sense
3. **Track Progress**: System learns from your Hevy performance
4. **Experiment**: Generate multiple times to see variations
5. **Mobile Access**: Access from phone on same network using local IP

---

## 🌟 **Comparison: CLI vs Web UI**

| Feature | CLI (`npm run dev`) | Web UI (`npm run web`) |
|---------|---------------------|------------------------|
| Interface | Terminal | Browser |
| Preview | Text output | Visual cards |
| Stats Dashboard | No | Yes ✅ |
| Mobile Friendly | No | Yes ✅ |
| Publish Control | Immediate | Preview first ✅ |
| Visual Feedback | Minimal | Rich ✅ |
| Multiple Users | Sequential | Could support multiple |
| Automation | Easy | Via API |

**Both work great - choose based on your preference!**

---

## 📊 **Next Steps**

Potential enhancements:
- [ ] Save generated routines history
- [ ] Export to PDF/CSV
- [ ] Workout calendar view
- [ ] Progress charts and graphs
- [ ] Exercise library browser
- [ ] Custom muscle group targeting
- [ ] Routine templates
- [ ] Multi-week planning
- [ ] Mobile app (React Native)
- [ ] Social sharing

---

## ✅ **You're All Set!**

Run `npm run web` and open http://localhost:3000 to start generating intelligent training routines with a beautiful UI! 🚀💪

---

**Pro Tip**: Keep the server running in one terminal, and you can generate routines anytime from your browser!
