# PopHIVE MCP Connector Integration Plan for TUF App

## Executive Summary

This document outlines the integration of PopHIVE MCP Connector into the TUF App to provide medical-grade, evidence-based health data for personalized fitness coaching. PopHIVE provides real-time epidemiological data from Yale University that will enhance JARVIS's ability to deliver personalized recommendations for the 40+ demographic.

## Current State Analysis

### TUF App Architecture
- **Frontend**: React 19 with TypeScript, Vite, TailwindCSS
- **Backend**: Express.js (minimal setup, currently only serves static files)
- **AI Coach**: JARVIS (Claude 3.5 Sonnet integration)
- **API Endpoints**: `/api/jarvis` routes defined but not wired into server
- **Key Files**:
  - `server/jarvis-api.ts` - Claude API integration
  - `server/routes/jarvis.ts` - Express router (not currently mounted)
  - `client/src/components/JarvisChat.tsx` - Chat UI component
  - `client/src/pages/JarvisChat.tsx` - Chat page

### Current JARVIS Capabilities
- Personalized fitness coaching for 40+ adults
- Sarcopenia prevention focus
- Generic health condition modifications
- Hardcoded macro targets (0.8-1g protein per lb)
- Quick response templates for workouts, nutrition, recovery

### PopHIVE Available Data
- **Chronic Obesity** (`chronic_obesity`): Prevalence by age/gender/year
- **Chronic Diabetes** (`chronic_diabetes`): Prevalence by age/gender/year
- **Hospital Capacity** (`hospital_capacity`): State-level bed utilization
- **Mental Health ED Visits** (`youth_ed_mental_health`): Emergency department data
- **Injury & Overdose** (`injury_overdose`): Vital statistics data
- **Respiratory Data** (wastewater, trends): COVID-19 era surveillance
- **Search Trends**: Google Health Trends data

## Integration Strategy

### Phase 1: Foundation (Week 1)

#### 1.1 Wire Express Routes
- **File**: `server/index.ts`
- **Task**: Mount the JARVIS router to handle `/api/jarvis` endpoints
- **Implementation**:
  ```typescript
  import jarvisRouter from "./routes/jarvis.js";
  app.use(express.json());
  app.use("/api/jarvis", jarvisRouter);
  ```

#### 1.2 Create PopHIVE Service Layer
- **File**: `server/pophive-service.ts` (NEW)
- **Purpose**: Abstraction layer for PopHIVE MCP queries
- **Functions**:
  - `getObesityPrevalence(ageGroup: string, year?: number)`
  - `getDiabetesPrevalence(ageGroup: string, year?: number)`
  - `getHealthDataByCondition(condition: string, demographics: object)`
  - `compareHealthMetrics(metric: string, states: string[])`
  - `analyzeHealthTrends(metric: string, timeRange: string)`

#### 1.3 Extend JARVIS System Prompt
- **File**: `server/jarvis-api.ts`
- **Task**: Add PopHIVE context to system prompt
- **Addition**: Include prevalence data and evidence-based guidelines for common 40+ conditions

#### 1.4 Test Basic Integration
- Test `/api/jarvis` endpoint with simple queries
- Verify PopHIVE data retrieval
- Confirm Claude API integration works

### Phase 2: Personalization (Week 2)

#### 2.1 Enhance User Profile Schema
- **File**: `server/routes/jarvis.ts` and shared types
- **Task**: Extend user profile to include health conditions
- **New Fields**:
  ```typescript
  userProfile: {
    age: number;
    fitnessLevel: "beginner" | "intermediate" | "advanced";
    goals: string[];
    injuries: string[];
    healthConditions: string[]; // NEW: ["diabetes", "hypertension", "arthritis"]
    gender?: "male" | "female" | "other";
    location?: string; // For state-level data
  }
  ```

#### 2.2 Create Health Condition Modifier Service
- **File**: `server/health-condition-service.ts` (NEW)
- **Purpose**: Generate exercise and nutrition modifications based on PopHIVE data
- **Functions**:
  - `getExerciseModifications(condition: string, ageGroup: string)`
  - `getNutritionRecommendations(condition: string, ageGroup: string)`
  - `getRecoveryProtocol(condition: string)`

#### 2.3 Integrate PopHIVE into JARVIS Responses
- **File**: `server/jarvis-api.ts`
- **Task**: Enhance `generateJarvisResponse()` to include PopHIVE data
- **Implementation**:
  - Query PopHIVE for user's health conditions
  - Include prevalence context in system prompt
  - Provide condition-specific modifications
  - Add evidence-based citations

#### 2.4 Update Client to Send Health Data
- **File**: `client/src/components/JarvisChat.tsx`
- **Task**: Collect and send health condition data with messages
- **UI Addition**: Health condition selector in chat interface

### Phase 3: Intelligence (Week 3)

#### 3.1 Create Health Analytics Service
- **File**: `server/health-analytics-service.ts` (NEW)
- **Purpose**: Analyze user progress against population data
- **Functions**:
  - `calculateUserPercentile(metric: string, userValue: number, ageGroup: string)`
  - `generateComparativeInsights(userMetrics: object, populationData: object)`
  - `predictHealthOutcomes(userProfile: object, adherenceRate: number)`

#### 3.2 Add Comparative Metrics to Dashboard
- **File**: `client/src/pages/Progress.tsx` and `Home.tsx`
- **Task**: Display population health context
- **Metrics**:
  - "You're in the top 25% for strength in your age group"
  - "Your fitness level reduces sarcopenia risk by 60%"
  - "Members in your age group average 12 workouts/month"

#### 3.3 Create Health Risk Assessment
- **File**: `server/health-risk-service.ts` (NEW)
- **Purpose**: Identify prevention opportunities
- **Functions**:
  - `assessSarcopeniaRisk(age: number, activityLevel: string)`
  - `assessCVDRisk(age: number, conditions: string[])`
  - `assessOsteoporosisRisk(age: number, gender: string)`

#### 3.4 Generate Personalized Health Reports
- **File**: `server/report-generator.ts` (NEW)
- **Purpose**: Create evidence-based health coaching reports
- **Outputs**:
  - "Your 30-Day Health Report"
  - "Sarcopenia Prevention Plan"
  - "Condition-Specific Exercise Guide"

### Phase 4: Content (Week 4)

#### 4.1 Create Dynamic Content Generator
- **File**: `server/content-generator.ts` (NEW)
- **Purpose**: Generate health articles using PopHIVE data
- **Functions**:
  - `generateConditionGuide(condition: string, ageGroup: string)`
  - `generateNutritionArticle(condition: string, nutrient: string)`
  - `generateExerciseProtocol(condition: string, fitnessLevel: string)`

#### 4.2 Build Resource Library
- **File**: `client/src/pages/Resources.tsx` (NEW)
- **Task**: Display evidence-based health content
- **Content Types**:
  - Condition-specific guides
  - Nutrition recommendations
  - Exercise protocols
  - Research summaries

#### 4.3 Add Research Citations
- **File**: `server/citation-service.ts` (NEW)
- **Purpose**: Track and display PopHIVE data sources
- **Implementation**: Include source attribution in all recommendations

#### 4.4 Create Premium Feature
- **File**: `client/src/pages/PremiumPlans.tsx` (NEW)
- **Task**: Introduce "Health-Optimized Plans" tier
- **Features**:
  - PopHIVE-powered personalization
  - Advanced health analytics
  - Condition-specific coaching
  - Monthly health reports

## Implementation Details

### New Files to Create

1. **`server/pophive-service.ts`** - PopHIVE MCP wrapper
2. **`server/health-condition-service.ts`** - Condition-specific modifications
3. **`server/health-analytics-service.ts`** - User vs. population analysis
4. **`server/health-risk-service.ts`** - Risk assessment
5. **`server/report-generator.ts`** - Health report generation
6. **`server/content-generator.ts`** - Dynamic content creation
7. **`server/citation-service.ts`** - Source attribution
8. **`client/src/pages/Resources.tsx`** - Resource library UI
9. **`client/src/pages/PremiumPlans.tsx`** - Premium tier UI
10. **`client/src/components/HealthConditionSelector.tsx`** - Health data input

### Files to Modify

1. **`server/index.ts`** - Wire Express routes
2. **`server/jarvis-api.ts`** - Enhance JARVIS system prompt and response generation
3. **`server/routes/jarvis.ts`** - Extend user profile schema
4. **`client/src/components/JarvisChat.tsx`** - Add health condition collection
5. **`client/src/pages/Home.tsx`** - Add population health context
6. **`client/src/pages/Progress.tsx`** - Add comparative metrics
7. **`client/src/App.tsx`** - Add new routes for resources and premium plans

## Data Flow

### User Query with Health Context
```
User: "I have arthritis, how should I modify my workouts?"
  ↓
Client sends: { message, healthConditions: ["arthritis"], userProfile }
  ↓
Server receives in /api/jarvis
  ↓
PopHIVE Service queries: arthritis prevalence, exercise guidelines
  ↓
Health Condition Service generates modifications
  ↓
JARVIS System Prompt enriched with:
  - Arthritis prevalence in user's age group
  - Evidence-based exercise modifications
  - Nutrition recommendations
  - Recovery protocols
  ↓
Claude generates personalized response
  ↓
Response includes:
  - Personalized modifications
  - Population context
  - Evidence citations
  ↓
Client displays response with health insights
```

## API Endpoints

### Existing (to be wired)
- `POST /api/jarvis` - Generate JARVIS response
- `POST /api/jarvis/quick` - Quick response templates
- `POST /api/jarvis/health-check` - Health check

### New Endpoints
- `GET /api/health/prevalence/:condition` - Get prevalence data
- `GET /api/health/analytics/:userId` - Get user health analytics
- `GET /api/health/risk-assessment` - Get risk assessment
- `POST /api/health/report` - Generate health report
- `GET /api/content/condition/:condition` - Get condition guide
- `GET /api/content/resources` - Get resource library

## Success Metrics

### Phase 1
- ✅ Express routes wired and working
- ✅ PopHIVE data successfully queried
- ✅ JARVIS responses include PopHIVE context

### Phase 2
- ✅ User health conditions stored and used
- ✅ Personalized modifications generated
- ✅ Health condition selector UI working

### Phase 3
- ✅ Comparative metrics displayed
- ✅ Risk assessments generated
- ✅ Health reports created

### Phase 4
- ✅ Dynamic content generated
- ✅ Resource library populated
- ✅ Premium tier implemented

## Technical Considerations

### Security
- Validate all user health data inputs
- Sanitize PopHIVE data before display
- Implement rate limiting on API endpoints
- Secure storage of user health conditions

### Performance
- Cache PopHIVE data queries (update quarterly)
- Implement pagination for large datasets
- Use background jobs for report generation
- Optimize database queries

### Data Privacy
- Comply with HIPAA guidelines
- Encrypt sensitive health data
- Implement user consent for data collection
- Provide data export functionality

## Dependencies

### New NPM Packages
- None required (PopHIVE accessed via MCP CLI)

### Environment Variables
- `OPENAI_API_KEY` (already configured)
- `POPHIVE_ENABLED` (enable/disable PopHIVE features)

## Rollout Plan

1. **Week 1**: Deploy Phase 1 (foundation)
2. **Week 2**: Deploy Phase 2 (personalization)
3. **Week 3**: Deploy Phase 3 (intelligence)
4. **Week 4**: Deploy Phase 4 (content) + Premium tier launch

## Competitive Advantages

1. **Medical-Grade Personalization**: Yale-backed health data
2. **Evidence-Based Coaching**: Every recommendation backed by research
3. **Condition-Specific Focus**: Tailored for 40+ demographic
4. **Population Context**: Users see how they compare to peers
5. **Preventive Health**: Focus on sarcopenia prevention and longevity
6. **Trust & Credibility**: Yale University partnership
7. **Unique Moat**: Only fitness app for 40+ with PopHIVE integration

## Risk Mitigation

| Risk | Mitigation |
|------|-----------|
| PopHIVE data unavailable | Fallback to hardcoded guidelines |
| Inaccurate health recommendations | Disclaimer + medical review process |
| User privacy concerns | Clear consent + HIPAA compliance |
| Integration complexity | Phased rollout + thorough testing |
| Performance degradation | Caching + optimization |

## Next Steps

1. ✅ Review and approve integration plan
2. ⏳ Create PopHIVE service layer
3. ⏳ Wire Express routes
4. ⏳ Extend JARVIS system prompt
5. ⏳ Implement Phase 2-4 features
6. ⏳ Comprehensive testing
7. ⏳ Deploy to production

---

**Document Version**: 1.0
**Last Updated**: April 4, 2026
**Status**: Ready for Implementation
