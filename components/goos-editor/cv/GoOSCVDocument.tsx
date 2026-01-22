'use client';

import React from 'react';
import type { CVContent, CVExperience, CVSkillCategory, CVEducation } from '@/lib/validations/goos';

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
  style,
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
  style?: React.CSSProperties;
  multiline?: boolean;
  placeholder?: string;
}) {
  const isActive = editingField === field;

  if (isEditing && isActive) {
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
          className={className}
          style={{
            ...style,
            background: 'rgba(59, 130, 246, 0.1)',
            outline: '2px solid rgba(59, 130, 246, 0.5)',
            outlineOffset: 2,
            borderRadius: 2,
            resize: 'none',
            minHeight: 60,
            width: '100%',
            border: 'none',
            padding: 4,
          }}
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
        className={className}
        style={{
          ...style,
          background: 'rgba(59, 130, 246, 0.1)',
          outline: '2px solid rgba(59, 130, 246, 0.5)',
          outlineOffset: 2,
          borderRadius: 2,
          border: 'none',
          padding: '2px 4px',
          width: '100%',
        }}
        placeholder={placeholder}
      />
    );
  }

  return (
    <span
      onClick={() => isEditing && onFieldClick?.(field)}
      className={className}
      style={{
        ...style,
        cursor: isEditing ? 'text' : 'default',
        borderRadius: 2,
        transition: 'background 0.15s',
        ...(isEditing && {
          ':hover': { background: 'rgba(59, 130, 246, 0.05)' },
        }),
      }}
      onMouseEnter={(e) => {
        if (isEditing) {
          (e.target as HTMLElement).style.background = 'rgba(59, 130, 246, 0.05)';
        }
      }}
      onMouseLeave={(e) => {
        if (isEditing) {
          (e.target as HTMLElement).style.background = 'transparent';
        }
      }}
    >
      {value || <span style={{ opacity: 0.4 }}>{placeholder}</span>}
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
    <div className="cv-experience-item" style={{ marginBottom: 20, position: 'relative' }}>
      {isEditing && onDelete && (
        <button
          onClick={onDelete}
          style={{
            position: 'absolute',
            right: -24,
            top: 0,
            width: 20,
            height: 20,
            borderRadius: '50%',
            border: 'none',
            background: '#ef4444',
            color: 'white',
            fontSize: 12,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            opacity: 0.7,
          }}
          title="Delete"
        >
          x
        </button>
      )}

      {/* Role Title */}
      <div style={{
        fontFamily: "'Instrument Sans', sans-serif",
        fontSize: 11,
        fontWeight: 600,
        textTransform: 'uppercase',
        letterSpacing: '0.05em',
        color: '#1a1a1a',
        marginBottom: 4,
      }}>
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
      </div>

      {/* Company + Location + Dates */}
      <div style={{
        fontFamily: "'Instrument Sans', sans-serif",
        fontSize: 11,
        color: '#1a1a1a',
        marginBottom: 4,
      }}>
        <EditableText
          value={experience.company}
          field={`${prefix}.company`}
          isEditing={isEditing}
          editingField={editingField}
          onFieldClick={onFieldClick}
          onFieldChange={onFieldChange}
          onFieldBlur={onFieldBlur}
          placeholder="Company Name"
        />
        {experience.location && (
          <>
            {' ('}
            <EditableText
              value={experience.location}
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
        {' \u2022 '}
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
        {' \u2014 '}
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
      </div>

      {/* Company Description (italic) */}
      {(experience.description || isEditing) && (
        <div style={{
          fontFamily: "'Instrument Sans', sans-serif",
          fontSize: 11,
          fontStyle: 'italic',
          color: '#555555',
          marginBottom: 8,
          lineHeight: 1.5,
        }}>
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
        </div>
      )}

      {/* Responsibilities */}
      <div style={{
        fontFamily: "'Instrument Sans', sans-serif",
        fontSize: 11,
        color: '#1a1a1a',
        lineHeight: 1.6,
      }}>
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
    <div style={{ marginBottom: 16, position: 'relative' }}>
      {isEditing && onDelete && (
        <button
          onClick={onDelete}
          style={{
            position: 'absolute',
            right: -20,
            top: 0,
            width: 16,
            height: 16,
            borderRadius: '50%',
            border: 'none',
            background: '#ef4444',
            color: 'white',
            fontSize: 10,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            opacity: 0.7,
          }}
          title="Delete"
        >
          x
        </button>
      )}

      {/* Category Name */}
      <div style={{
        fontFamily: "'Instrument Sans', sans-serif",
        fontSize: 10,
        fontWeight: 600,
        textTransform: 'uppercase',
        letterSpacing: '0.03em',
        color: '#1a1a1a',
        marginBottom: 4,
      }}>
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
      </div>

      {/* Items */}
      <div style={{
        fontFamily: "'Instrument Sans', sans-serif",
        fontSize: 10,
        color: '#1a1a1a',
        lineHeight: 1.5,
      }}>
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
      </div>
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
    <div style={{ marginBottom: 12, position: 'relative' }}>
      {isEditing && onDelete && (
        <button
          onClick={onDelete}
          style={{
            position: 'absolute',
            right: -20,
            top: 0,
            width: 16,
            height: 16,
            borderRadius: '50%',
            border: 'none',
            background: '#ef4444',
            color: 'white',
            fontSize: 10,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            opacity: 0.7,
          }}
          title="Delete"
        >
          x
        </button>
      )}

      <div style={{
        fontFamily: "'Instrument Sans', sans-serif",
        fontSize: 10,
        fontWeight: 500,
        color: '#1a1a1a',
      }}>
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
      </div>
      <div style={{
        fontFamily: "'Instrument Sans', sans-serif",
        fontSize: 10,
        color: '#555555',
      }}>
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
      </div>
      <div style={{
        fontFamily: "'Instrument Sans', sans-serif",
        fontSize: 10,
        color: '#1a1a1a',
      }}>
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
      </div>
    </div>
  );
}

// Add button component
function AddButton({ onClick, label }: { onClick?: () => void; label: string }) {
  return (
    <button
      onClick={onClick}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 4,
        padding: '6px 12px',
        background: 'transparent',
        border: '1px dashed #ccc',
        borderRadius: 4,
        cursor: 'pointer',
        fontFamily: "'Instrument Sans', sans-serif",
        fontSize: 10,
        color: '#666',
        marginTop: 8,
        transition: 'all 0.15s',
      }}
      onMouseEnter={(e) => {
        (e.target as HTMLElement).style.borderColor = '#3b82f6';
        (e.target as HTMLElement).style.color = '#3b82f6';
      }}
      onMouseLeave={(e) => {
        (e.target as HTMLElement).style.borderColor = '#ccc';
        (e.target as HTMLElement).style.color = '#666';
      }}
    >
      <span style={{ fontSize: 14 }}>+</span> {label}
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
    <div
      className="cv-document"
      style={{
        width: '100%',
        maxWidth: 800,
        margin: '0 auto',
        padding: 48,
        background: '#ffffff',
        fontFamily: "'Instrument Sans', sans-serif",
        color: '#1a1a1a',
        minHeight: '100%',
      }}
    >
      {/* Header - Name and Title */}
      <div style={{ marginBottom: 24, borderBottom: '1px solid #e5e5e5', paddingBottom: 16 }}>
        <h1 style={{
          fontFamily: "'Averia Serif Libre', serif",
          fontSize: 28,
          fontWeight: 400,
          margin: 0,
          color: '#1a1a1a',
          lineHeight: 1.2,
        }}>
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
          <span style={{ color: '#555' }}> — </span>
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
      </div>

      {/* Two Column Layout */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '30% 70%',
        gap: 32,
      }}>
        {/* Left Column - Skills, Education, Contact */}
        <div style={{ paddingRight: 16 }}>
          {/* Skills Section */}
          <section style={{ marginBottom: 28 }}>
            <h2 style={{
              fontFamily: "'Averia Serif Libre', serif",
              fontSize: 11,
              fontWeight: 400,
              color: '#1a1a1a',
              marginBottom: 12,
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
            }}>
              Skills
            </h2>
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
          <section style={{ marginBottom: 28 }}>
            <h2 style={{
              fontFamily: "'Averia Serif Libre', serif",
              fontSize: 11,
              fontWeight: 400,
              color: '#1a1a1a',
              marginBottom: 12,
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
            }}>
              Education
            </h2>
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
          <section>
            <h2 style={{
              fontFamily: "'Averia Serif Libre', serif",
              fontSize: 11,
              fontWeight: 400,
              color: '#1a1a1a',
              marginBottom: 12,
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
            }}>
              Contact
            </h2>
            <div style={{
              fontFamily: "'Instrument Sans', sans-serif",
              fontSize: 10,
              color: '#1a1a1a',
              lineHeight: 1.8,
            }}>
              {(content.contact.location || isEditing) && (
                <div>
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
                </div>
              )}
              {(content.contact.phone || isEditing) && (
                <div>
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
                </div>
              )}
              {(content.contact.email || isEditing) && (
                <div>
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
                    <a href={`mailto:${content.contact.email}`} style={{ color: '#1a1a1a', textDecoration: 'none' }}>
                      {content.contact.email}
                    </a>
                  )}
                </div>
              )}
              {(content.contact.linkedin || isEditing) && (
                <div>
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
                    <a href={content.contact.linkedin} target="_blank" rel="noopener noreferrer" style={{ color: '#1a1a1a', textDecoration: 'none' }}>
                      {content.contact.linkedin?.replace('https://', '').replace('www.', '')}
                    </a>
                  )}
                </div>
              )}
              {(content.contact.website || isEditing) && (
                <div>
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
                    <a href={content.contact.website} target="_blank" rel="noopener noreferrer" style={{ color: '#1a1a1a', textDecoration: 'none' }}>
                      {content.contact.website?.replace('https://', '').replace('www.', '')}
                    </a>
                  )}
                </div>
              )}
              {(content.contact.tagline || isEditing) && (
                <div style={{ marginTop: 8, fontStyle: 'italic', color: '#555' }}>
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
                </div>
              )}
            </div>
          </section>
        </div>

        {/* Right Column - About, Experience */}
        <div>
          {/* About Section */}
          <section style={{ marginBottom: 28 }}>
            <h2 style={{
              fontFamily: "'Averia Serif Libre', serif",
              fontSize: 11,
              fontWeight: 400,
              color: '#1a1a1a',
              marginBottom: 12,
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
            }}>
              About me
            </h2>
            <div style={{
              fontFamily: "'Instrument Sans', sans-serif",
              fontSize: 11,
              color: '#1a1a1a',
              lineHeight: 1.6,
            }}>
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
          <section>
            <h2 style={{
              fontFamily: "'Averia Serif Libre', serif",
              fontSize: 11,
              fontWeight: 400,
              color: '#1a1a1a',
              marginBottom: 16,
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
            }}>
              Experience
            </h2>
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
        </div>
      </div>
    </div>
  );
}

export default GoOSCVDocument;
