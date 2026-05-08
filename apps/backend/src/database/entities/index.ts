/**
 * TypeORM Entities Configuration
 * Entity definitions for NestJS with TypeORM
 */

import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
  Index,
  Unique,
  ManyToMany,
  JoinTable,
} from 'typeorm';
import { IsEmail, IsNotEmpty, MinLength } from 'class-validator';

// =====================================================
// ORGANIZATION ENTITY
// =====================================================
@Entity('organizations')
@Index(['email'])
export class Organization {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  nameAr: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'varchar', length: 500, nullable: true })
  logo: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  website: string;

  @Column({ type: 'varchar', length: 255, unique: true })
  @IsEmail()
  email: string;

  @Column({ type: 'varchar', length: 20, nullable: true })
  phone: string;

  @Column({ type: 'text', nullable: true })
  address: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  city: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  country: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  industry: string;

  @Column({ type: 'varchar', length: 50, default: 'STARTER' })
  subscriptionPlan: 'STARTER' | 'PROFESSIONAL' | 'ENTERPRISE' | 'CUSTOM';

  @Column({ type: 'integer', default: 5 })
  maxUsers: number;

  @Column({ type: 'integer', default: 50 })
  maxAuditsPerMonth: number;

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt: Date;

  // Relations
  @OneToMany(() => User, (user) => user.organization)
  users: User[];

  @OneToMany(() => Audit, (audit) => audit.organization)
  audits: Audit[];

  @OneToMany(() => Supplier, (supplier) => supplier.organization)
  suppliers: Supplier[];

  @OneToMany(() => Checklist, (checklist) => checklist.organization)
  checklists: Checklist[];

  @OneToMany(() => Finding, (finding) => finding.organization)
  findings: Finding[];

  @OneToMany(() => CAPA, (capa) => capa.organization)
  capas: CAPA[];
}

// =====================================================
// USER ENTITY
// =====================================================
@Entity('users')
@Index(['organizationId', 'email'], { unique: true })
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  organizationId: string;

  @Column({ type: 'varchar', length: 255 })
  @IsEmail()
  email: string;

  @Column({ type: 'varchar', length: 255, select: false })
  @MinLength(8)
  passwordHash: string;

  @Column({ type: 'varchar', length: 100 })
  @IsNotEmpty()
  firstName: string;

  @Column({ type: 'varchar', length: 100 })
  @IsNotEmpty()
  lastName: string;

  @Column({
    type: 'varchar',
    length: 50,
    default: 'AUDITOR',
    enum: ['SUPER_ADMIN', 'QA_MANAGER', 'LEAD_AUDITOR', 'AUDITOR', 'SUPPLIER', 'VIEWER', 'CLIENT'],
  })
  role: string;

  @Column({ type: 'varchar', length: 20, nullable: true })
  phone: string;

  @Column({ type: 'varchar', length: 500, nullable: true })
  avatar: string;

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @Column({ type: 'boolean', default: false })
  isVerified: boolean;

  @Column({ type: 'boolean', default: false })
  isTwoFAEnabled: boolean;

  @Column({ type: 'timestamp', nullable: true })
  lastLogin: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt: Date;

  // Relations
  @ManyToOne(() => Organization, (org) => org.users)
  @JoinColumn({ name: 'organization_id' })
  organization: Organization;

  @OneToMany(() => Audit, (audit) => audit.leadAuditor)
  auditsAsLeadAuditor: Audit[];

  @OneToMany(() => Finding, (finding) => finding.createdBy)
  findings: Finding[];

  @OneToMany(() => CAPA, (capa) => capa.owner)
  capasAsOwner: CAPA[];
}

// =====================================================
// SUPPLIER ENTITY
// =====================================================
@Entity('suppliers')
@Index(['organizationId', 'riskLevel'])
export class Supplier {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  organizationId: string;

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  nameAr: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  @IsEmail()
  email: string;

  @Column({ type: 'varchar', length: 20, nullable: true })
  phone: string;

  @Column({ type: 'text', nullable: true })
  address: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  city: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  country: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  category: string;

  @Column({
    type: 'varchar',
    length: 50,
    default: 'MEDIUM',
    enum: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'],
  })
  riskLevel: string;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  complianceScore: number;

  @Column({ type: 'timestamp', nullable: true })
  lastAuditDate: Date;

  @Column({ type: 'timestamp', nullable: true })
  nextAuditDate: Date;

  @Column({ type: 'integer', nullable: true })
  auditFrequencyDays: number;

  @Column({ type: 'varchar', length: 255, nullable: true })
  contactPerson: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  contactEmail: string;

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt: Date;

  // Relations
  @ManyToOne(() => Organization)
  @JoinColumn({ name: 'organization_id' })
  organization: Organization;

  @OneToMany(() => Audit, (audit) => audit.supplier)
  audits: Audit[];
}

// =====================================================
// AUDIT STANDARD ENTITY
// =====================================================
@Entity('audit_standards')
@Index(['organizationId', 'name'], { unique: true })
export class AuditStandard {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  organizationId: string;

  @Column({ type: 'varchar', length: 100 })
  name: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  nameAr: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'varchar', length: 20, nullable: true })
  version: string;

  @Column({ type: 'integer', nullable: true })
  sectionsCount: number;

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  // Relations
  @OneToMany(() => Checklist, (checklist) => checklist.auditStandard)
  checklists: Checklist[];

  @OneToMany(() => Audit, (audit) => audit.auditStandard)
  audits: Audit[];
}

// =====================================================
// AUDIT ENTITY
// =====================================================
@Entity('audits')
@Index(['organizationId', 'status'])
@Index(['leadAuditorId'])
export class Audit {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  organizationId: string;

  @Column({ type: 'varchar', length: 255 })
  title: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  titleAr: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({
    type: 'varchar',
    length: 50,
    enum: ['INTERNAL', 'EXTERNAL', 'SUPPLIER', 'PROCESS', 'PRODUCT', 'COMPLIANCE'],
  })
  auditType: string;

  @Column({
    type: 'varchar',
    length: 50,
    default: 'DRAFT',
    enum: ['DRAFT', 'PLANNED', 'ASSIGNED', 'IN_PROGRESS', 'REVIEW', 'APPROVED', 'CLOSED', 'CANCELLED'],
  })
  status: string;

  @Column({ type: 'uuid', nullable: true })
  auditStandardId: string;

  @Column({ type: 'uuid', nullable: true })
  auditeeId: string;

  @Column({ type: 'uuid' })
  leadAuditorId: string;

  @Column({ type: 'uuid', nullable: true })
  supplierId: string;

  @Column({ type: 'date' })
  scheduledDate: Date;

  @Column({ type: 'timestamp', nullable: true })
  startDate: Date;

  @Column({ type: 'timestamp', nullable: true })
  endDate: Date;

  @Column({ type: 'varchar', length: 255, nullable: true })
  location: string;

  @Column({ type: 'text', nullable: true })
  scope: string;

  @Column({ type: 'text', nullable: true })
  scopeAr: string;

  @Column({ type: 'integer', default: 0 })
  findingsCount: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  complianceScore: number;

  @Column({ type: 'varchar', length: 50, nullable: true })
  riskLevel: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt: Date;

  @Column({ type: 'uuid' })
  createdBy: string;

  @Column({ type: 'uuid', nullable: true })
  updatedBy: string;

  @Column({ type: 'uuid', nullable: true })
  approvedBy: string;

  @Column({ type: 'timestamp', nullable: true })
  approvedAt: Date;

  // Relations
  @ManyToOne(() => Organization)
  @JoinColumn({ name: 'organization_id' })
  organization: Organization;

  @ManyToOne(() => AuditStandard)
  @JoinColumn({ name: 'audit_standard_id' })
  auditStandard: AuditStandard;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'lead_auditor_id' })
  leadAuditor: User;

  @ManyToOne(() => Supplier)
  @JoinColumn({ name: 'supplier_id' })
  supplier: Supplier;

  @OneToMany(() => AuditTeamMember, (member) => member.audit)
  teamMembers: AuditTeamMember[];

  @OneToMany(() => Finding, (finding) => finding.audit)
  findings: Finding[];

  @OneToMany(() => AuditResponse, (response) => response.audit)
  responses: AuditResponse[];

  @OneToMany(() => AuditReport, (report) => report.audit)
  reports: AuditReport[];
}

// =====================================================
// AUDIT TEAM MEMBER ENTITY
// =====================================================
@Entity('audit_team_members')
@Unique(['auditId', 'userId'])
export class AuditTeamMember {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  auditId: string;

  @Column({ type: 'uuid' })
  userId: string;

  @Column({
    type: 'varchar',
    length: 50,
    default: 'MEMBER',
    enum: ['LEAD', 'MEMBER', 'OBSERVER'],
  })
  role: string;

  @CreateDateColumn()
  createdAt: Date;

  // Relations
  @ManyToOne(() => Audit)
  @JoinColumn({ name: 'audit_id' })
  audit: Audit;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;
}

// =====================================================
// CHECKLIST ENTITY
// =====================================================
@Entity('checklists')
@Index(['organizationId', 'isTemplate'])
export class Checklist {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  organizationId: string;

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  nameAr: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'uuid', nullable: true })
  auditStandardId: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  auditType: string;

  @Column({ type: 'boolean', default: false })
  isTemplate: boolean;

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @Column({ type: 'integer', default: 1 })
  version: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt: Date;

  @Column({ type: 'uuid' })
  createdBy: string;

  // Relations
  @ManyToOne(() => Organization)
  @JoinColumn({ name: 'organization_id' })
  organization: Organization;

  @ManyToOne(() => AuditStandard, { nullable: true })
  @JoinColumn({ name: 'audit_standard_id' })
  auditStandard: AuditStandard;

  @OneToMany(() => ChecklistQuestion, (question) => question.checklist, { cascade: true })
  questions: ChecklistQuestion[];
}

// =====================================================
// CHECKLIST QUESTION ENTITY
// =====================================================
@Entity('checklist_questions')
export class ChecklistQuestion {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  checklistId: string;

  @Column({ type: 'integer' })
  questionNumber: number;

  @Column({ type: 'text' })
  question: string;

  @Column({ type: 'text', nullable: true })
  questionAr: string;

  @Column({
    type: 'varchar',
    length: 50,
    enum: ['YES_NO', 'PASS_FAIL', 'TEXT', 'NUMERIC', 'SELECT', 'MULTI_SELECT', 'FILE', 'DATE'],
  })
  responseType: string;

  @Column({ type: 'text', nullable: true })
  options: string; // JSON string

  @Column({ type: 'boolean', default: true })
  isMandatory: boolean;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  weight: number;

  @Column({ type: 'varchar', length: 100, nullable: true })
  category: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  categoryAr: string;

  @Column({ type: 'text', nullable: true })
  helpText: string;

  @Column({ type: 'text', nullable: true })
  helpTextAr: string;

  @Column({ type: 'text', nullable: true })
  conditionalLogic: string; // JSON string

  @CreateDateColumn()
  createdAt: Date;

  // Relations
  @ManyToOne(() => Checklist, (checklist) => checklist.questions)
  @JoinColumn({ name: 'checklist_id' })
  checklist: Checklist;

  @OneToMany(() => AuditResponse, (response) => response.question)
  responses: AuditResponse[];
}

// =====================================================
// AUDIT RESPONSE ENTITY
// =====================================================
@Entity('audit_responses')
@Unique(['auditId', 'checklistQuestionId'])
export class AuditResponse {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  auditId: string;

  @Column({ type: 'uuid' })
  checklistQuestionId: string;

  @Column({ type: 'text', nullable: true })
  responseValue: string;

  @Column({ type: 'text', nullable: true })
  responseComments: string;

  @Column({ type: 'text', nullable: true })
  responseCommentsAr: string;

  @Column({ type: 'text', nullable: true })
  evidenceUrls: string; // JSON array

  @Column({ type: 'uuid' })
  respondentId: string;

  @Column({ type: 'boolean', nullable: true })
  isCompliant: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Relations
  @ManyToOne(() => Audit)
  @JoinColumn({ name: 'audit_id' })
  audit: Audit;

  @ManyToOne(() => ChecklistQuestion)
  @JoinColumn({ name: 'checklist_question_id' })
  question: ChecklistQuestion;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'respondent_id' })
  respondent: User;
}

// =====================================================
// FINDING ENTITY
// =====================================================
@Entity('findings')
@Index(['organizationId', 'auditId'])
export class Finding {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  organizationId: string;

  @Column({ type: 'uuid' })
  auditId: string;

  @Column({ type: 'uuid', nullable: true })
  auditResponseId: string;

  @Column({ type: 'varchar', length: 255 })
  title: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  titleAr: string;

  @Column({ type: 'text' })
  description: string;

  @Column({ type: 'text', nullable: true })
  descriptionAr: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  category: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  categoryAr: string;

  @Column({
    type: 'varchar',
    length: 50,
    default: 'MEDIUM',
    enum: ['CRITICAL', 'MAJOR', 'MINOR', 'OBSERVATION'],
  })
  severity: string;

  @Column({ type: 'text', nullable: true })
  evidenceUrls: string; // JSON array

  @Column({ type: 'varchar', length: 50, nullable: true })
  findingNumber: string;

  @Column({ type: 'boolean', default: false })
  isRecurring: boolean;

  @Column({ type: 'uuid', nullable: true })
  previousFindingId: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt: Date;

  @Column({ type: 'uuid' })
  createdBy: string;

  // Relations
  @ManyToOne(() => Organization)
  @JoinColumn({ name: 'organization_id' })
  organization: Organization;

  @ManyToOne(() => Audit)
  @JoinColumn({ name: 'audit_id' })
  audit: Audit;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'created_by' })
  createdByUser: User;

  @OneToMany(() => CAPA, (capa) => capa.finding)
  capas: CAPA[];
}

// =====================================================
// CAPA ENTITY
// =====================================================
@Entity('capas')
@Index(['organizationId', 'status'])
export class CAPA {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  organizationId: string;

  @Column({ type: 'uuid' })
  findingId: string;

  @Column({
    type: 'varchar',
    length: 50,
    enum: ['CORRECTIVE', 'PREVENTIVE'],
  })
  type: string;

  @Column({
    type: 'varchar',
    length: 50,
    default: 'OPEN',
    enum: ['OPEN', 'IN_PROGRESS', 'VERIFICATION', 'ON_HOLD', 'OVERDUE', 'CLOSED'],
  })
  status: string;

  @Column({ type: 'varchar', length: 255 })
  title: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  titleAr: string;

  @Column({ type: 'text' })
  rootCause: string;

  @Column({ type: 'text', nullable: true })
  rootCauseAr: string;

  @Column({ type: 'text' })
  action: string;

  @Column({ type: 'text', nullable: true })
  actionAr: string;

  @Column({ type: 'uuid' })
  ownerId: string;

  @Column({ type: 'date' })
  dueDate: Date;

  @Column({ type: 'timestamp', nullable: true })
  verificationDate: Date;

  @Column({ type: 'timestamp', nullable: true })
  closureDate: Date;

  @Column({ type: 'text', nullable: true })
  evidenceUrls: string; // JSON array

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  riskScoreAfter: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt: Date;

  @Column({ type: 'uuid' })
  createdBy: string;

  @Column({ type: 'uuid', nullable: true })
  approvedBy: string;

  @Column({ type: 'timestamp', nullable: true })
  approvedAt: Date;

  // Relations
  @ManyToOne(() => Organization)
  @JoinColumn({ name: 'organization_id' })
  organization: Organization;

  @ManyToOne(() => Finding, (finding) => finding.capas)
  @JoinColumn({ name: 'finding_id' })
  finding: Finding;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'owner_id' })
  owner: User;

  @OneToMany(() => CAPAComment, (comment) => comment.capa, { cascade: true })
  comments: CAPAComment[];
}

// =====================================================
// CAPA COMMENT ENTITY
// =====================================================
@Entity('capa_comments')
export class CAPAComment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  capaId: string;

  @Column({ type: 'text' })
  comment: string;

  @Column({ type: 'text', nullable: true })
  commentAr: string;

  @Column({
    type: 'varchar',
    length: 50,
    default: 'COMMENT',
    enum: ['COMMENT', 'STATUS_UPDATE', 'VERIFICATION', 'REJECTION'],
  })
  commentType: string;

  @Column({ type: 'text', nullable: true })
  attachmentUrls: string; // JSON array

  @Column({ type: 'uuid' })
  createdBy: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Relations
  @ManyToOne(() => CAPA, (capa) => capa.comments)
  @JoinColumn({ name: 'capa_id' })
  capa: CAPA;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'created_by' })
  createdByUser: User;
}

// =====================================================
// RISK ASSESSMENT ENTITY
// =====================================================
@Entity('risk_assessments')
@Index(['organizationId', 'riskLevel'])
export class RiskAssessment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  organizationId: string;

  @Column({ type: 'varchar', length: 255 })
  title: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  titleAr: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  processArea: string;

  @Column({ type: 'integer' })
  probability: number;

  @Column({ type: 'integer' })
  severity: number;

  @Column({ type: 'varchar', length: 50 })
  riskLevel: string;

  @Column({ type: 'text', nullable: true })
  mitigation: string;

  @Column({ type: 'text', nullable: true })
  mitigationAr: string;

  @Column({ type: 'uuid', nullable: true })
  ownerId: string;

  @Column({ type: 'timestamp', nullable: true })
  reviewDate: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt: Date;

  @Column({ type: 'uuid' })
  createdBy: string;

  // Relations
  @ManyToOne(() => Organization)
  @JoinColumn({ name: 'organization_id' })
  organization: Organization;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'owner_id' })
  owner: User;
}

// =====================================================
// NOTIFICATION ENTITY
// =====================================================
@Entity('notifications')
@Index(['userId', 'isRead'])
export class Notification {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  organizationId: string;

  @Column({ type: 'uuid' })
  userId: string;

  @Column({ type: 'varchar', length: 255 })
  title: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  titleAr: string;

  @Column({ type: 'text' })
  message: string;

  @Column({ type: 'text', nullable: true })
  messageAr: string;

  @Column({ type: 'varchar', length: 50 })
  notificationType: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  relatedEntityType: string;

  @Column({ type: 'uuid', nullable: true })
  relatedEntityId: string;

  @Column({ type: 'boolean', default: false })
  isRead: boolean;

  @Column({ type: 'timestamp', nullable: true })
  readAt: Date;

  @CreateDateColumn()
  createdAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  expiredAt: Date;

  // Relations
  @ManyToOne(() => Organization)
  @JoinColumn({ name: 'organization_id' })
  organization: Organization;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;
}

// =====================================================
// AUDIT REPORT ENTITY
// =====================================================
@Entity('audit_reports')
export class AuditReport {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  auditId: string;

  @Column({ type: 'varchar', length: 255 })
  title: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  titleAr: string;

  @Column({ type: 'text', nullable: true })
  executiveSummary: string;

  @Column({ type: 'text', nullable: true })
  executiveSummaryAr: string;

  @Column({ type: 'text', nullable: true })
  findingsSummary: string;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  complianceScore: number;

  @Column({ type: 'text', nullable: true })
  recommendations: string;

  @Column({ type: 'text', nullable: true })
  recommendationsAr: string;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  reportDate: Date;

  @Column({ type: 'uuid' })
  generatedBy: string;

  @Column({ type: 'varchar', length: 500, nullable: true })
  reportFileUrl: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Relations
  @ManyToOne(() => Audit)
  @JoinColumn({ name: 'audit_id' })
  audit: Audit;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'generated_by' })
  generatedByUser: User;
}

export default {
  Organization,
  User,
  Supplier,
  AuditStandard,
  Audit,
  AuditTeamMember,
  Checklist,
  ChecklistQuestion,
  AuditResponse,
  Finding,
  CAPA,
  CAPAComment,
  RiskAssessment,
  Notification,
  AuditReport,
};
