'use client';

import React from 'react';
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  pdf,
  Link,
} from '@react-pdf/renderer';
import type { CVContent, CVExperience, CVSkillCategory, CVEducation } from '@/lib/validations/goos';

// PDF Styles matching the screen design
const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontFamily: 'Helvetica',
    fontSize: 10,
    color: '#1a1a1a',
    backgroundColor: '#ffffff',
  },
  header: {
    marginBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e5e5',
    paddingBottom: 12,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'normal',
    color: '#1a1a1a',
    lineHeight: 1.2,
  },
  headerTitleDash: {
    color: '#555555',
  },
  twoColumn: {
    flexDirection: 'row',
    gap: 24,
  },
  leftColumn: {
    width: '30%',
    paddingRight: 12,
  },
  rightColumn: {
    width: '70%',
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 9,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 10,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  // Skills styles
  skillCategory: {
    marginBottom: 12,
  },
  skillCategoryName: {
    fontSize: 8,
    fontWeight: 'bold',
    textTransform: 'uppercase',
    letterSpacing: 0.3,
    marginBottom: 3,
  },
  skillItems: {
    fontSize: 9,
    lineHeight: 1.5,
    color: '#1a1a1a',
  },
  // Education styles
  educationItem: {
    marginBottom: 10,
  },
  educationDegree: {
    fontSize: 9,
    fontWeight: 'medium',
  },
  educationDates: {
    fontSize: 9,
    color: '#555555',
  },
  educationInstitution: {
    fontSize: 9,
  },
  // Contact styles
  contactItem: {
    fontSize: 9,
    marginBottom: 3,
    lineHeight: 1.6,
  },
  contactLink: {
    color: '#1a1a1a',
    textDecoration: 'none',
  },
  contactTagline: {
    marginTop: 6,
    fontStyle: 'italic',
    color: '#555555',
  },
  // About styles
  aboutText: {
    fontSize: 10,
    lineHeight: 1.6,
  },
  // Experience styles
  experienceItem: {
    marginBottom: 16,
  },
  experienceRole: {
    fontSize: 10,
    fontWeight: 'bold',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 3,
  },
  experienceMeta: {
    fontSize: 10,
    marginBottom: 3,
  },
  experienceDescription: {
    fontSize: 10,
    fontStyle: 'italic',
    color: '#555555',
    marginBottom: 6,
    lineHeight: 1.4,
  },
  experienceResponsibilities: {
    fontSize: 10,
    lineHeight: 1.6,
  },
});

// Experience item component for PDF
function PDFExperienceItem({ experience }: { experience: CVExperience }) {
  return (
    <View style={styles.experienceItem}>
      <Text style={styles.experienceRole}>{experience.role}</Text>
      <Text style={styles.experienceMeta}>
        {experience.company}
        {experience.location && ` (${experience.location})`}
        {' \u2022 '}
        {experience.startDate} — {experience.endDate || 'Present'}
      </Text>
      {experience.description && (
        <Text style={styles.experienceDescription}>{experience.description}</Text>
      )}
      {experience.responsibilities && (
        <Text style={styles.experienceResponsibilities}>{experience.responsibilities}</Text>
      )}
    </View>
  );
}

// Skill category component for PDF
function PDFSkillCategory({ skill }: { skill: CVSkillCategory }) {
  return (
    <View style={styles.skillCategory}>
      <Text style={styles.skillCategoryName}>{skill.category}</Text>
      <Text style={styles.skillItems}>{skill.items.join(', ')}</Text>
    </View>
  );
}

// Education item component for PDF
function PDFEducationItem({ education }: { education: CVEducation }) {
  return (
    <View style={styles.educationItem}>
      <Text style={styles.educationDegree}>{education.degree}</Text>
      <Text style={styles.educationDates}>{education.dates}</Text>
      <Text style={styles.educationInstitution}>{education.institution}</Text>
    </View>
  );
}

// The PDF Document component
function CVDocument({ content }: { content: CVContent }) {
  return (
    <Document>
      <Page size="LETTER" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>
            {content.name}
            <Text style={styles.headerTitleDash}> — </Text>
            {content.title}
          </Text>
        </View>

        {/* Two Column Layout */}
        <View style={styles.twoColumn}>
          {/* Left Column */}
          <View style={styles.leftColumn}>
            {/* Skills Section */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Skills</Text>
              {content.skills.map((skill) => (
                <PDFSkillCategory key={skill.id} skill={skill} />
              ))}
            </View>

            {/* Education Section */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Education</Text>
              {content.education.map((edu) => (
                <PDFEducationItem key={edu.id} education={edu} />
              ))}
            </View>

            {/* Contact Section */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Contact</Text>
              {content.contact.location && (
                <Text style={styles.contactItem}>{content.contact.location}</Text>
              )}
              {content.contact.phone && (
                <Text style={styles.contactItem}>{content.contact.phone}</Text>
              )}
              {content.contact.email && (
                <Link src={`mailto:${content.contact.email}`} style={styles.contactLink}>
                  <Text style={styles.contactItem}>{content.contact.email}</Text>
                </Link>
              )}
              {content.contact.linkedin && (
                <Link src={content.contact.linkedin} style={styles.contactLink}>
                  <Text style={styles.contactItem}>
                    {content.contact.linkedin.replace('https://', '').replace('www.', '')}
                  </Text>
                </Link>
              )}
              {content.contact.website && (
                <Link src={content.contact.website} style={styles.contactLink}>
                  <Text style={styles.contactItem}>
                    {content.contact.website.replace('https://', '').replace('www.', '')}
                  </Text>
                </Link>
              )}
              {content.contact.tagline && (
                <Text style={[styles.contactItem, styles.contactTagline]}>
                  {content.contact.tagline}
                </Text>
              )}
            </View>
          </View>

          {/* Right Column */}
          <View style={styles.rightColumn}>
            {/* About Section */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>About me</Text>
              <Text style={styles.aboutText}>{content.about}</Text>
            </View>

            {/* Experience Section */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Experience</Text>
              {content.experience.map((exp) => (
                <PDFExperienceItem key={exp.id} experience={exp} />
              ))}
            </View>
          </View>
        </View>
      </Page>
    </Document>
  );
}

// Export function - generates and downloads the PDF
export async function exportCVToPDF(content: CVContent, filename: string = 'CV'): Promise<void> {
  try {
    const blob = await pdf(<CVDocument content={content} />).toBlob();
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${filename.replace(/[^a-z0-9]/gi, '-')}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Failed to export PDF:', error);
    throw error;
  }
}

export default CVDocument;
