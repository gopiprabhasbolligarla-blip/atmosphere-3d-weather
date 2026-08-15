import os
from reportlab.lib.pagesizes import letter
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, HRFlowable
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib import colors

def create_pdf(filename):
    doc = SimpleDocTemplate(
        filename,
        pagesize=letter,
        rightMargin=40,
        leftMargin=40,
        topMargin=40,
        bottomMargin=40
    )

    styles = getSampleStyleSheet()

    # Custom Color Palette
    PRIMARY = colors.HexColor('#1e3a8a')
    SECONDARY = colors.HexColor('#2563eb')
    DARK_TEXT = colors.HexColor('#0f172a')
    LIGHT_BG = colors.HexColor('#f8fafc')
    ACCENT = colors.HexColor('#0284c7')
    BORDER_COLOR = colors.HexColor('#e2e8f0')

    # Custom Typography Styles
    title_style = ParagraphStyle(
        'DocTitle',
        parent=styles['Heading1'],
        fontName='Helvetica-Bold',
        fontSize=24,
        leading=28,
        textColor=PRIMARY,
        spaceAfter=6
    )

    subtitle_style = ParagraphStyle(
        'DocSubTitle',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=12,
        leading=16,
        textColor=ACCENT,
        spaceAfter=15
    )

    h1_style = ParagraphStyle(
        'Heading1Custom',
        parent=styles['Heading2'],
        fontName='Helvetica-Bold',
        fontSize=15,
        leading=18,
        textColor=PRIMARY,
        spaceBefore=14,
        spaceAfter=6
    )

    h2_style = ParagraphStyle(
        'Heading2Custom',
        parent=styles['Heading3'],
        fontName='Helvetica-Bold',
        fontSize=12,
        leading=15,
        textColor=SECONDARY,
        spaceBefore=10,
        spaceAfter=4
    )

    body_style = ParagraphStyle(
        'BodyCustom',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=10,
        leading=14,
        textColor=DARK_TEXT,
        spaceAfter=6
    )

    bullet_style = ParagraphStyle(
        'BulletCustom',
        parent=body_style,
        leftIndent=15,
        firstLineIndent=-10,
        spaceAfter=4
    )

    code_style = ParagraphStyle(
        'CodeCustom',
        parent=styles['Normal'],
        fontName='Courier',
        fontSize=8.5,
        leading=11,
        textColor=colors.HexColor('#0f172a'),
        backColor=LIGHT_BG,
        borderColor=BORDER_COLOR,
        borderWidth=1,
        borderPadding=6,
        spaceBefore=6,
        spaceAfter=8
    )

    story = []

    # Title & Header
    story.append(Paragraph("Atmosphere 3D Weather Application", title_style))
    story.append(Paragraph("Technical Explanation & Architecture Blueprint | Generated Documentation", subtitle_style))
    story.append(HRFlowable(width="100%", thickness=1.5, color=SECONDARY, spaceBefore=0, spaceAfter=15))

    # Executive Summary
    story.append(Paragraph("1. Executive Summary", h1_style))
    story.append(Paragraph(
        "<b>Atmosphere 3D</b> is a modern, condition-reactive weather application inspired by Google Weather. "
        "It combines a dynamic 3D WebGL background layer (rendered using React Three Fiber and Three.js) with a minimal, "
        "frosted-glass UI built with React, Tailwind CSS, and Framer Motion. The application operates 100% on the client side "
        "by leveraging Open-Meteo's free REST APIs without requiring a custom backend server.",
        body_style
    ))

    # Key Technology Stack Table
    story.append(Paragraph("2. Technology Stack", h1_style))
    tech_data = [
        [Paragraph("<b>Category</b>", body_style), Paragraph("<b>Technology</b>", body_style), Paragraph("<b>Purpose</b>", body_style)],
        [Paragraph("Framework", body_style), Paragraph("React 18 + Vite", body_style), Paragraph("Component architecture, fast HMR dev server", body_style)],
        [Paragraph("3D Engine", body_style), Paragraph("React Three Fiber + Three.js", body_style), Paragraph("Declarative WebGL canvas, particle physics", body_style)],
        [Paragraph("3D Helpers", body_style), Paragraph("@react-three/drei", body_style), Paragraph("Starfields, floating physics, ambient effects", body_style)],
        [Paragraph("Animations", body_style), Paragraph("Framer Motion", body_style), Paragraph("Glass card entrances, hover scale, modal popups", body_style)],
        [Paragraph("Styling", body_style), Paragraph("Tailwind CSS v4 + Vanilla CSS", body_style), Paragraph("Glassmorphism, responsive grid, blur filters", body_style)],
        [Paragraph("Data APIs", body_style), Paragraph("Open-Meteo Public APIs", body_style), Paragraph("Free Geocoding, Forecast & AQI telemetry", body_style)],
    ]
    t = Table(tech_data, colWidths=[100, 160, 270])
    t.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), LIGHT_BG),
        ('GRID', (0, 0), (-1, -1), 0.5, BORDER_COLOR),
        ('PADDING', (0, 0), (-1, -1), 5),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
    ]))
    story.append(t)
    story.append(Spacer(1, 10))

    # Architecture Overview
    story.append(Paragraph("3. Core Architecture & Modules", h1_style))
    
    story.append(Paragraph("A. Real-Time 3D WebGL Background Engine", h2_style))
    story.append(Paragraph("• <b>WeatherCanvas.jsx</b>: Master WebGL canvas wrapper with capped Device Pixel Ratio (dpr=[1, 1.25]) for high FPS.", bullet_style))
    story.append(Paragraph("• <b>CameraParallax.jsx</b>: Uses mouse cursor tracking and linear interpolation (Lerp) to smoothly tilt the 3D camera.", bullet_style))
    story.append(Paragraph("• <b>WeatherLighting.jsx</b>: Coordinates sun/moon directional light positions, sky ambient colors, and lightning flash triggers.", bullet_style))
    story.append(Paragraph("• <b>Condition Scenes</b>: Includes <i>ClearScene</i> (Sun & corona rays), <i>NightScene</i> (Starfield & Moon), <i>CloudScene</i> (Drifting clouds), <i>RainScene</i> (Instanced rain physics), <i>SnowScene</i> (Snowflakes), <i>FogScene</i> (Haze volume), and <i>ErrorScene</i> (Radar fallback).", bullet_style))

    story.append(Paragraph("B. Client-Side Weather Data Engine (No Backend)", h2_style))
    story.append(Paragraph("• <b>openMeteoApi.js</b>: Directly fetches Open-Meteo Geocoding search suggestions, 7-day daily weather, 24-hour hourly precipitation timelines, AQI telemetry, and GPS reverse geocoding via standard browser <code>fetch()</code>.", bullet_style))
    story.append(Paragraph("• <b>wmoCodes.js</b>: Converts WMO weather code integers (0–99) into 3D scene configs (sky gradients, cloud counts, rain/snow density).", bullet_style))
    story.append(Paragraph("• <b>feelsLikeLogic.js</b>: Evaluates humidity, wind gusts, and UV radiation to generate plain-English apparent temp insights.", bullet_style))

    story.append(Paragraph("C. Google Weather–Style Glass UI & Framer Motion", h2_style))
    story.append(Paragraph("• <b>Header.jsx</b>: City search dropdown with auto-complete, GPS locator, unit switcher (°C / °F), and pinned locations drawer.", bullet_style))
    story.append(Paragraph("• <b>HeroWeather.jsx</b>: Large hero temperature, condition title, local time, and feels-like banner.", bullet_style))
    story.append(Paragraph("• <b>HourlyStrip.jsx</b>: Horizontal 24-hour carousel with rain probability timeline graph bars.", bullet_style))
    story.append(Paragraph("• <b>DailyForecast.jsx</b>: 7-day forecast list featuring min/max temperature range bars.", bullet_style))
    story.append(Paragraph("• <b>WeatherMetrics.jsx</b>: Grid of frosted glass chips (AQI rating scale, Wind speed & gusts, UV Index, Humidity, Pressure, Visibility).", bullet_style))
    story.append(Paragraph("• <b>Framer Motion Animations</b>: Cards feature staggered entrance sequences, hover scale-up floating effects (<code>whileHover={{ scale: 1.05, y: -4 }}</code>), pulsing background glow auras, and modal popups.", bullet_style))

    # Performance Tuning
    story.append(Paragraph("4. Performance Optimizations (Zero Lag)", h1_style))
    story.append(Paragraph("1. <b>Device Pixel Ratio Capping</b>: Set <code>dpr={[1, 1.25]}</code> on Canvas to prevent 4K monitors from rendering 4x–9x excess pixels.", bullet_style))
    story.append(Paragraph("2. <b>Low-Poly Cloud Geometry</b>: Simplified cloud sphere segment counts (from 16x16 to low-poly 8x8) and capped maximum clouds to 12.", bullet_style))
    story.append(Paragraph("3. <b>Particle Density Reduction</b>: Reduced rain particles to 450 (and snow to 300) while slightly scaling point sizes—saving 80% CPU array updates.", bullet_style))
    story.append(Paragraph("4. <b>Shadow Map Removal</b>: Disabled expensive shadow depth map buffer rendering on directional solar lights.", bullet_style))
    story.append(Paragraph("5. <b>CSS GPU Acceleration</b>: Reduced CSS backdrop blur to 10px and added <code>will-change: transform</code> to prevent compositor stutter.", bullet_style))

    # Project Directory Structure
    story.append(Paragraph("5. Project File Structure", h1_style))
    tree_text = (
        "weather-app/\n"
        "├── src/\n"
        "│   ├── components/\n"
        "│   │   ├── 3d/               # R3F WebGL Canvas, Lighting & Weather Scenes\n"
        "│   │   │   ├── scenes/       # Clear, Night, Cloud, Rain, Snow, Fog, Error\n"
        "│   │   │   ├── WeatherCanvas.jsx\n"
        "│   │   │   ├── WeatherLighting.jsx\n"
        "│   │   │   └── CameraParallax.jsx\n"
        "│   │   └── ui/               # Glassmorphic UI Components & Modals\n"
        "│   │       ├── Header.jsx, HeroWeather.jsx, HourlyStrip.jsx\n"
        "│   │       ├── DailyForecast.jsx, WeatherMetrics.jsx, WeatherAlerts.jsx\n"
        "│   │       └── SavedLocationsDrawer.jsx, ShareModal.jsx\n"
        "│   ├── context/\n"
        "│   │   └── WeatherContext.jsx# Global State, Units (°C/°F), Saved Cities\n"
        "│   ├── services/\n"
        "│   │   ├── openMeteoApi.js   # Open-Meteo REST API Services\n"
        "│   │   └── wmoCodes.js       # WMO Weather Code Map Engine\n"
        "│   ├── utils/\n"
        "│   │   └── feelsLikeLogic.js # Rule-based Feels Like Reasoning\n"
        "│   ├── App.jsx\n"
        "│   └── index.css             # Glassmorphism utilities & Tailwind imports\n"
        "└── package.json"
    )
    story.append(Paragraph(tree_text.replace("\n", "<br/>").replace(" ", "&nbsp;"), code_style))

    doc.build(story)
    print(f"PDF successfully generated: {filename}")

if __name__ == '__main__':
    target_path_1 = r"c:\Users\hp\Downloads\weather-dashboard\Atmosphere_3D_Weather_App_Documentation.pdf"
    target_path_2 = r"c:\Users\hp\Downloads\weather-dashboard\weather-app\Atmosphere_3D_Weather_App_Documentation.pdf"
    create_pdf(target_path_1)
    create_pdf(target_path_2)
