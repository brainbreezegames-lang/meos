'use client';

import React from 'react';
import type { CVContent, CVExperience, CVSkillCategory, CVEducation } from '@/lib/validations/goos';
import './cv-styles.css';

interface GoOSCVDocumentProps {
  content: CVContent;
  isEditing?: boolean;
  editingField?: string | null;
  onFieldClick?: (field: string) => void;
  onFieldChange?: (field: string, value: string | string[]) => void;
  onFieldBlur?: () => void;
  onAddExperience?: () => void;
  onAddSkillCategory?: () => void;
  onAddEducation?: () => void;
  onDeleteExperience?: (id: string) => void;
  onDeleteSkillCategory?: (id: string) => void;
  onDeleteEducation?: (id: string) => void;
}

// Editable text component for inline editing
function EditableText({
  value,
  field,
  isEditing,
  editingField,
  onFieldClick,
  onFieldChange,
  onFieldBlur,
  className,
  multiline = false,
  placeholder = 'Click to edit...',
}: {
  value: string;
  field: string;
  isEditing?: boolean;
  editingField?: string | null;
  onFieldClick?: (field: string) => void;
  onFieldChange?: (field: string, value: string) => void;
  onFieldBlur?: () => void;
  className?: string;
  multiline?: boolean;
  placeholder?: string;
}) {
  const isActive = editingField === field;

  if (isEditing && isActive) {
    const baseClass = `cv-editable-input ${className || ''}`;
    if (multiline) {
      return (
        <textarea
          autoFocus
          value={value}
          onChange={(e) => onFieldChange?.(field, e.target.value)}
          onBlur={onFieldBlur}
          onKeyDown={(e) => {
            if (e.key === 'Escape') onFieldBlur?.();
          }}
          className={`${baseClass} cv-editable-textarea`}
          placeholder={placeholder}
        />
      );
    }
    return (
      <input
        autoFocus
        type="text"
        value={value}
        onChange={(e) => onFieldChange?.(field, e.target.value)}
        onBlur={onFieldBlur}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === 'Escape') onFieldBlur?.();
        }}
        className={baseClass}
        placeholder={placeholder}
      />
    );
  }

  return (
    <span
      onClick={() => isEditing && onFieldClick?.(field)}
      className={`cv-editable-text ${isEditing ? 'cv-editable-hover' : ''} ${className || ''}`}
    >
      {value || <span className="cv-placeholder">{placeholder}</span>}
    </span>
  );
}

// Experience item component
function ExperienceItem({
  experience,
  index,
  isEditing,
  editingField,
  onFieldClick,
  onFieldChange,
  onFieldBlur,
  onDelete,
}: {
  experience: CVExperience;
  index: number;
  isEditing?: boolean;
  editingField?: string | null;
  onFieldClick?: (field: string) => void;
  onFieldChange?: (field: string, value: string) => void;
  onFieldBlur?: () => void;
  onDelete?: () => void;
}) {
  const prefix = `experience.${index}`;

  return (
    <div className="cv-experience-item">
      {isEditing && onDelete && (
        <button onClick={onDelete} className="cv-delete-btn" title="Delete">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M18 6L6 18M6 6l12 12" />
          </svg>
        </button>
      )}

      {/* Role Title - UPPERCASE, SEMIBOLD */}
      <h4 className="cv-role-title">
        <EditableText
          value={experience.role}
          field={`${prefix}.role`}
          isEditing={isEditing}
          editingField={editingField}
          onFieldClick={onFieldClick}
          onFieldChange={onFieldChange}
          onFieldBlur={onFieldBlur}
          placeholder="Role Title"
        />
      </h4>

      {/* Company + Location + Dates */}
      <p className="cv-company-line">
        <EditableText
          value={experience.company}
          field={`${prefix}.company`}
          isEditing={isEditing}
          editingField={editingField}
          onFieldClick={onFieldClick}
          onFieldChange={onFieldChange}
          onFieldBlur={onFieldBlur}
          placeholder="Company Name"
          className="cv-company-name"
        />
        {(experience.location || isEditing) && (
          <>
            {' ('}
            <EditableText
              value={experience.location || ''}
              field={`${prefix}.location`}
              isEditing={isEditing}
              editingField={editingField}
              onFieldClick={onFieldClick}
              onFieldChange={onFieldChange}
              onFieldBlur={onFieldBlur}
              placeholder="Location"
            />
            {')'}
          </>
        )}
        <span className="cv-date-separator"> &bull; </span>
        <EditableText
          value={experience.startDate}
          field={`${prefix}.startDate`}
          isEditing={isEditing}
          editingField={editingField}
          onFieldClick={onFieldClick}
          onFieldChange={onFieldChange}
          onFieldBlur={onFieldBlur}
          placeholder="Start Date"
        />
        <span> &mdash; </span>
        <EditableText
          value={experience.endDate || 'Present'}
          field={`${prefix}.endDate`}
          isEditing={isEditing}
          editingField={editingField}
          onFieldClick={onFieldClick}
          onFieldChange={onFieldChange}
          onFieldBlur={onFieldBlur}
          placeholder="End Date"
        />
      </p>

      {/* Company Description (italic) */}
      {(experience.description || isEditing) && (
        <p className="cv-company-description">
          <EditableText
            value={experience.description || ''}
            field={`${prefix}.description`}
            isEditing={isEditing}
            editingField={editingField}
            onFieldClick={onFieldClick}
            onFieldChange={onFieldChange}
            onFieldBlur={onFieldBlur}
            placeholder="Brief company description"
          />
        </p>
      )}

      {/* Responsibilities */}
      <div className="cv-responsibilities">
        <EditableText
          value={experience.responsibilities || ''}
          field={`${prefix}.responsibilities`}
          isEditing={isEditing}
          editingField={editingField}
          onFieldClick={onFieldClick}
          onFieldChange={onFieldChange}
          onFieldBlur={onFieldBlur}
          multiline
          placeholder="Responsibilities and achievements..."
        />
      </div>
    </div>
  );
}

// Skill category component
function SkillCategoryItem({
  skill,
  index,
  isEditing,
  editingField,
  onFieldClick,
  onFieldChange,
  onFieldBlur,
  onDelete,
}: {
  skill: CVSkillCategory;
  index: number;
  isEditing?: boolean;
  editingField?: string | null;
  onFieldClick?: (field: string) => void;
  onFieldChange?: (field: string, value: string | string[]) => void;
  onFieldBlur?: () => void;
  onDelete?: () => void;
}) {
  const prefix = `skills.${index}`;

  return (
    <div className="cv-skill-category">
      {isEditing && onDelete && (
        <button onClick={onDelete} className="cv-delete-btn cv-delete-btn-small" title="Delete">
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M18 6L6 18M6 6l12 12" />
          </svg>
        </button>
      )}

      {/* Category Name */}
      <h5 className="cv-skill-category-name">
        <EditableText
          value={skill.category}
          field={`${prefix}.category`}
          isEditing={isEditing}
          editingField={editingField}
          onFieldClick={onFieldClick}
          onFieldChange={onFieldChange as (field: string, value: string) => void}
          onFieldBlur={onFieldBlur}
          placeholder="Category Name"
        />
      </h5>

      {/* Items */}
      <p className="cv-skill-items">
        <EditableText
          value={skill.items.join(', ')}
          field={`${prefix}.items`}
          isEditing={isEditing}
          editingField={editingField}
          onFieldClick={onFieldClick}
          onFieldChange={(field, value) => {
            onFieldChange?.(field, (value as string).split(',').map(s => s.trim()));
          }}
          onFieldBlur={onFieldBlur}
          placeholder="Skill 1, Skill 2, Skill 3"
        />
      </p>
    </div>
  );
}

// Education item component
function EducationItem({
  education,
  index,
  isEditing,
  editingField,
  onFieldClick,
  onFieldChange,
  onFieldBlur,
  onDelete,
}: {
  education: CVEducation;
  index: number;
  isEditing?: boolean;
  editingField?: string | null;
  onFieldClick?: (field: string) => void;
  onFieldChange?: (field: string, value: string) => void;
  onFieldBlur?: () => void;
  onDelete?: () => void;
}) {
  const prefix = `education.${index}`;

  return (
    <div className="cv-education-item">
      {isEditing && onDelete && (
        <button onClick={onDelete} className="cv-delete-btn cv-delete-btn-small" title="Delete">
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M18 6L6 18M6 6l12 12" />
          </svg>
        </button>
      )}

      <p className="cv-education-degree">
        <EditableText
          value={education.degree}
          field={`${prefix}.degree`}
          isEditing={isEditing}
          editingField={editingField}
          onFieldClick={onFieldClick}
          onFieldChange={onFieldChange}
          onFieldBlur={onFieldBlur}
          placeholder="Degree Name"
        />
      </p>
      <p className="cv-education-dates">
        <EditableText
          value={education.dates}
          field={`${prefix}.dates`}
          isEditing={isEditing}
          editingField={editingField}
          onFieldClick={onFieldClick}
          onFieldChange={onFieldChange}
          onFieldBlur={onFieldBlur}
          placeholder="Year - Year"
        />
      </p>
      <p className="cv-education-institution">
        <EditableText
          value={education.institution}
          field={`${prefix}.institution`}
          isEditing={isEditing}
          editingField={editingField}
          onFieldClick={onFieldClick}
          onFieldChange={onFieldChange}
          onFieldBlur={onFieldBlur}
          placeholder="Institution Name"
        />
      </p>
    </div>
  );
}

// Add button component
function AddButton({ onClick, label }: { onClick?: () => void; label: string }) {
  return (
    <button onClick={onClick} className="cv-add-btn">
      <span className="cv-add-btn-icon">+</span> {label}
    </button>
  );
}

export function GoOSCVDocument({
  content,
  isEditing = false,
  editingField,
  onFieldClick,
  onFieldChange,
  onFieldBlur,
  onAddExperience,
  onAddSkillCategory,
  onAddEducation,
  onDeleteExperience,
  onDeleteSkillCategory,
  onDeleteEducation,
}: GoOSCVDocumentProps) {
  return (
    <div className="cv-document">
      {/* Header - Name and Title */}
      <header className="cv-header">
        <h1 className="cv-name">
          <EditableText
            value={content.name}
            field="name"
            isEditing={isEditing}
            editingField={editingField}
            onFieldClick={onFieldClick}
            onFieldChange={onFieldChange as (field: string, value: string) => void}
            onFieldBlur={onFieldBlur}
            placeholder="Your Name"
          />
          <span className="cv-name-separator"> &mdash; </span>
          <EditableText
            value={content.title}
            field="title"
            isEditing={isEditing}
            editingField={editingField}
            onFieldClick={onFieldClick}
            onFieldChange={onFieldChange as (field: string, value: string) => void}
            onFieldBlur={onFieldBlur}
            placeholder="Your Title"
          />
        </h1>
      </header>

      {/* Two Column Layout */}
      <div className="cv-columns">
        {/* Left Column - Skills, Education, Contact */}
        <aside className="cv-sidebar">
          {/* Skills Section */}
          <section className="cv-section">
            <h2 className="cv-section-title">Skills</h2>
            {content.skills.map((skill, index) => (
              <SkillCategoryItem
                key={skill.id}
                skill={skill}
                index={index}
                isEditing={isEditing}
                editingField={editingField}
                onFieldClick={onFieldClick}
                onFieldChange={onFieldChange}
                onFieldBlur={onFieldBlur}
                onDelete={isEditing ? () => onDeleteSkillCategory?.(skill.id) : undefined}
              />
            ))}
            {isEditing && <AddButton onClick={onAddSkillCategory} label="Add Skill Category" />}
          </section>

          {/* Education Section */}
          <section className="cv-section">
            <h2 className="cv-section-title">Education</h2>
            {content.education.map((edu, index) => (
              <EducationItem
                key={edu.id}
                education={edu}
                index={index}
                isEditing={isEditing}
                editingField={editingField}
                onFieldClick={onFieldClick}
                onFieldChange={onFieldChange as (field: string, value: string) => void}
                onFieldBlur={onFieldBlur}
                onDelete={isEditing ? () => onDeleteEducation?.(edu.id) : undefined}
              />
            ))}
            {isEditing && <AddButton onClick={onAddEducation} label="Add Education" />}
          </section>

          {/* Contact Section */}
          <section className="cv-section">
            <h2 className="cv-section-title">Contact</h2>
            <div className="cv-contact">
              {(content.contact.location || isEditing) && (
                <p className="cv-contact-item">
                  <EditableText
                    value={content.contact.location || ''}
                    field="contact.location"
                    isEditing={isEditing}
                    editingField={editingField}
                    onFieldClick={onFieldClick}
                    onFieldChange={onFieldChange as (field: string, value: string) => void}
                    onFieldBlur={onFieldBlur}
                    placeholder="Location"
                  />
                </p>
              )}
              {(content.contact.phone || isEditing) && (
                <p className="cv-contact-item">
                  <EditableText
                    value={content.contact.phone || ''}
                    field="contact.phone"
                    isEditing={isEditing}
                    editingField={editingField}
                    onFieldClick={onFieldClick}
                    onFieldChange={onFieldChange as (field: string, value: string) => void}
                    onFieldBlur={onFieldBlur}
                    placeholder="Phone"
                  />
                </p>
              )}
              {(content.contact.email || isEditing) && (
                <p className="cv-contact-item">
                  {isEditing ? (
                    <EditableText
                      value={content.contact.email || ''}
                      field="contact.email"
                      isEditing={isEditing}
                      editingField={editingField}
                      onFieldClick={onFieldClick}
                      onFieldChange={onFieldChange as (field: string, value: string) => void}
                      onFieldBlur={onFieldBlur}
                      placeholder="Email"
                    />
                  ) : (
                    <a href={`mailto:${content.contact.email}`} className="cv-link">
                      {content.contact.email}
                    </a>
                  )}
                </p>
              )}
              {(content.contact.linkedin || isEditing) && (
                <p className="cv-contact-item">
                  {isEditing ? (
                    <EditableText
                      value={content.contact.linkedin || ''}
                      field="contact.linkedin"
                      isEditing={isEditing}
                      editingField={editingField}
                      onFieldClick={onFieldClick}
                      onFieldChange={onFieldChange as (field: string, value: string) => void}
                      onFieldBlur={onFieldBlur}
                      placeholder="LinkedIn URL"
                    />
                  ) : (
                    <a href={content.contact.linkedin} target="_blank" rel="noopener noreferrer" className="cv-link">
                      {content.contact.linkedin?.replace('https://', '').replace('www.', '')}
                    </a>
                  )}
                </p>
              )}
              {(content.contact.website || isEditing) && (
                <p className="cv-contact-item">
                  {isEditing ? (
                    <EditableText
                      value={content.contact.website || ''}
                      field="contact.website"
                      isEditing={isEditing}
                      editingField={editingField}
                      onFieldClick={onFieldClick}
                      onFieldChange={onFieldChange as (field: string, value: string) => void}
                      onFieldBlur={onFieldBlur}
                      placeholder="Website URL"
                    />
                  ) : (
                    <a href={content.contact.website} target="_blank" rel="noopener noreferrer" className="cv-link">
                      {content.contact.website?.replace('https://', '').replace('www.', '')}
                    </a>
                  )}
                </p>
              )}
              {(content.contact.tagline || isEditing) && (
                <p className="cv-contact-tagline">
                  <EditableText
                    value={content.contact.tagline || ''}
                    field="contact.tagline"
                    isEditing={isEditing}
                    editingField={editingField}
                    onFieldClick={onFieldClick}
                    onFieldChange={onFieldChange as (field: string, value: string) => void}
                    onFieldBlur={onFieldBlur}
                    placeholder="Tagline or motto"
                  />
                </p>
              )}
            </div>
          </section>
        </aside>

        {/* Right Column - About, Experience */}
        <main className="cv-main">
          {/* About Section */}
          <section className="cv-section">
            <h2 className="cv-section-title">About me</h2>
            <div className="cv-about">
              <EditableText
                value={content.about}
                field="about"
                isEditing={isEditing}
                editingField={editingField}
                onFieldClick={onFieldClick}
                onFieldChange={onFieldChange as (field: string, value: string) => void}
                onFieldBlur={onFieldBlur}
                multiline
                placeholder="Write a brief introduction about yourself..."
              />
            </div>
          </section>

          {/* Experience Section */}
          <section className="cv-section">
            <h2 className="cv-section-title">Experience</h2>
            {content.experience.map((exp, index) => (
              <ExperienceItem
                key={exp.id}
                experience={exp}
                index={index}
                isEditing={isEditing}
                editingField={editingField}
                onFieldClick={onFieldClick}
                onFieldChange={onFieldChange as (field: string, value: string) => void}
                onFieldBlur={onFieldBlur}
                onDelete={isEditing ? () => onDeleteExperience?.(exp.id) : undefined}
              />
            ))}
            {isEditing && <AddButton onClick={onAddExperience} label="Add Role" />}
          </section>
        </main>
      </div>
    </div>
  );
}

export default GoOSCVDocument;
