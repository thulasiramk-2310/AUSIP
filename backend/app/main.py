from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import Response
from sqlalchemy.orm import Session
from app.models.schemas import AskRequest, ApiResponse
from app.schemas import UserCreate, UserLogin, UserResponse, Token, UserUpdate, PasswordUpdate, ReportRequest
from app.services.elastic_agent import run_agent, transform_agent_response
from app.services.kibana_alerts import get_kibana_alerts
from app.services import report_generator
from app.database import init_db, get_db, User
from app.auth import (
    get_password_hash,
    authenticate_user,
    create_access_token,
    get_current_user,
    verify_password,
)
from datetime import datetime
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(
    title="AI Unicorn Market Intelligence API",
    description="Backend API for unicorn market analysis powered by Elasticsearch Agent",
    version="1.0.0"
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:3001"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize database on startup
@app.on_event("startup")
async def startup_event():
    logger.info("Initializing database...")
    init_db()
    logger.info("Database initialized successfully")


@app.get("/")
async def root():
    return {
        "message": "AI Unicorn Market Intelligence API",
        "status": "running",
        "endpoints": {
            "register": "POST /auth/register",
            "login": "POST /auth/login",
            "me": "GET /auth/me",
            "update_profile": "PUT /auth/profile",
            "update_password": "PUT /auth/password",
            "ask": "POST /ask",
            "alerts": "GET /alerts",
            "rankings": "GET /rankings",
            "generate_report": "POST /reports/generate",
            "health": "GET /health"
        }
    }


@app.post("/auth/register", response_model=Token, status_code=201)
async def register(user_data: UserCreate, db: Session = Depends(get_db)):
    """
    Register a new user.
    
    Args:
        user_data: User registration data (email, username, password, full_name)
        
    Returns:
        JWT access token and user data
    """
    try:
        # Check if email already exists
        existing_user = db.query(User).filter(User.email == user_data.email).first()
        if existing_user:
            raise HTTPException(status_code=400, detail="Email already registered")
        
        # Check if username already exists
        existing_username = db.query(User).filter(User.username == user_data.username).first()
        if existing_username:
            raise HTTPException(status_code=400, detail="Username already taken")
        
        # Create new user
        hashed_password = get_password_hash(user_data.password)
        db_user = User(
            email=user_data.email,
            username=user_data.username,
            full_name=user_data.full_name,
            hashed_password=hashed_password,
        )
        db.add(db_user)
        db.commit()
        db.refresh(db_user)
        
        # Create access token
        access_token = create_access_token(data={"sub": db_user.id})
        
        logger.info(f"New user registered: {db_user.email}")
        
        return {
            "access_token": access_token,
            "token_type": "bearer",
            "user": UserResponse.from_orm(db_user),
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Registration error: {str(e)}")
        raise HTTPException(status_code=500, detail="Registration failed")


@app.post("/auth/login", response_model=Token)
async def login(credentials: UserLogin, db: Session = Depends(get_db)):
    """
    Login with email and password.
    
    Args:
        credentials: Email and password
        
    Returns:
        JWT access token and user data
    """
    try:
        user = authenticate_user(db, credentials.email, credentials.password)
        if not user:
            raise HTTPException(
                status_code=401,
                detail="Incorrect email or password",
            )
        
        # Create access token
        access_token = create_access_token(data={"sub": user.id})
        
        logger.info(f"User logged in: {user.email}")
        
        return {
            "access_token": access_token,
            "token_type": "bearer",
            "user": UserResponse.from_orm(user),
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Login error: {str(e)}")
        raise HTTPException(status_code=500, detail="Login failed")


@app.get("/auth/me", response_model=UserResponse)
async def get_me(current_user: User = Depends(get_current_user)):
    """
    Get current authenticated user.
    
    Returns:
        Current user data
    """
    return UserResponse.from_orm(current_user)


@app.put("/auth/profile", response_model=UserResponse)
async def update_profile(
    user_update: UserUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Update user profile information.
    
    Args:
        user_update: Fields to update (email, username, full_name)
        
    Returns:
        Updated user data
    """
    try:
        # Check if email is being changed and if it's already taken
        if user_update.email and user_update.email != current_user.email:
            existing_user = db.query(User).filter(User.email == user_update.email).first()
            if existing_user:
                raise HTTPException(status_code=400, detail="Email already registered")
            current_user.email = user_update.email
        
        # Check if username is being changed and if it's already taken
        if user_update.username and user_update.username != current_user.username:
            existing_username = db.query(User).filter(User.username == user_update.username).first()
            if existing_username:
                raise HTTPException(status_code=400, detail="Username already taken")
            current_user.username = user_update.username
        
        # Update full name if provided
        if user_update.full_name is not None:
            current_user.full_name = user_update.full_name
        
        db.commit()
        db.refresh(current_user)
        
        logger.info(f"Profile updated for user: {current_user.email}")
        
        return UserResponse.from_orm(current_user)
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Profile update error: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to update profile")


@app.put("/auth/password")
async def update_password(
    password_update: PasswordUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Update user password.
    
    Args:
        password_update: Current password and new password
        
    Returns:
        Success message
    """
    try:
        # Verify current password
        if not verify_password(password_update.current_password, current_user.hashed_password):
            raise HTTPException(
                status_code=400,
                detail="Current password is incorrect"
            )
        
        # Update password
        current_user.hashed_password = get_password_hash(password_update.new_password)
        db.commit()
        
        logger.info(f"Password updated for user: {current_user.email}")
        
        return {"message": "Password updated successfully"}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Password update error: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to update password")


@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "service": "elastic-agent-backend"
    }


@app.get("/rankings")
async def get_industry_rankings():
    """
    Get comprehensive industry rankings with RAUIS scores and metrics.
    
    Returns:
        Industry rankings data with detailed metrics
    """
    try:
        # In production, this would query Elasticsearch for real-time data
        # For now, returning comprehensive industry rankings based on market analysis
        rankings = [
            {
                "rank": 1,
                "industry": "Generative AI & Foundation Models",
                "category": "AI & Data",
                "rauisScore": 94.2,
                "baseScore": 95,
                "riskPenalty": 12,
                "saturationLevel": 35,
                "growthMultiplier": 1.85,
                "unicornCount": 87,
                "totalFunding": "$124.5B",
                "avgValuation": "$3.2B",
                "growthRate": 156.3,
                "marketSaturation": "Medium",
                "riskLevel": "Medium",
                "investmentOutlook": "Bullish",
                "topCompanies": ["OpenAI", "Anthropic", "Cohere", "Stability AI", "Character.AI"],
                "emergingTrends": [
                    "Multi-modal AI systems combining text, image, and video",
                    "Enterprise adoption accelerating with custom fine-tuning",
                    "Regulatory frameworks emerging for AI safety and ethics",
                    "Open-source models challenging proprietary leaders"
                ]
            },
            {
                "rank": 2,
                "industry": "Quantum Computing",
                "category": "Emerging Tech",
                "rauisScore": 91.8,
                "baseScore": 92,
                "riskPenalty": 28,
                "saturationLevel": 15,
                "growthMultiplier": 1.72,
                "unicornCount": 23,
                "totalFunding": "$18.3B",
                "avgValuation": "$2.8B",
                "growthRate": 89.4,
                "marketSaturation": "Low",
                "riskLevel": "High",
                "investmentOutlook": "Bullish",
                "topCompanies": ["IonQ", "Rigetti Computing", "PsiQuantum", "Atom Computing", "Xanadu"],
                "emergingTrends": [
                    "Error correction breakthroughs enabling practical applications",
                    "Cloud-based quantum computing services expanding",
                    "Focus on drug discovery and materials science",
                    "Hybrid quantum-classical algorithms gaining traction"
                ]
            },
            {
                "rank": 3,
                "industry": "Climate Tech & Carbon Management",
                "category": "Emerging Tech",
                "rauisScore": 89.5,
                "baseScore": 88,
                "riskPenalty": 18,
                "saturationLevel": 28,
                "growthMultiplier": 1.68,
                "unicornCount": 64,
                "totalFunding": "$89.2B",
                "avgValuation": "$2.4B",
                "growthRate": 78.2,
                "marketSaturation": "Medium",
                "riskLevel": "Medium",
                "investmentOutlook": "Bullish",
                "topCompanies": ["Climeworks", "Northvolt", "Redwood Materials", "Form Energy", "Watershed"],
                "emergingTrends": [
                    "Direct air capture scaling with improved economics",
                    "Battery recycling and circular economy models",
                    "Corporate carbon accounting platforms",
                    "Green hydrogen production innovations"
                ]
            },
            {
                "rank": 4,
                "industry": "Healthcare AI & Precision Medicine",
                "category": "Healthcare",
                "rauisScore": 87.3,
                "baseScore": 89,
                "riskPenalty": 22,
                "saturationLevel": 42,
                "growthMultiplier": 1.55,
                "unicornCount": 112,
                "totalFunding": "$156.7B",
                "avgValuation": "$3.8B",
                "growthRate": 68.9,
                "marketSaturation": "Medium",
                "riskLevel": "Medium",
                "investmentOutlook": "Bullish",
                "topCompanies": ["Tempus AI", "Freenome", "Recursion Pharmaceuticals", "Insitro", "PathAI"],
                "emergingTrends": [
                    "AI-powered drug discovery reducing time to market",
                    "Genomic data analysis at scale",
                    "Personalized treatment protocols based on patient data",
                    "Real-world evidence platforms for clinical trials"
                ]
            },
            {
                "rank": 5,
                "industry": "Cybersecurity & Zero Trust",
                "category": "Enterprise",
                "rauisScore": 85.6,
                "baseScore": 86,
                "riskPenalty": 16,
                "saturationLevel": 58,
                "growthMultiplier": 1.42,
                "unicornCount": 98,
                "totalFunding": "$98.4B",
                "avgValuation": "$2.9B",
                "growthRate": 52.3,
                "marketSaturation": "High",
                "riskLevel": "Low",
                "investmentOutlook": "Bullish",
                "topCompanies": ["Wiz", "Snyk", "Lacework", "Transmit Security", "Exabeam"],
                "emergingTrends": [
                    "Zero Trust architecture becoming enterprise standard",
                    "AI-powered threat detection and response",
                    "Cloud-native security tools",
                    "Identity and access management consolidation"
                ]
            },
            {
                "rank": 6,
                "industry": "Autonomous Systems & Robotics",
                "category": "AI & Data",
                "rauisScore": 83.4,
                "baseScore": 84,
                "riskPenalty": 24,
                "saturationLevel": 38,
                "growthMultiplier": 1.58,
                "unicornCount": 71,
                "totalFunding": "$76.8B",
                "avgValuation": "$2.6B",
                "growthRate": 64.7,
                "marketSaturation": "Medium",
                "riskLevel": "High",
                "investmentOutlook": "Neutral",
                "topCompanies": ["Aurora Innovation", "Nuro", "Figure AI", "Skydio", "Built Robotics"],
                "emergingTrends": [
                    "Warehouse automation accelerating post-pandemic",
                    "Last-mile delivery robots in urban areas",
                    "Humanoid robots for manufacturing",
                    "Agricultural robotics for labor shortages"
                ]
            },
            {
                "rank": 7,
                "industry": "Fintech & Embedded Finance",
                "category": "Finance",
                "rauisScore": 81.2,
                "baseScore": 82,
                "riskPenalty": 28,
                "saturationLevel": 72,
                "growthMultiplier": 1.35,
                "unicornCount": 156,
                "totalFunding": "$245.3B",
                "avgValuation": "$3.1B",
                "growthRate": 42.1,
                "marketSaturation": "High",
                "riskLevel": "Medium",
                "investmentOutlook": "Neutral",
                "topCompanies": ["Stripe", "Plaid", "Chime", "Klarna", "Revolut"],
                "emergingTrends": [
                    "Banking-as-a-Service platforms expanding",
                    "Crypto infrastructure maturing",
                    "Real-time payments becoming standard",
                    "AI-powered fraud detection and risk management"
                ]
            },
            {
                "rank": 8,
                "industry": "Space Tech & Satellite Infrastructure",
                "category": "Emerging Tech",
                "rauisScore": 79.8,
                "baseScore": 81,
                "riskPenalty": 32,
                "saturationLevel": 22,
                "growthMultiplier": 1.48,
                "unicornCount": 34,
                "totalFunding": "$42.7B",
                "avgValuation": "$2.5B",
                "growthRate": 71.3,
                "marketSaturation": "Low",
                "riskLevel": "High",
                "investmentOutlook": "Neutral",
                "topCompanies": ["SpaceX", "Relativity Space", "Rocket Lab", "Planet Labs", "AST SpaceMobile"],
                "emergingTrends": [
                    "Small satellite constellations for global connectivity",
                    "3D-printed rockets reducing launch costs",
                    "Space-based data services for climate monitoring",
                    "Lunar and asteroid mining exploration"
                ]
            },
            {
                "rank": 9,
                "industry": "Web3, Blockchain & Crypto Infrastructure",
                "category": "Emerging Tech",
                "rauisScore": 76.5,
                "baseScore": 78,
                "riskPenalty": 42,
                "saturationLevel": 68,
                "growthMultiplier": 1.22,
                "unicornCount": 89,
                "totalFunding": "$134.6B",
                "avgValuation": "$2.7B",
                "growthRate": 28.6,
                "marketSaturation": "High",
                "riskLevel": "High",
                "investmentOutlook": "Neutral",
                "topCompanies": ["Chainlink", "Alchemy", "Magic Eden", "LayerZero", "Fireblocks"],
                "emergingTrends": [
                    "Enterprise blockchain adoption for supply chain",
                    "Layer 2 scaling solutions improving transaction speeds",
                    "Decentralized identity and data ownership",
                    "Real-world asset tokenization gaining momentum"
                ]
            },
            {
                "rank": 10,
                "industry": "EdTech & Skills Development",
                "category": "Consumer",
                "rauisScore": 74.3,
                "baseScore": 75,
                "riskPenalty": 26,
                "saturationLevel": 64,
                "growthMultiplier": 1.28,
                "unicornCount": 67,
                "totalFunding": "$67.9B",
                "avgValuation": "$2.1B",
                "growthRate": 38.4,
                "marketSaturation": "High",
                "riskLevel": "Medium",
                "investmentOutlook": "Neutral",
                "topCompanies": ["Coursera", "Duolingo", "Udemy", "Guild Education", "Articulate"],
                "emergingTrends": [
                    "AI-powered personalized learning paths",
                    "Micro-credentials and skills-based hiring",
                    "Corporate upskilling programs expanding",
                    "Virtual reality for immersive training"
                ]
            },
            {
                "rank": 11,
                "industry": "Food Tech & Alternative Proteins",
                "category": "Consumer",
                "rauisScore": 72.1,
                "baseScore": 73,
                "riskPenalty": 34,
                "saturationLevel": 52,
                "growthMultiplier": 1.32,
                "unicornCount": 45,
                "totalFunding": "$34.2B",
                "avgValuation": "$1.9B",
                "growthRate": 44.2,
                "marketSaturation": "Medium",
                "riskLevel": "High",
                "investmentOutlook": "Neutral",
                "topCompanies": ["Impossible Foods", "Perfect Day", "Apeel Sciences", "Eat Just", "Motif FoodWorks"],
                "emergingTrends": [
                    "Precision fermentation scaling production",
                    "Plant-based seafood alternatives emerging",
                    "Food waste reduction technologies",
                    "Cellular agriculture for lab-grown meat"
                ]
            },
            {
                "rank": 12,
                "industry": "Proptech & Smart Buildings",
                "category": "Enterprise",
                "rauisScore": 69.8,
                "baseScore": 71,
                "riskPenalty": 22,
                "saturationLevel": 58,
                "growthMultiplier": 1.18,
                "unicornCount": 52,
                "totalFunding": "$52.8B",
                "avgValuation": "$2.3B",
                "growthRate": 32.7,
                "marketSaturation": "High",
                "riskLevel": "Medium",
                "investmentOutlook": "Neutral",
                "topCompanies": ["WeWork", "Opendoor", "Compass", "Procore", "SmartRent"],
                "emergingTrends": [
                    "IoT sensors for energy optimization",
                    "Digital twins for building management",
                    "Flexible workspace solutions",
                    "Green building certification platforms"
                ]
            },
            {
                "rank": 13,
                "industry": "Supply Chain & Logistics Tech",
                "category": "Enterprise",
                "rauisScore": 67.4,
                "baseScore": 69,
                "riskPenalty": 18,
                "saturationLevel": 66,
                "growthMultiplier": 1.15,
                "unicornCount": 78,
                "totalFunding": "$78.3B",
                "avgValuation": "$2.4B",
                "growthRate": 28.9,
                "marketSaturation": "High",
                "riskLevel": "Low",
                "investmentOutlook": "Neutral",
                "topCompanies": ["Flexport", "Project44", "Convoy", "FourKites", "Shippo"],
                "emergingTrends": [
                    "Real-time supply chain visibility platforms",
                    "AI-powered demand forecasting",
                    "Sustainable logistics and carbon tracking",
                    "Autonomous vehicles for freight"
                ]
            },
            {
                "rank": 14,
                "industry": "Gaming & Metaverse Platforms",
                "category": "Consumer",
                "rauisScore": 64.9,
                "baseScore": 67,
                "riskPenalty": 36,
                "saturationLevel": 74,
                "growthMultiplier": 1.12,
                "unicornCount": 93,
                "totalFunding": "$112.4B",
                "avgValuation": "$2.8B",
                "growthRate": 18.3,
                "marketSaturation": "High",
                "riskLevel": "High",
                "investmentOutlook": "Bearish",
                "topCompanies": ["Epic Games", "Roblox", "Discord", "Niantic", "Unity Technologies"],
                "emergingTrends": [
                    "Cross-platform gaming experiences",
                    "User-generated content monetization",
                    "Virtual real estate and digital goods",
                    "Cloud gaming reducing hardware barriers"
                ]
            },
            {
                "rank": 15,
                "industry": "E-commerce Enablement",
                "category": "Consumer",
                "rauisScore": 62.3,
                "baseScore": 64,
                "riskPenalty": 24,
                "saturationLevel": 82,
                "growthMultiplier": 1.08,
                "unicornCount": 124,
                "totalFunding": "$156.8B",
                "avgValuation": "$2.6B",
                "growthRate": 14.6,
                "marketSaturation": "High",
                "riskLevel": "Medium",
                "investmentOutlook": "Bearish",
                "topCompanies": ["Shopify", "Faire", "Instacart", "Gopuff", "Getir"],
                "emergingTrends": [
                    "Social commerce integration with TikTok and Instagram",
                    "Quick commerce and ultra-fast delivery",
                    "AI-powered product recommendations",
                    "Sustainability and ethical sourcing tracking"
                ]
            }
        ]
        
        logger.info("Industry rankings data retrieved successfully")
        return {"rankings": rankings}
        
    except Exception as e:
        logger.error(f"Failed to fetch rankings: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to retrieve industry rankings")


@app.post("/ask", response_model=ApiResponse)
async def ask_agent(request: AskRequest):
    """
    Process strategic investment questions using Kibana Agent Builder.
    
    Flow:
    1. Receive question from frontend
    2. Execute Kibana Agent
    3. Transform response to frontend format
    4. Return structured data
    
    Args:
        request: Question from user
        
    Returns:
        Structured analysis response
    """
    try:
        logger.info(f"Processing question: {request.question[:50]}...")
        
        # Execute Kibana Agent Builder
        agent_output = await run_agent(request.question)
        logger.info("Agent execution successful")
        
        # Transform to frontend format
        formatted_response = transform_agent_response(agent_output)
        logger.info("Response transformation successful")
        
        return formatted_response
        
    except Exception as e:
        logger.error(f"Error processing request: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to process question: {str(e)}"
        )


@app.get("/alerts")
async def get_alerts():
    """
    Fetch alerts from Kibana Alerting API.
    
    Returns:
        List of active and recent alerts
    """
    try:
        alerts = await get_kibana_alerts()
        return {"alerts": alerts}
    except Exception as e:
        logger.error(f"Error fetching alerts: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to fetch alerts: {str(e)}"
        )


@app.post("/reports/generate")
async def generate_report(
    request: ReportRequest,
    current_user: User = Depends(get_current_user)
):
    """
    Generate downloadable reports in CSV or PDF format.
    
    Args:
        request: Report configuration (type, format, date range)
        current_user: Authenticated user
        
    Returns:
        File download response
    """
    try:
        # Mock dashboard data (in production, fetch from database/Elasticsearch)
        dashboard_data = {
            'kpis': [
                {'title': 'Total Unicorns', 'value': '1,200+', 'trend': 'up', 'trendValue': '+15%'},
                {'title': 'Total Valuation', 'value': '$3.8T', 'trend': 'up', 'trendValue': '+8%'},
                {'title': 'Average Valuation', 'value': '$3.2B', 'trend': 'down', 'trendValue': '-2%'},
                {'title': 'New This Year', 'value': '142', 'trend': 'up', 'trendValue': '+12%'},
            ],
            'industryScores': [
                {'industry': 'AI & Machine Learning', 'baseScore': 95, 'risk': 15, 'saturation': 45, 'multiplier': 1.8, 'finalRAUIS': 94},
                {'industry': 'Fintech', 'baseScore': 88, 'risk': 25, 'saturation': 75, 'multiplier': 1.2, 'finalRAUIS': 82},
                {'industry': 'Healthcare Tech', 'baseScore': 92, 'risk': 20, 'saturation': 55, 'multiplier': 1.5, 'finalRAUIS': 89},
                {'industry': 'E-commerce', 'baseScore': 85, 'risk': 30, 'saturation': 80, 'multiplier': 1.1, 'finalRAUIS': 78},
                {'industry': 'Cybersecurity', 'baseScore': 90, 'risk': 18, 'saturation': 50, 'multiplier': 1.6, 'finalRAUIS': 91},
            ],
            'risks': [
                {'name': 'Market Volatility', 'level': 'high', 'description': 'Increased market volatility may impact valuations'},
                {'name': 'Regulatory Changes', 'level': 'medium', 'description': 'New regulations in key markets'},
                {'name': 'Competition Surge', 'level': 'medium', 'description': 'Rising competition in saturated sectors'},
            ]
        }
        
        # Fetch alerts (in production, from database)
        alerts_data = [
            {
                'name': 'High Valuation Alert',
                'status': 'active',
                'severity': 'high',
                'message': 'Unicorn valuation exceeded threshold',
                'timestamp': datetime.now().isoformat(),
                'source': 'Valuation Monitor'
            },
            {
                'name': 'Market Saturation Warning',
                'status': 'active',
                'severity': 'medium',
                'message': 'Sector showing saturation signs',
                'timestamp': datetime.now().isoformat(),
                'source': 'Market Analysis'
            }
        ]
        
        # Generate report based on type and format
        if request.format == 'csv':
            if request.report_type == 'dashboard':
                report_bytes = report_generator.generate_csv_dashboard_report(dashboard_data)
                filename = f"unicorn_dashboard_{datetime.now().strftime('%Y%m%d_%H%M%S')}.csv"
                media_type = "text/csv"
            elif request.report_type == 'alerts':
                report_bytes = report_generator.generate_csv_alerts_report(alerts_data)
                filename = f"unicorn_alerts_{datetime.now().strftime('%Y%m%d_%H%M%S')}.csv"
                media_type = "text/csv"
            else:  # combined
                report_bytes = report_generator.generate_csv_combined_report(dashboard_data, alerts_data)
                filename = f"unicorn_combined_{datetime.now().strftime('%Y%m%d_%H%M%S')}.csv"
                media_type = "text/csv"
        
        else:  # PDF
            if request.report_type == 'dashboard':
                report_bytes = report_generator.generate_pdf_dashboard_report(dashboard_data)
                filename = f"unicorn_dashboard_{datetime.now().strftime('%Y%m%d_%H%M%S')}.pdf"
                media_type = "application/pdf"
            elif request.report_type == 'alerts':
                report_bytes = report_generator.generate_pdf_alerts_report(alerts_data)
                filename = f"unicorn_alerts_{datetime.now().strftime('%Y%m%d_%H%M%S')}.pdf"
                media_type = "application/pdf"
            else:  # combined
                report_bytes = report_generator.generate_pdf_combined_report(dashboard_data, alerts_data)
                filename = f"unicorn_combined_{datetime.now().strftime('%Y%m%d_%H%M%S')}.pdf"
                media_type = "application/pdf"
        
        logger.info(f"Report generated for user {current_user.email}: {filename}")
        
        return Response(
            content=report_bytes,
            media_type=media_type,
            headers={
                "Content-Disposition": f"attachment; filename={filename}"
            }
        )
        
    except Exception as e:
        logger.error(f"Report generation error: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to generate report: {str(e)}"
        )


if __name__ == "__main__":
    import uvicorn
    import os
    
    port = int(os.getenv("PORT", 8000))
    uvicorn.run(app, host="0.0.0.0", port=port)
