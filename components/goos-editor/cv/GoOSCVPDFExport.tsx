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
  Font,
} from '@react-pdf/renderer';
import type { CVContent, CVExperience, CVSkillCategory, CVEducation } from '@/lib/validations/goos';

// Register custom fonts from Google Fonts
// Using direct download URLs from Google Fonts API
// Averia Serif Libre - for headings (serif, matches screen design)
Font.register({
  family: 'Averia Serif Libre',
  fonts: [
    {
      src: '/fonts/AveriaSerifLibre-Regular.ttf',
      fontWeight: 400,
    },
    {
      src: '/fonts/AveriaSerifLibre-Bold.ttf',
      fontWeight: 700,
    },
  ],
});

// Instrument Sans - for body text (sans-serif, matches screen design)
Font.register({
  family: 'Instrument Sans',
  fonts: [
    {
      src: '/fonts/InstrumentSans-Regular.ttf',
      fontWeight: 400,
    },
    {
      src: '/fonts/InstrumentSans-Medium.ttf',
      fontWeight: 500,
    },
    {
      src: '/fonts/InstrumentSans-SemiBold.ttf',
      fontWeight: 600,
    },
  ],
});

// Disable hyphenation for cleaner text
Font.registerHyphenationCallback((word) => [word]);

// PDF Styles matching the screen design exactly
const styles = StyleSheet.create({
  page: {
    paddingTop: 48,
    paddingBottom: 48,
    paddingHorizontal: 56,
    fontFamily: 'Instrument Sans',
    fontSize: 11,
    color: '#1a1a1a',
    backgroundColor: '#ffffff',
  },
  header: {
    marginBottom: 28,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    paddingBottom: 18,
  },
  headerTitle: {
    fontFamily: 'Averia Serif Libre',
    fontSize: 26,
    fontWeight: 400,
    color: '#1a1a1a',
    lineHeight: 1.2,
  },
  headerSeparator: {
    color: '#666666',
  },
  twoColumn: {
    flexDirection: 'row',
    gap: 36,
  },
  leftColumn: {
    width: '28%',
  },
  rightColumn: {
    width: '72%',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontFamily: 'Averia Serif Libre',
    fontSize: 10,
    fontWeight: 400,
    color: '#1a1a1a',
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  // Skills styles
  skillCategory: {
    marginBottom: 14,
  },
  skillCategoryName: {
    fontFamily: 'Instrument Sans',
    fontSize: 9,
    fontWeight: 600,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
    marginBottom: 3,
    color: '#1a1a1a',
  },
  skillItems: {
    fontFamily: 'Instrument Sans',
    fontSize: 10,
    fontWeight: 400,
    lineHeight: 1.5,
    color: '#1a1a1a',
  },
  // Education styles
  educationItem: {
    marginBottom: 12,
  },
  educationDegree: {
    fontFamily: 'Instrument Sans',
    fontSize: 10,
    fontWeight: 500,
    color: '#1a1a1a',
    marginBottom: 2,
  },
  educationDates: {
    fontFamily: 'Instrument Sans',
    fontSize: 9,
    fontWeight: 400,
    color: '#666666',
    marginBottom: 2,
  },
  educationInstitution: {
    fontFamily: 'Instrument Sans',
    fontSize: 10,
    fontWeight: 400,
    color: '#1a1a1a',
  },
  // Contact styles
  contactItem: {
    fontFamily: 'Instrument Sans',
    fontSize: 10,
    fontWeight: 400,
    marginBottom: 4,
    lineHeight: 1.7,
    color: '#1a1a1a',
  },
  contactLink: {
    color: '#1a1a1a',
    textDecoration: 'none',
  },
  contactTagline: {
    marginTop: 10,
    fontStyle: 'italic',
    color: '#666666',
  },
  // About styles
  aboutText: {
    fontFamily: 'Instrument Sans',
    fontSize: 11,
    fontWeight: 400,
    lineHeight: 1.65,
    color: '#1a1a1a',
  },
  // Experience styles
  experienceItem: {
    marginBottom: 22,
  },
  experienceRole: {
    fontFamily: 'Instrument Sans',
    fontSize: 10,
    fontWeight: 600,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 5,
    color: '#1a1a1a',
  },
  experienceCompanyLine: {
    fontFamily: 'Instrument Sans',
    fontSize: 11,
    fontWeight: 400,
    marginBottom: 5,
    color: '#1a1a1a',
  },
  experienceSeparator: {
    color: '#666666',
  },
  experienceDescription: {
    fontFamily: 'Instrument Sans',
    fontSize: 10,
    fontWeight: 400,
    fontStyle: 'italic',
    color: '#666666',
    marginBottom: 8,
    lineHeight: 1.5,
  },
  experienceResponsibilities: {
    fontFamily: 'Instrument Sans',
    fontSize: 11,
    fontWeight: 400,
    lineHeight: 1.6,
    color: '#1a1a1a',
  },
});

// Experience item component for PDF
function PDFExperienceItem({ experience }: { experience: CVExperience }) {
  return (
    <View style={styles.experienceItem}>
      <Text style={styles.experienceRole}>{experience.role}</Text>
      <Text style={styles.experienceCompanyLine}>
        {experience.company}
        {experience.location && ` (${experience.location})`}
        <Text style={styles.experienceSeparator}> • </Text>
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
            <Text style={styles.headerSeparator}> — </Text>
            {content.title}
          </Text>
        </View>

        {/* Two Column Layout */}
        <View style={styles.twoColumn}>
          {/* Left Column */}
          <View style={styles.leftColumn}>
            {/* Skills Section */}
            {content.skills.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Skills</Text>
                {content.skills.map((skill) => (
                  <PDFSkillCategory key={skill.id} skill={skill} />
                ))}
              </View>
            )}

            {/* Education Section */}
            {content.education.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Education</Text>
                {content.education.map((edu) => (
                  <PDFEducationItem key={edu.id} education={edu} />
                ))}
              </View>
            )}

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
            {content.about && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>About me</Text>
                <Text style={styles.aboutText}>{content.about}</Text>
              </View>
            )}

            {/* Experience Section */}
            {content.experience.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Experience</Text>
                {content.experience.map((exp) => (
                  <PDFExperienceItem key={exp.id} experience={exp} />
                ))}
              </View>
            )}
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
