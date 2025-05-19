import jsPDF from 'jspdf';
import { AssessmentSetup } from '../types/assessment';

/**
 * Generates a professionally formatted PDF report directly
 */
export const generateProfessionalPDF = (assessmentData: any, setupData: AssessmentSetup | null): Promise<Blob> => {
  return new Promise((resolve) => {
    // Create a new PDF document
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });
    
    // Define margins and dimensions
    const pageWidth = 210;
    const pageHeight = 297;
    const margin = 20;
    const contentWidth = pageWidth - (margin * 2);
    
    // Define text styles/sizes
    const fontSizes = {
      title: 20,
      heading1: 16,
      heading2: 14,
      heading3: 12,
      normal: 10,
      small: 8
    };
    
    // Track current Y position
    let currentY = margin;
    let pageCount = 1;
    
    // Function to add a new page
    const addNewPage = () => {
      pdf.addPage();
      pageCount++;
      currentY = margin;
      // Add page number at the bottom
      pdf.setFontSize(fontSizes.small);
      pdf.setTextColor(128, 128, 128);
      pdf.text(`Page ${pageCount}`, pageWidth / 2, pageHeight - 10, { align: 'center' });
    };
    
    // Function to add text with line wrapping
    const addText = (text: string, x: number, fontSize: number, fontStyle: string = 'normal', maxWidth: number = contentWidth, textColor: number[] = [0, 0, 0]) => {
      if (!text) return;
      
      pdf.setFontSize(fontSize);
      pdf.setFont('helvetica', fontStyle);
      pdf.setTextColor(textColor[0], textColor[1], textColor[2]);
      
      // Check if we need a new page
      if (currentY > pageHeight - margin) {
        addNewPage();
      }
      
      const lines = pdf.splitTextToSize(text, maxWidth);
      pdf.text(lines, x, currentY);
      
      // Update Y position based on the number of lines
      const lineHeight = fontSize * 0.352778; // Convert pt to mm
      currentY += lines.length * lineHeight * 1.2; // Add 20% spacing between lines
      
      return lines.length * lineHeight * 1.2; // Return the amount of space used
    };
    
    // Function to add a heading
    const addHeading = (text: string, level: 1 | 2 | 3) => {
      // Check if we need a new page
      if (currentY > pageHeight - margin - 30) {
        addNewPage();
      }
      
      let fontSize, fontStyle, color;
      
      if (level === 1) {
        fontSize = fontSizes.heading1;
        fontStyle = 'bold';
        color = [0, 51, 102]; // Dark blue
        currentY += 5; // Extra space before main headings
      } else if (level === 2) {
        fontSize = fontSizes.heading2;
        fontStyle = 'bold';
        color = [0, 102, 153]; // Medium blue
        currentY += 3; // Less extra space
      } else {
        fontSize = fontSizes.heading3;
        fontStyle = 'bold';
        color = [0, 128, 128]; // Teal
        currentY += 2; // Minimal extra space
      }
      
      addText(text, margin, fontSize, fontStyle, contentWidth, color);
      
      // Add line under level 1 and 2 headings
      if (level === 1 || level === 2) {
        pdf.setDrawColor(color[0], color[1], color[2]);
        pdf.setLineWidth(level === 1 ? 0.5 : 0.3);
        pdf.line(margin, currentY - 1, pageWidth - margin, currentY - 1);
        currentY += 3; // Space after the line
      }
    };
    
    // Function to add a simple field
    const addField = (label: string, value: any, indent: number = 0) => {
      if (value === undefined || value === null || value === '') return;
      
      // Convert boolean to Yes/No
      const displayValue = typeof value === 'boolean' ? (value ? 'Yes' : 'No') : value.toString();
      
      // Check if we need a new page
      if (currentY > pageHeight - margin - 10) {
        addNewPage();
      }
      
      pdf.setFontSize(fontSizes.normal);
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(50, 50, 50);
      pdf.text(`${label}:`, margin + indent, currentY);
      
      pdf.setFont('helvetica', 'normal');
      pdf.setTextColor(0, 0, 0);
      
      // Handle different ways based on content length
      const isLongText = displayValue.length > 40 || displayValue.includes('\n');
      const isComment = label.toLowerCase().includes('comment') || label.toLowerCase().includes('note');
      
      if (isLongText || isComment) {
        // For comments or long text, use a different approach with proper text wrapping
        currentY += fontSizes.normal * 0.352778 * 1.2; // Move to next line
        
        // Calculate available width for the text
        const availableWidth = contentWidth - indent - 5;
        
        // Split text to fit the available width
        const textLines = pdf.splitTextToSize(displayValue, availableWidth);
        
        // Check if we need a new page based on the number of lines
        if (currentY + (textLines.length * fontSizes.normal * 0.352778 * 1.2) > pageHeight - margin) {
          addNewPage();
        }
        
        // Render the text with proper line breaks
        pdf.text(textLines, margin + indent + 5, currentY);
        
        // Update Y position based on the number of lines
        currentY += textLines.length * fontSizes.normal * 0.352778 * 1.2;
      } else {
        // For shorter values, use the inline approach
        // Calculate where the value should start
        const labelWidth = pdf.getTextWidth(`${label}: `);
        const valueX = Math.min(margin + indent + labelWidth + 2, margin + 60); // Cap at 60mm indent
        
        // If value would start too far to the right, move it to the next line
        if (valueX > pageWidth - margin - 40) {
          currentY += fontSizes.normal * 0.352778 * 1.2;
          pdf.text(displayValue, margin + indent + 5, currentY);
        } else {
          pdf.text(displayValue, valueX, currentY);
        }
        
        currentY += fontSizes.normal * 0.352778 * 1.2; // Move to next line with spacing
      }
      
      // Add some extra spacing after the field
      currentY += fontSizes.normal * 0.352778 * 0.3;
    };
    
    // Function to add a section divider
    const addDivider = () => {
      currentY += 3;
      pdf.setDrawColor(200, 200, 200);
      pdf.setLineWidth(0.2);
      pdf.line(margin, currentY, pageWidth - margin, currentY);
      currentY += 5;
    };
    
    // Function to format date
    const formatDate = (dateString: string): string => {
      try {
        const date = new Date(dateString);
        return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
      } catch (e) {
        return dateString || '';
      }
    };
    
    // Process specific object data
    const processData = (data: any, label: string, level: 1 | 2 | 3, indentLevel: number = 0) => {
      if (!data) return;
      
      // Add section heading
      addHeading(label, level);
      
      if (typeof data === 'object' && !Array.isArray(data)) {
        // Handle key objects: we process them directly
        for (const key of Object.keys(data)) {
          // Skip image arrays
          if (/images$/i.test(key) && Array.isArray(data[key])) {
            // Just note how many images there are
            if (data[key].length > 0) {
              addField(`${key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())} count`, data[key].length, indentLevel);
            }
            continue;
          }
          
          // Skip internal fields
          if (key === 'id' || key === 'associatedWith') continue;
          
          const value = data[key];
          
          // Format the field name
          const fieldName = key
            .replace(/([A-Z])/g, ' $1') // Add space before capital letters
            .replace(/^./, str => str.toUpperCase()) // Capitalize first letter
            .trim();
          
          if (Array.isArray(value)) {
            // Handle arrays
            if (value.length > 0) {
              // Add an extra line for clarity
              currentY += 2;
              
              if (typeof value[0] === 'object' && value[0] !== null) {
                // For arrays of objects, add a subsection for each item
                addText(`${fieldName} (${value.length})`, margin + indentLevel, fontSizes.normal, 'bold', contentWidth, [0, 102, 102]);
                currentY += 2;
                
                value.forEach((item, idx) => {
                  const itemLabel = `${fieldName.endsWith('s') ? fieldName.slice(0, -1) : fieldName} ${idx + 1}`;
                  processData(item, itemLabel, 3, indentLevel + 5);
                  
                  // Add a small separator between items if not the last one
                  if (idx < value.length - 1) {
                    pdf.setDrawColor(220, 220, 220);
                    pdf.setLineWidth(0.1);
                    pdf.line(margin + indentLevel + 5, currentY - 2, pageWidth - margin - 10, currentY - 2);
                    currentY += 3;
                  }
                });
              } else {
                // Simple array, just list the items
                addText(`${fieldName}:`, margin + indentLevel, fontSizes.normal, 'bold');
                currentY -= fontSizes.normal * 0.352778 * 1.2; // Go back up a bit
                
                value.forEach((item, idx) => {
                  addField(`   ${idx + 1}`, item, indentLevel + 5);
                });
              }
            }
          } else if (typeof value === 'object' && value !== null) {
            // Nested object
            processData(value, fieldName, 3, indentLevel + 5);
          } else {
            // Simple field
            addField(fieldName, value, indentLevel);
          }
        }
      } else if (Array.isArray(data)) {
        // It's an array directly
        data.forEach((item, idx) => {
          const itemLabel = `${label} ${idx + 1}`;
          processData(item, itemLabel, 3, indentLevel + 5);
          
          // Add separator between items
          if (idx < data.length - 1) {
            currentY += 2;
          }
        });
      } else {
        // It's a primitive value
        addField(label, data, indentLevel);
      }
    };
    
    try {
      // Add company logo or header if available
      // TODO: Add EFI logo if provided
      
      // Cover page
      pdf.setDrawColor(0, 51, 102);
      pdf.setFillColor(0, 51, 102);
      pdf.rect(0, 0, pageWidth, 50, 'F');
      
      // Title
      pdf.setFontSize(28);
      pdf.setTextColor(255, 255, 255);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Fire Risk Assessment', pageWidth / 2, 30, { align: 'center' });
      
      // Subtitle with date
      const today = new Date().toLocaleDateString();
      pdf.setFontSize(14);
      pdf.text(`Assessment Report - ${today}`, pageWidth / 2, 42, { align: 'center' });
      
      currentY = 70;
      
      // Add substation details
      if (setupData) {
        pdf.setFontSize(fontSizes.heading2);
        pdf.setTextColor(0, 51, 102);
        pdf.setFont('helvetica', 'bold');
        pdf.text('Substation Information', pageWidth / 2, currentY, { align: 'center' });
        currentY += 10;
        
        // Key info box
        pdf.setDrawColor(200, 200, 200);
        pdf.setFillColor(240, 240, 240);
        pdf.roundedRect(margin, currentY, contentWidth, 50, 3, 3, 'FD');
        
        currentY += 8;
        addField('Substation Name', setupData.substationName, 5);
        addField('Region', setupData.region, 5);
        addField('Assessment Date', formatDate(setupData.assessmentDate), 5);
        addField('EFI Representative', setupData.efiRepresentative, 5);
        if (setupData.cotRepresentative) {
          addField('CoT Representative', setupData.cotRepresentative, 5);
        }
        
        currentY += 10;
      }
      
      // Add page number to first page
      pdf.setFontSize(fontSizes.small);
      pdf.setTextColor(128, 128, 128);
      pdf.text(`Page ${pageCount}`, pageWidth / 2, pageHeight - 10, { align: 'center' });
      
      // Start the main content on a new page
      addNewPage();
      
      // Table of contents
      addHeading('Table of Contents', 1);
      currentY += 5;
      
      const sections = [
        { title: '1. Assessment Setup', y: 0 },
        { title: '2. Passive Fire Protection', y: 0 },
        { title: '3. Active Fire Protection', y: 0 },
        { title: '4. Transformer Risk', y: 0 },
        { title: '5. Circuit Breaker Risk', y: 0 },
        { title: '6. Cable Risk', y: 0 },
        { title: '7. Earthing and Lightning', y: 0 },
        { title: '8. Arc Protection', y: 0 }
      ];
      
      // Add TOC entries
      sections.forEach((section, i) => {
        pdf.setFontSize(fontSizes.normal);
        pdf.setFont('helvetica', i === 0 ? 'bold' : 'normal');
        pdf.setTextColor(0, 0, 0);
        pdf.text(section.title, margin, currentY);
        
        pdf.setDrawColor(200, 200, 200);
        // Use dotted line - alternative to setDash which may not be available in some jsPDF versions
        const dashLength = 1;
        const gapLength = 1;
        const lineLength = pageWidth - margin - 10 - (margin + pdf.getTextWidth(section.title) + 5);
        const startX = margin + pdf.getTextWidth(section.title) + 5;
        
        // Draw a dotted line manually
        for (let x = 0; x < lineLength; x += (dashLength + gapLength)) {
          pdf.line(
            startX + x, 
            currentY, 
            startX + Math.min(x + dashLength, lineLength), 
            currentY
          );
        }
        
        // Page will be filled in later
        sections[i].y = currentY;
        
        currentY += fontSizes.normal * 0.352778 * 1.8;
      });
      
      currentY += 10;
      
      // Main content
      addNewPage();
      
      // 1. Assessment Setup
      const setupPage = pageCount;
      addHeading('1. Assessment Setup', 1);
      
      if (setupData) {
        // Key assessment details
        addField('Substation Name', setupData.substationName);
        addField('Region', setupData.region);
        addField('Assessment Date', formatDate(setupData.assessmentDate));
        addField('EFI Representative', setupData.efiRepresentative);
        if (setupData.cotRepresentative) {
          addField('CoT Representative', setupData.cotRepresentative);
        }
        
        // Safety Assessment
        addHeading('1.1 Safety Assessment', 2);
        
        // Add safety status with color highlighting based on value
        pdf.setFontSize(fontSizes.normal);
        pdf.setFont('helvetica', 'bold');
        pdf.text('Is Premises Safe for Entry:', margin, currentY);
        
        const labelWidth = pdf.getTextWidth('Is Premises Safe for Entry: ');
        const valueX = margin + labelWidth + 2;
        
        // Set color based on safety status
        if (setupData.isSafeToEnter === false) {
          pdf.setTextColor(255, 0, 0); // Red for unsafe
        } else {
          pdf.setTextColor(0, 128, 0); // Green for safe
        }
        
        pdf.setFont('helvetica', 'bold');
        pdf.text(setupData.isSafeToEnter ? 'Yes' : 'No', valueX, currentY);
        currentY += fontSizes.normal * 0.352778 * 1.5;
        
        // Add reason if premises is unsafe
        if (setupData.isSafeToEnter === false && setupData.safetyDeclineReason) {
          // Add warning box
          pdf.setDrawColor(255, 0, 0);
          pdf.setFillColor(255, 240, 240);
          pdf.roundedRect(margin, currentY, contentWidth, 30, 2, 2, 'FD');
          
          currentY += 8;
          pdf.setFont('helvetica', 'bold');
          pdf.setTextColor(255, 0, 0);
          pdf.setFontSize(fontSizes.normal + 2);
          pdf.text('PREMISES DEEMED UNSAFE FOR ENTRY', margin + 5, currentY);
          currentY += fontSizes.normal * 0.352778 * 1.8;
          
          pdf.setFont('helvetica', 'normal');
          pdf.setTextColor(0, 0, 0);
          pdf.setFontSize(fontSizes.normal);
          addText(`Reason: ${setupData.safetyDeclineReason}`, margin + 5, fontSizes.normal);
          currentY += 5;
          
          addText('Note: Assessment could not be completed due to safety concerns.', margin + 5, fontSizes.normal, 'italic');
          currentY += 5;
        }
      } else {
        addText('No assessment setup data available.', margin, fontSizes.normal, 'italic');
      }
      
      addDivider();
      
      // 2. Passive Fire Protection
      const passivePage = pageCount;
      addHeading('2. Passive Fire Protection', 1);
      
      if (assessmentData?.passiveFireProtection) {
        processData(assessmentData.passiveFireProtection, '', 2);
      } else {
        addText('No passive fire protection data available.', margin, fontSizes.normal, 'italic');
      }
      
      addDivider();
      
      // 3. Active Fire Protection
      const activePage = pageCount;
      addHeading('3. Active Fire Protection', 1);
      
      if (assessmentData?.activeFireProtection) {
        const af = assessmentData.activeFireProtection;
        
        // Hydrants
        if (af.hasHydrants && af.hydrants && af.hydrants.length > 0) {
          processData({ hydrants: af.hydrants }, 'Hydrants', 2);
        }
        
        // Hose Reels
        if (af.hasHoseReels && af.hoseReels && af.hoseReels.length > 0) {
          processData({ hoseReels: af.hoseReels }, 'Hose Reels', 2);
        }
        
        // Fire Extinguishers
        if (af.portableFireExtinguishers && af.portableFireExtinguishers.length > 0) {
          processData({ portableFireExtinguishers: af.portableFireExtinguishers }, 'Fire Extinguishers', 2);
        }
        
        // Auto Suppression
        if (af.autoSuppressionSystem) {
          processData(af.autoSuppressionSystem, 'Auto Suppression System', 2);
        }
        
        // Fire Alarms and Detection
        if (af.fireAlarmsAndDetection) {
          processData(af.fireAlarmsAndDetection, 'Fire Alarms and Detection', 2);
        }
        
        // Gas Suppression
        if (af.gasSuppressionSystem) {
          processData(af.gasSuppressionSystem, 'Gas Suppression System', 2);
        }
        
        // HVAC Dampers
        if (af.hvacDampers) {
          processData(af.hvacDampers, 'HVAC Dampers', 2);
        }
      } else {
        addText('No active fire protection data available.', margin, fontSizes.normal, 'italic');
      }
      
      addDivider();
      
      // 4. Transformer Risk
      const transformerPage = pageCount;
      addHeading('4. Transformer Risk', 1);
      
      if (assessmentData?.transformerRisk) {
        if (assessmentData.transformerRisk.transformers && assessmentData.transformerRisk.transformers.length > 0) {
          processData({ transformers: assessmentData.transformerRisk.transformers }, 'Transformers', 2);
        }
        
        // Process any other fields in transformerRisk
        const { transformers, ...otherFields } = assessmentData.transformerRisk;
        if (Object.keys(otherFields).length > 0) {
          processData(otherFields, 'General Transformer Information', 2);
        }
      } else {
        addText('No transformer risk data available.', margin, fontSizes.normal, 'italic');
      }
      
      addDivider();
      
      // 5. Circuit Breaker Risk
      const breakerPage = pageCount;
      addHeading('5. Circuit Breaker Risk', 1);
      
      if (assessmentData?.circuitBreakerRisk) {
        if (assessmentData.circuitBreakerRisk.circuitBreakers && assessmentData.circuitBreakerRisk.circuitBreakers.length > 0) {
          processData({ circuitBreakers: assessmentData.circuitBreakerRisk.circuitBreakers }, 'Circuit Breakers', 2);
        }
        
        // Process any other fields
        const { circuitBreakers, circuitBreakerImages, ...otherFields } = assessmentData.circuitBreakerRisk;
        if (Object.keys(otherFields).length > 0) {
          processData(otherFields, 'General Circuit Breaker Information', 2);
        }
      } else {
        addText('No circuit breaker risk data available.', margin, fontSizes.normal, 'italic');
      }
      
      addDivider();
      
      // 6. Cable Risk
      const cablePage = pageCount;
      addHeading('6. Cable Risk', 1);
      
      if (assessmentData?.cableRisk) {
        if (assessmentData.cableRisk.cables && assessmentData.cableRisk.cables.length > 0) {
          processData({ cables: assessmentData.cableRisk.cables }, 'Cables', 2);
        }
        
        // Process comments and other fields
        const { cables, cableImages, ...otherFields } = assessmentData.cableRisk;
        if (Object.keys(otherFields).length > 0) {
          processData(otherFields, 'General Cable Information', 2);
        }
      } else {
        addText('No cable risk data available.', margin, fontSizes.normal, 'italic');
      }
      
      addDivider();
      
      // 7. Earthing and Lightning
      const earthingPage = pageCount;
      addHeading('7. Earthing and Lightning', 1);
      
      if (assessmentData?.earthingAndLightning) {
        processData(assessmentData.earthingAndLightning, '', 2);
      } else {
        addText('No earthing and lightning data available.', margin, fontSizes.normal, 'italic');
      }
      
      addDivider();
      
      // 8. Arc Protection
      const arcPage = pageCount;
      addHeading('8. Arc Protection', 1);
      
      if (assessmentData?.arcProtection) {
        processData(assessmentData.arcProtection, '', 2);
      } else {
        addText('No arc protection data available.', margin, fontSizes.normal, 'italic');
      }
      
      // Go back and add page numbers to TOC
      pdf.setPage(2); // Table of contents page
      
      pdf.setFontSize(fontSizes.normal);
      pdf.setTextColor(0, 0, 0);
      
      // Update TOC with page numbers
      pdf.text(setupPage.toString(), pageWidth - margin, sections[0].y);
      pdf.text(passivePage.toString(), pageWidth - margin, sections[1].y);
      pdf.text(activePage.toString(), pageWidth - margin, sections[2].y);
      pdf.text(transformerPage.toString(), pageWidth - margin, sections[3].y);
      pdf.text(breakerPage.toString(), pageWidth - margin, sections[4].y);
      pdf.text(cablePage.toString(), pageWidth - margin, sections[5].y);
      pdf.text(earthingPage.toString(), pageWidth - margin, sections[6].y);
      pdf.text(arcPage.toString(), pageWidth - margin, sections[7].y);
      
      // Add a footer on every page
      for (let i = 1; i <= pdf.getNumberOfPages(); i++) {
        pdf.setPage(i);
        pdf.setFontSize(fontSizes.small);
        pdf.setTextColor(128, 128, 128);
        
        // Footer
        pdf.text('Fire Risk Assessment Report', margin, pageHeight - 10);
        const date = new Date().toLocaleDateString();
        pdf.text(`Generated: ${date}`, pageWidth - margin, pageHeight - 10, { align: 'right' });
      }
      
      resolve(pdf.output('blob'));
    } catch (error) {
      console.error('Error generating PDF:', error);
      
      // If there's an error, create a simple error PDF
      pdf.deletePage(1);
      pdf.addPage();
      pdf.setTextColor(255, 0, 0);
      pdf.setFontSize(16);
      pdf.text('Error generating PDF report', margin, margin);
      pdf.setFontSize(12);
      pdf.setTextColor(0, 0, 0);
      pdf.text('Please try again or contact support.', margin, margin + 10);
      
      resolve(pdf.output('blob'));
    }
  });
};
