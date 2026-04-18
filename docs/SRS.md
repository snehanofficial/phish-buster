# 📄 Software Requirements Specification (SRS)
## Project: PhishBuster – AI-Assisted Phishing Detection with Immutable Threat Logging

---

## 1. Introduction

### 1.1 Purpose
PhishBuster is a web-based cybersecurity system designed to detect phishing URLs using AI-assisted analysis and record confirmed threats immutably using blockchain concepts. The system provides real-time feedback and a dashboard for monitoring suspicious activities.

---

### 1.2 Scope
The system allows users to:
- Input suspicious URLs
- Analyze them using AI and heuristic checks
- View phishing risk results
- Log confirmed threats immutably (simulated blockchain)
- Monitor threats via a dashboard

This project is designed for rapid development and demonstration in a hackathon environment.

---

### 1.3 Definitions
- **Phishing:** Fraudulent attempt to obtain sensitive data
- **Heuristic Analysis:** Rule-based detection (e.g., domain mismatch)
- **Immutable Log:** Tamper-proof record (simulated blockchain)
- **AI Classification:** Using pre-trained APIs to classify phishing likelihood

---

## 2. Overall Description

### 2.1 Product Perspective
PhishBuster is a standalone web application with:
- Frontend dashboard
- Backend API server
- AI integration
- Simulated blockchain logging system

---

### 2.2 User Classes
- **General User:** Inputs URLs and views results
- **Admin (optional):** Views logs and threat analytics

---

### 2.3 Operating Environment
- Browser-based (Chrome/Edge)
- Express.js backend
- Internet required for AI API calls

---

### 2.4 Constraints
- Must be buildable within 24 hours
- AI must use external APIs (no model training)
- Blockchain is simulated or testnet-based

---

## 3. System Features

---

### 3.1 URL Analysis Module

#### Description:
Users input a URL, which is analyzed for phishing indicators.

#### Functional Requirements:
- Accept URL input
- Fetch metadata (title, domain, favicon)
- Perform heuristic checks:
  - Domain mismatch
  - Suspicious keywords
  - Form action mismatch (simulated)

---

### 3.2 AI Classification Module

#### Description:
Uses AI API to classify whether the URL is phishing.

#### Functional Requirements:
- Send URL or metadata to AI API
- Receive classification:
  - Safe / Suspicious / Phishing
- Display confidence score

---

### 3.3 Threat Detection Engine

#### Description:
Combines heuristic + AI results

#### Functional Requirements:
- Merge heuristic score + AI result
- Generate final risk score
- Trigger alerts if risk is high

---

### 3.4 Immutable Threat Logging (Blockchain Simulation)

#### Description:
Logs confirmed phishing URLs as tamper-proof entries

#### Functional Requirements:
- Generate hash of:
  - URL
  - AI result
  - Timestamp
- Store in:
  - JSON chain OR testnet blockchain
- Display transaction/hash ID

---

### 3.5 Dashboard Module

#### Description:
Displays threat logs and analytics

#### Functional Requirements:
- List all logged threats
- Show:
  - URL
  - Risk score
  - Timestamp
  - Hash
- Visual charts (optional)

---

### 3.6 Real-Time Alerts (Optional Enhancement)

#### Description:
Notify user instantly when threat detected

#### Functional Requirements:
- Show alert popup
- Highlight high-risk URLs

---

## 4. External Interfaces

---

### 4.1 User Interface
- Input field for URL
- Analyze button
- Result panel (AI + heuristic)
- Dashboard view

---

### 4.2 API Interfaces
- AI API (OpenAI / HuggingFace)
- Optional blockchain testnet (via ethers.js)

---

### 4.3 Hardware Interfaces
- None required

---

## 5. System Architecture

```

[ React Frontend ]
↓
[ Express Backend API ]
↓
[ AI API ]   [ Heuristic Engine ]
↓
[ Threat Analyzer ]
↓
[ Blockchain Logger (Simulated) ]
↓
[ Database (SQLite) ]

```

---

## 6. Technology Stack

### Frontend:
- React + Vite
- Tailwind CSS + shadcn/ui
- Recharts (optional)

### Backend:
- Node.js + Express
- JWT + bcrypt (optional auth)
- Zod (validation)
- Helmet + Rate Limit

### Database:
- SQLite + Prisma

### Blockchain:
- ethers.js
- Hardhat (local/testnet)
- OpenZeppelin (optional)

### AI:
- OpenAI API / HuggingFace API

---

## 7. Non-Functional Requirements

---

### 7.1 Performance
- Response time < 3 seconds for analysis

---

### 7.2 Security
- Input validation (Zod)
- Rate limiting
- Secure API handling

---

### 7.3 Usability
- Clean UI
- Simple workflow (input → result → log)

---

### 7.4 Reliability
- System should not crash on invalid URLs
- Graceful error handling

---

## 8. Assumptions & Dependencies

- Internet required for AI API
- Blockchain logging can be simulated if testnet fails
- User provides valid URL format

---

## 9. Future Enhancements

- Browser extension version
- Real DOM scraping
- Community threat sharing
- Advanced ML model

---

## 10. Demo Flow (Critical for Hackathon)

1. User enters phishing URL
2. Clicks "Analyze"
3. System shows:
   - AI result
   - Heuristic warnings
4. Risk score displayed
5. User clicks "Log Threat"
6. Hash/transaction shown
7. Dashboard updates

---

## 11. Conclusion

PhishBuster demonstrates a practical integration of AI and blockchain in cybersecurity by providing real-time phishing detection and immutable threat logging. The system is optimized for hackathon environments with a strong focus on demo impact and usability.

---