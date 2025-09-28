import Script from 'next/script'

interface StructuredDataProps {
  type: 'organization' | 'course' | 'faq' | 'website'
  data?: any
}

export default function StructuredData({ type, data }: StructuredDataProps) {
  const getStructuredData = () => {
    switch (type) {
      case 'organization':
        return {
          "@context": "https://schema.org",
          "@type": "Organization",
          name: "Edmissions",
          description: "Computer Science Teacher Exam Preparation Platform",
          url: "https://edmissions.com",
          logo: "https://edmissions.site/icon.svg",
          contactPoint: {
            "@type": "ContactPoint",
            telephone: "+91-8809586507",
            contactType: "customer service",
            availableLanguage: ["English", "Hindi"],
          },
          address: {
            "@type": "PostalAddress",
            addressCountry: "IN",
            addressRegion: "Bihar",
          },
          sameAs: ["https://wa.me/918789449507"],
          areaServed: "India",
          serviceType: "Educational Services",
        };

      case 'website':
        return {
          "@context": "https://schema.org",
          "@type": "WebSite",
          name: "Edmissions - Computer Science Teacher Exam Preparation",
          url: "https://edmissions.site",
          description:
            "Master Computer Science teaching exams with comprehensive study materials, previous year questions & expert guidance.",
          potentialAction: {
            "@type": "SearchAction",
            target: "https://edmissions.site/search?q={search_term_string}",
            "query-input": "required name=search_term_string",
          },
          publisher: {
            "@type": "Organization",
            name: "Edmissions",
          },
        };

      case 'course':
        return {
          "@context": "https://schema.org",
          "@type": "Course",
          name: "Computer Science Teacher Exam Preparation",
          description:
            "Comprehensive preparation for PGT STET and BPSE TRE 4 Computer Science exams",
          provider: {
            "@type": "Organization",
            name: "Edmissions",
            url: "https://edmissions.site",
          },
          educationalLevel: "Graduate",
          courseMode: "Online",
          hasCourseInstance: {
            "@type": "CourseInstance",
            courseMode: "Online",
            instructor: {
              "@type": "Person",
              name: "Edmissions Team",
            },
          },
          about: [
            "Computer Science",
            "Teaching Methodology",
            "Programming Concepts",
            "Data Structures",
            "Algorithms",
            "Database Management",
            "Computer Networks",
            "Software Engineering",
          ],
          teaches: [
            "PGT STET Computer Science",
            "BPSE TRE 4 Computer Science",
            "Programming Fundamentals",
            "Teaching Strategies",
          ],
        };

      case 'faq':
        return {
          "@context": "https://schema.org",
          "@type": "FAQPage",
          "mainEntity": [
            {
              "@type": "Question",
              "name": "Which exams does this course cover?",
              "acceptedAnswer": {
                "@type": "Answer",
                "text": "This course is designed for BPSC TRE 4.0 (Computer Science) and Bihar STET (Computer Science) exams, covering the complete latest syllabus."
              }
            },
            {
              "@type": "Question",
              "name": "What do I get in this course?",
              "acceptedAnswer": {
                "@type": "Answer",
                "text": "You get written notes, topic-wise explanations, solved examples, previous year questions, and practice questions — all in an easy-to-understand, exam-oriented format."
              }
            },
            {
              "@type": "Question",
              "name": "How long do I get access?",
              "acceptedAnswer": {
                "@type": "Answer",
                "text": "You get lifetime access, including free updates whenever the syllabus or exam pattern changes."
              }
            },
            {
              "@type": "Question",
              "name": "Can I ask doubts if I get stuck?",
              "acceptedAnswer": {
                "@type": "Answer",
                "text": "Yes, we offer Telegram/WhatsApp group support where you can get your doubts solved quickly."
              }
            }
          ]
        }

      default:
        return {}
    }
  }

  return (
    <Script
      id={`structured-data-${type}`}
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(getStructuredData())
      }}
    />
  )
}
