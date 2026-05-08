-- =====================================================
-- AuditMate Pro Database Schema
-- PostgreSQL 16
-- =====================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- ORGANIZATIONS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS organizations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  name_ar VARCHAR(255),
  description TEXT,
  logo VARCHAR(500),
  website VARCHAR(255),
  email VARCHAR(255) UNIQUE NOT NULL,
  phone VARCHAR(20),
  address TEXT,
  city VARCHAR(100),
  country VARCHAR(100),
  industry VARCHAR(100),
  subscription_plan VARCHAR(50) DEFAULT 'STARTER',
  max_users INTEGER DEFAULT 5,
  max_audits_per_month INTEGER DEFAULT 50,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP
);

CREATE INDEX idx_organizations_email ON organizations(email);
CREATE INDEX idx_organizations_is_active ON organizations(is_active);

-- =====================================================
-- USERS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  email VARCHAR(255) NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  role VARCHAR(50) DEFAULT 'AUDITOR' CHECK (role IN ('SUPER_ADMIN', 'QA_MANAGER', 'LEAD_AUDITOR', 'AUDITOR', 'SUPPLIER', 'VIEWER', 'CLIENT')),
  phone VARCHAR(20),
  avatar VARCHAR(500),
  is_active BOOLEAN DEFAULT true,
  is_verified BOOLEAN DEFAULT false,
  is_two_fa_enabled BOOLEAN DEFAULT false,
  last_login TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP,
  UNIQUE(organization_id, email)
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_organization_id ON users(organization_id);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_is_active ON users(is_active);

-- =====================================================
-- SUPPLIERS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS suppliers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  name_ar VARCHAR(255),
  email VARCHAR(255),
  phone VARCHAR(20),
  address TEXT,
  city VARCHAR(100),
  country VARCHAR(100),
  category VARCHAR(100),
  risk_level VARCHAR(50) DEFAULT 'MEDIUM' CHECK (risk_level IN ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL')),
  compliance_score DECIMAL(5,2),
  last_audit_date TIMESTAMP,
  next_audit_date TIMESTAMP,
  audit_frequency_days INTEGER,
  contact_person VARCHAR(255),
  contact_email VARCHAR(255),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP
);

CREATE INDEX idx_suppliers_organization_id ON suppliers(organization_id);
CREATE INDEX idx_suppliers_risk_level ON suppliers(risk_level);
CREATE INDEX idx_suppliers_compliance_score ON suppliers(compliance_score);

-- =====================================================
-- AUDIT_STANDARDS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS audit_standards (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  name_ar VARCHAR(100),
  description TEXT,
  version VARCHAR(20),
  sections_count INTEGER,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(organization_id, name)
);

CREATE INDEX idx_audit_standards_organization_id ON audit_standards(organization_id);

-- =====================================================
-- AUDITS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS audits (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  title_ar VARCHAR(255),
  description TEXT,
  audit_type VARCHAR(50) NOT NULL CHECK (audit_type IN ('INTERNAL', 'EXTERNAL', 'SUPPLIER', 'PROCESS', 'PRODUCT', 'COMPLIANCE')),
  status VARCHAR(50) DEFAULT 'DRAFT' CHECK (status IN ('DRAFT', 'PLANNED', 'ASSIGNED', 'IN_PROGRESS', 'REVIEW', 'APPROVED', 'CLOSED', 'CANCELLED')),
  audit_standard_id UUID REFERENCES audit_standards(id),
  auditee_id UUID,
  lead_auditor_id UUID NOT NULL REFERENCES users(id),
  supplier_id UUID REFERENCES suppliers(id),
  scheduled_date DATE NOT NULL,
  start_date TIMESTAMP,
  end_date TIMESTAMP,
  location VARCHAR(255),
  scope TEXT,
  scope_ar TEXT,
  findings_count INTEGER DEFAULT 0,
  compliance_score DECIMAL(5,2),
  risk_level VARCHAR(50),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP,
  created_by UUID NOT NULL REFERENCES users(id),
  updated_by UUID REFERENCES users(id),
  approved_by UUID REFERENCES users(id),
  approved_at TIMESTAMP
);

CREATE INDEX idx_audits_organization_id ON audits(organization_id);
CREATE INDEX idx_audits_status ON audits(status);
CREATE INDEX idx_audits_lead_auditor_id ON audits(lead_auditor_id);
CREATE INDEX idx_audits_supplier_id ON audits(supplier_id);
CREATE INDEX idx_audits_created_at ON audits(created_at);

-- =====================================================
-- AUDIT_TEAM_MEMBERS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS audit_team_members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  audit_id UUID NOT NULL REFERENCES audits(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role VARCHAR(50) DEFAULT 'MEMBER' CHECK (role IN ('LEAD', 'MEMBER', 'OBSERVER')),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(audit_id, user_id)
);

CREATE INDEX idx_audit_team_members_audit_id ON audit_team_members(audit_id);
CREATE INDEX idx_audit_team_members_user_id ON audit_team_members(user_id);

-- =====================================================
-- CHECKLISTS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS checklists (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  name_ar VARCHAR(255),
  description TEXT,
  audit_standard_id UUID REFERENCES audit_standards(id),
  audit_type VARCHAR(50),
  is_template BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  version INTEGER DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP,
  created_by UUID NOT NULL REFERENCES users(id)
);

CREATE INDEX idx_checklists_organization_id ON checklists(organization_id);
CREATE INDEX idx_checklists_is_template ON checklists(is_template);
CREATE INDEX idx_checklists_audit_standard_id ON checklists(audit_standard_id);

-- =====================================================
-- CHECKLIST_QUESTIONS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS checklist_questions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  checklist_id UUID NOT NULL REFERENCES checklists(id) ON DELETE CASCADE,
  question_number INTEGER NOT NULL,
  question TEXT NOT NULL,
  question_ar TEXT,
  response_type VARCHAR(50) NOT NULL CHECK (response_type IN ('YES_NO', 'PASS_FAIL', 'TEXT', 'NUMERIC', 'SELECT', 'MULTI_SELECT', 'FILE', 'DATE')),
  options TEXT,
  is_mandatory BOOLEAN DEFAULT true,
  weight DECIMAL(5,2),
  category VARCHAR(100),
  category_ar VARCHAR(100),
  help_text TEXT,
  help_text_ar TEXT,
  conditional_logic TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_checklist_questions_checklist_id ON checklist_questions(checklist_id);

-- =====================================================
-- AUDIT_RESPONSES TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS audit_responses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  audit_id UUID NOT NULL REFERENCES audits(id) ON DELETE CASCADE,
  checklist_question_id UUID NOT NULL REFERENCES checklist_questions(id) ON DELETE CASCADE,
  response_value TEXT,
  response_comments TEXT,
  response_comments_ar TEXT,
  evidence_urls TEXT,
  respondent_id UUID NOT NULL REFERENCES users(id),
  is_compliant BOOLEAN,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(audit_id, checklist_question_id)
);

CREATE INDEX idx_audit_responses_audit_id ON audit_responses(audit_id);
CREATE INDEX idx_audit_responses_respondent_id ON audit_responses(respondent_id);

-- =====================================================
-- FINDINGS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS findings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  audit_id UUID NOT NULL REFERENCES audits(id) ON DELETE CASCADE,
  audit_response_id UUID REFERENCES audit_responses(id),
  title VARCHAR(255) NOT NULL,
  title_ar VARCHAR(255),
  description TEXT NOT NULL,
  description_ar TEXT,
  category VARCHAR(100),
  category_ar VARCHAR(100),
  severity VARCHAR(50) DEFAULT 'MEDIUM' CHECK (severity IN ('CRITICAL', 'MAJOR', 'MINOR', 'OBSERVATION')),
  evidence_urls TEXT,
  finding_number VARCHAR(50),
  is_recurring BOOLEAN DEFAULT false,
  previous_finding_id UUID,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP,
  created_by UUID NOT NULL REFERENCES users(id)
);

CREATE INDEX idx_findings_organization_id ON findings(organization_id);
CREATE INDEX idx_findings_audit_id ON findings(audit_id);
CREATE INDEX idx_findings_severity ON findings(severity);
CREATE INDEX idx_findings_is_recurring ON findings(is_recurring);

-- =====================================================
-- CAPAS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS capas (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  finding_id UUID NOT NULL REFERENCES findings(id) ON DELETE CASCADE,
  type VARCHAR(50) NOT NULL CHECK (type IN ('CORRECTIVE', 'PREVENTIVE')),
  status VARCHAR(50) DEFAULT 'OPEN' CHECK (status IN ('OPEN', 'IN_PROGRESS', 'VERIFICATION', 'ON_HOLD', 'OVERDUE', 'CLOSED')),
  title VARCHAR(255) NOT NULL,
  title_ar VARCHAR(255),
  root_cause TEXT NOT NULL,
  root_cause_ar TEXT,
  action TEXT NOT NULL,
  action_ar TEXT,
  owner_id UUID NOT NULL REFERENCES users(id),
  due_date DATE NOT NULL,
  verification_date TIMESTAMP,
  closure_date TIMESTAMP,
  evidence_urls TEXT,
  risk_score_after DECIMAL(5,2),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP,
  created_by UUID NOT NULL REFERENCES users(id),
  approved_by UUID REFERENCES users(id),
  approved_at TIMESTAMP
);

CREATE INDEX idx_capas_organization_id ON capas(organization_id);
CREATE INDEX idx_capas_status ON capas(status);
CREATE INDEX idx_capas_owner_id ON capas(owner_id);
CREATE INDEX idx_capas_due_date ON capas(due_date);
CREATE INDEX idx_capas_finding_id ON capas(finding_id);

-- =====================================================
-- CAPA_COMMENTS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS capa_comments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  capa_id UUID NOT NULL REFERENCES capas(id) ON DELETE CASCADE,
  comment TEXT NOT NULL,
  comment_ar TEXT,
  comment_type VARCHAR(50) DEFAULT 'COMMENT' CHECK (comment_type IN ('COMMENT', 'STATUS_UPDATE', 'VERIFICATION', 'REJECTION')),
  attachment_urls TEXT,
  created_by UUID NOT NULL REFERENCES users(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_capa_comments_capa_id ON capa_comments(capa_id);
CREATE INDEX idx_capa_comments_created_by ON capa_comments(created_by);

-- =====================================================
-- RISK_ASSESSMENTS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS risk_assessments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  title_ar VARCHAR(255),
  description TEXT,
  process_area VARCHAR(255),
  probability INTEGER NOT NULL,
  severity INTEGER NOT NULL,
  risk_level VARCHAR(50) NOT NULL,
  mitigation TEXT,
  mitigation_ar TEXT,
  owner_id UUID REFERENCES users(id),
  review_date TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP,
  created_by UUID NOT NULL REFERENCES users(id)
);

CREATE INDEX idx_risk_assessments_organization_id ON risk_assessments(organization_id);
CREATE INDEX idx_risk_assessments_risk_level ON risk_assessments(risk_level);
CREATE INDEX idx_risk_assessments_owner_id ON risk_assessments(owner_id);

-- =====================================================
-- NOTIFICATIONS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  title_ar VARCHAR(255),
  message TEXT NOT NULL,
  message_ar TEXT,
  notification_type VARCHAR(50) NOT NULL,
  related_entity_type VARCHAR(50),
  related_entity_id UUID,
  is_read BOOLEAN DEFAULT false,
  read_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  expired_at TIMESTAMP
);

CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_user_id_is_read ON notifications(user_id, is_read);
CREATE INDEX idx_notifications_created_at ON notifications(created_at);

-- =====================================================
-- AUDIT_REPORTS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS audit_reports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  audit_id UUID NOT NULL REFERENCES audits(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  title_ar VARCHAR(255),
  executive_summary TEXT,
  executive_summary_ar TEXT,
  findings_summary TEXT,
  compliance_score DECIMAL(5,2),
  recommendations TEXT,
  recommendations_ar TEXT,
  report_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  generated_by UUID NOT NULL REFERENCES users(id),
  report_file_url VARCHAR(500),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_audit_reports_audit_id ON audit_reports(audit_id);
CREATE INDEX idx_audit_reports_generated_by ON audit_reports(generated_by);

-- =====================================================
-- VIEWS FOR REPORTING
-- =====================================================

-- View: Audit Summary
CREATE OR REPLACE VIEW audit_summary_view AS
SELECT 
  a.id,
  a.title,
  a.audit_type,
  a.status,
  a.compliance_score,
  COUNT(DISTINCT f.id) as findings_count,
  COUNT(DISTINCT c.id) as capa_count,
  a.scheduled_date,
  a.created_at
FROM audits a
LEFT JOIN findings f ON a.id = f.audit_id AND f.deleted_at IS NULL
LEFT JOIN capas c ON f.id = c.finding_id AND c.deleted_at IS NULL
WHERE a.deleted_at IS NULL
GROUP BY a.id, a.title, a.audit_type, a.status, a.compliance_score, a.scheduled_date, a.created_at;

-- View: CAPA Status Summary
CREATE OR REPLACE VIEW capa_status_view AS
SELECT 
  c.organization_id,
  c.status,
  COUNT(*) as count,
  AVG(EXTRACT(DAY FROM (c.due_date - CURRENT_DATE))) as avg_days_remaining
FROM capas c
WHERE c.deleted_at IS NULL
GROUP BY c.organization_id, c.status;

-- View: Risk Dashboard
CREATE OR REPLACE VIEW risk_dashboard_view AS
SELECT 
  r.organization_id,
  r.risk_level,
  COUNT(*) as count,
  AVG(r.probability * r.severity) as avg_risk_score
FROM risk_assessments r
WHERE r.deleted_at IS NULL
GROUP BY r.organization_id, r.risk_level;

-- =====================================================
-- INDEXES FOR PERFORMANCE
-- =====================================================

-- Composite indexes for common queries
CREATE INDEX idx_audits_org_status_created ON audits(organization_id, status, created_at DESC);
CREATE INDEX idx_findings_org_severity_created ON findings(organization_id, severity, created_at DESC);
CREATE INDEX idx_capas_org_status_due ON capas(organization_id, status, due_date);
CREATE INDEX idx_users_org_role_active ON users(organization_id, role, is_active);
CREATE INDEX idx_suppliers_org_risk_active ON suppliers(organization_id, risk_level, is_active);

-- =====================================================
-- SEED DATA
-- =====================================================

-- Insert default organization
INSERT INTO organizations (name, name_ar, email, phone, country, industry, subscription_plan, is_active)
VALUES (
  'Demo Organization',
  'منظمة تجريبية',
  'demo@auditmate.com',
  '+966501234567',
  'Saudi Arabia',
  'Manufacturing',
  'PROFESSIONAL',
  true
) ON CONFLICT DO NOTHING;

-- Get organization ID for subsequent inserts
DO $$
DECLARE
  org_id UUID;
  admin_id UUID;
BEGIN
  SELECT id INTO org_id FROM organizations WHERE email = 'demo@auditmate.com' LIMIT 1;
  
  IF org_id IS NOT NULL THEN
    -- Insert users
    INSERT INTO users (organization_id, email, password_hash, first_name, last_name, role, is_active, is_verified)
    VALUES 
      (org_id, 'admin@demo.com', '$2b$10$hashedpassword1', 'Admin', 'User', 'SUPER_ADMIN', true, true),
      (org_id, 'qa@demo.com', '$2b$10$hashedpassword2', 'QA', 'Manager', 'QA_MANAGER', true, true),
      (org_id, 'auditor@demo.com', '$2b$10$hashedpassword3', 'Lead', 'Auditor', 'LEAD_AUDITOR', true, true)
    ON CONFLICT DO NOTHING;
    
    SELECT id INTO admin_id FROM users WHERE email = 'admin@demo.com' AND organization_id = org_id LIMIT 1;
    
    -- Insert audit standards
    INSERT INTO audit_standards (organization_id, name, name_ar, description, version, sections_count, is_active)
    VALUES 
      (org_id, 'ISO 9001', 'ISO 9001', 'Quality Management System', '2015', 10, true),
      (org_id, 'ISO 14001', 'ISO 14001', 'Environmental Management System', '2015', 10, true),
      (org_id, 'ISO 45001', 'ISO 45001', 'Occupational Health and Safety', '2018', 10, true),
      (org_id, 'GMP', 'GMP', 'Good Manufacturing Practice', '2020', 12, true)
    ON CONFLICT DO NOTHING;
    
  END IF;
END $$;

-- =====================================================
-- END OF SCHEMA
-- =====================================================
