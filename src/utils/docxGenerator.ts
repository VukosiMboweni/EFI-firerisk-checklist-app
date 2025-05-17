import { 
  Document, 
  Paragraph, 
  HeadingLevel, 
  Table, 
  TableRow, 
  TableCell, 
  WidthType,
  AlignmentType,
  BorderStyle,
  Packer
} from 'docx';

/**
 * Generate a DOCX document from assessment data
 * 
 * @param assessmentData The full assessment data object
 * @param setupData The setup data for the assessment
 * @returns A promise that resolves to a Blob containing the DOCX document
 */
export const generateAssessmentDocx = async (
  assessmentData: any,
  setupData: any
): Promise<Blob> => {
  try {
    // We'll collect all sections and then create the document at the end
    const paragraphStyles = [
      {
        id: 'Heading1',
        name: 'Heading 1',
        basedOn: 'Normal',
        next: 'Normal',
        quickFormat: true,
        run: {
          size: 28,
          bold: true,
          color: '2E74B5'
        },
        paragraph: {
          spacing: {
            after: 120
          }
        }
      },
      {
        id: 'Heading2',
        name: 'Heading 2',
        basedOn: 'Normal',
        next: 'Normal',
        quickFormat: true,
        run: {
          size: 26,
          bold: true,
          color: '2E74B5'
        },
        paragraph: {
          spacing: {
            before: 240,
            after: 120
          }
        }
      },
      {
        id: 'Heading3',
        name: 'Heading 3',
        basedOn: 'Normal',
        next: 'Normal',
        quickFormat: true,
        run: {
          size: 24,
          bold: true,
          color: '2E74B5'
        },
        paragraph: {
          spacing: {
            before: 240,
            after: 120
          }
        }
      }
    ];

    // Create sections of the document
    const sections = [];

    // Add title
    sections.push(
      new Paragraph({
        text: 'Fire Risk Assessment Report',
        heading: HeadingLevel.HEADING_1,
        alignment: AlignmentType.CENTER
      })
    );

    // Add setup section
    sections.push(
      new Paragraph({
        text: '1. Assessment Setup',
        heading: HeadingLevel.HEADING_2
      })
    );

    // Add setup details in table format
    sections.push(createSetupTable(setupData));
    
    // Add assessment sections
    sections.push(
      new Paragraph({
        text: '2. Assessment Results',
        heading: HeadingLevel.HEADING_2
      })
    );

    // Add passive fire protection section if available
    if (assessmentData?.passiveFireProtection) {
      const passiveSection = createPassiveFireSection(assessmentData.passiveFireProtection);
      sections.push(...passiveSection);
    }

    // Add active fire protection section if available
    if (assessmentData?.activeFireProtection) {
      const activeSection = createActiveFireSection(assessmentData.activeFireProtection);
      sections.push(...activeSection);
    }

    // Add transformer risk section if available
    if (assessmentData?.transformers && assessmentData.transformers.length > 0) {
      const transformerSection = createTransformerSection(assessmentData.transformers);
      sections.push(...transformerSection);
    }

    // Add circuit breaker risk section if available
    if (assessmentData?.circuitBreakers && assessmentData.circuitBreakers.length > 0) {
      const circuitBreakerSection = createCircuitBreakerSection(assessmentData.circuitBreakers);
      sections.push(...circuitBreakerSection);
    }

    // Add cable risk section if available
    if (assessmentData?.cables && assessmentData.cables.length > 0) {
      const cableSection = createCableSection(assessmentData.cables);
      sections.push(...cableSection);
    }

    // Create a document with all our sections
    const finalDoc = new Document({
      sections: [{
        children: sections
      }],
      title: `Fire Risk Assessment - ${setupData?.substationName || 'Site'}`,
      description: 'Fire Risk Assessment Report',
      styles: {
        paragraphStyles
      }
    });

    // Generate the document as a blob
    return await Packer.toBlob(finalDoc);
  } catch (error) {
    console.error('Error generating DOCX:', error);
    throw error;
  }
};

// Create setup details table
const createSetupTable = (setupData: any) => {
  const rows = [];

  // Setup table headers
  rows.push(
    new TableRow({
      children: [
        new TableCell({
          children: [new Paragraph('Field')],
          width: {
            size: 30,
            type: WidthType.PERCENTAGE
          }
        }),
        new TableCell({
          children: [new Paragraph('Value')],
          width: {
            size: 70,
            type: WidthType.PERCENTAGE
          }
        })
      ]
    })
  );

  // Add EFI Representative
  rows.push(
    new TableRow({
      children: [
        new TableCell({
          children: [new Paragraph('EFI Representative')]
        }),
        new TableCell({
          children: [new Paragraph(setupData?.efiRepresentative || 'N/A')]
        })
      ]
    })
  );

  // Add Substation Name
  rows.push(
    new TableRow({
      children: [
        new TableCell({
          children: [new Paragraph('Substation Name')]
        }),
        new TableCell({
          children: [new Paragraph(setupData?.substationName || 'N/A')]
        })
      ]
    })
  );

  // Add Region
  rows.push(
    new TableRow({
      children: [
        new TableCell({
          children: [new Paragraph('Region')]
        }),
        new TableCell({
          children: [new Paragraph(setupData?.region || 'N/A')]
        })
      ]
    })
  );

  // Add CoT Representative if available
  if (setupData?.cotRepresentative) {
    rows.push(
      new TableRow({
        children: [
          new TableCell({
            children: [new Paragraph('CoT Representative')]
          }),
          new TableCell({
            children: [new Paragraph(setupData.cotRepresentative)]
          })
        ]
      })
    );
  }

  // Add Assessment Date
  rows.push(
    new TableRow({
      children: [
        new TableCell({
          children: [new Paragraph('Assessment Date')]
        }),
        new TableCell({
          children: [
            new Paragraph(
              setupData?.assessmentDate
                ? new Date(setupData.assessmentDate).toLocaleDateString()
                : 'N/A'
            )
          ]
        })
      ]
    })
  );

  // Create and return the table
  return new Table({
    rows,
    width: {
      size: 100,
      type: WidthType.PERCENTAGE
    },
    borders: {
      top: { style: BorderStyle.SINGLE, size: 1 },
      bottom: { style: BorderStyle.SINGLE, size: 1 },
      left: { style: BorderStyle.SINGLE, size: 1 },
      right: { style: BorderStyle.SINGLE, size: 1 },
      insideHorizontal: { style: BorderStyle.SINGLE, size: 1 },
      insideVertical: { style: BorderStyle.SINGLE, size: 1 }
    }
  });
};

// Helper function to format boolean values as Yes/No
const formatYesNo = (value: boolean | string | undefined): string => {
  if (typeof value === 'boolean') {
    return value ? 'Yes' : 'No';
  } else if (value === 'Yes' || value === 'No' || value === 'Unknown') {
    return value;
  }
  return 'Unknown';
};

// Create passive fire protection section
const createPassiveFireSection = (data: any) => {
  const sections = [];
  
  // Add section heading
  sections.push(
    new Paragraph({
      text: '2.1 Passive Fire Protection',
      heading: HeadingLevel.HEADING_3
    })
  );

  // Add structural integrity if available
  if (data.structuralIntegrity) {
    sections.push(
      new Paragraph({
        text: 'Structural Integrity',
        heading: HeadingLevel.HEADING_4
      })
    );

    const structuralIntegrityRows = [];
    
    // Add table headers
    structuralIntegrityRows.push(
      new TableRow({
        children: [
          new TableCell({
            children: [new Paragraph('Property')],
            width: {
              size: 40,
              type: WidthType.PERCENTAGE
            }
          }),
          new TableCell({
            children: [new Paragraph('Value')],
            width: {
              size: 60,
              type: WidthType.PERCENTAGE
            }
          })
        ]
      })
    );

    // Add structural integrity details
    const structIntegrity = data.structuralIntegrity;
    structuralIntegrityRows.push(
      createTableRow('Stability of Structural Elements', structIntegrity.stabilityOfStructuralElements || 'Not specified'),
      createTableRow('Integrity of Structural Elements', structIntegrity.integrityOfStructuralElements || 'Not specified'),
      createTableRow('Structural Deficiencies', structIntegrity.structuralDeficiencies || 'Not specified'),
      createTableRow('Building Type', structIntegrity.buildingType || 'Not specified'),
      createTableRow('Fire Rating (minutes)', structIntegrity.fireRatingMins?.toString() || 'Not specified'),
      createTableRow('Fire Stop Applied', formatYesNo(structIntegrity.fireStopApplied)),
      createTableRow('Fire Retardant Coating', formatYesNo(structIntegrity.fireRetardantCoating)),
      createTableRow('Dampers Applied', formatYesNo(structIntegrity.dampersApplied)),
      createTableRow('Dampers Linked', formatYesNo(structIntegrity.dampersLinked))
    );

    // Create and add the table
    sections.push(
      new Table({
        rows: structuralIntegrityRows,
        width: {
          size: 100,
          type: WidthType.PERCENTAGE
        },
        borders: {
          top: { style: BorderStyle.SINGLE, size: 1 },
          bottom: { style: BorderStyle.SINGLE, size: 1 },
          left: { style: BorderStyle.SINGLE, size: 1 },
          right: { style: BorderStyle.SINGLE, size: 1 },
          insideHorizontal: { style: BorderStyle.SINGLE, size: 1 },
          insideVertical: { style: BorderStyle.SINGLE, size: 1 }
        }
      })
    );
  }

  return sections;
};

// Create active fire protection section
const createActiveFireSection = (data: any) => {
  const sections = [];
  
  // Add section heading
  sections.push(
    new Paragraph({
      text: '2.2 Active Fire Protection',
      heading: HeadingLevel.HEADING_3
    })
  );

  // Add fire alarms and detection if available
  if (data?.fireAlarmsAndDetection) {
    sections.push(
      new Paragraph({
        text: 'Fire Alarms and Detection',
        heading: HeadingLevel.HEADING_4
      })
    );

    const alarmRows = [];
    
    // Add table headers
    alarmRows.push(
      new TableRow({
        children: [
          new TableCell({
            children: [new Paragraph('Property')],
            width: {
              size: 40,
              type: WidthType.PERCENTAGE
            }
          }),
          new TableCell({
            children: [new Paragraph('Value')],
            width: {
              size: 60,
              type: WidthType.PERCENTAGE
            }
          })
        ]
      })
    );

    // Add fire alarms and detection details
    const alarms = data.fireAlarmsAndDetection;
    alarmRows.push(
      createTableRow('P1 and L1 Throughout', formatYesNo(alarms.p1AndL1Throughout)),
      createTableRow('Floor Area < 500m²', formatYesNo(alarms.floorAreaLessThan500m2)),
      createTableRow('Smoke Detector Type', alarms.smokeDetectorType || 'Not specified'),
      createTableRow('Detector Spacing OK', formatYesNo(alarms.detectorSpacingOk)),
      createTableRow('SANS Certified Wiring', formatYesNo(alarms.wiringSansCertified)),
      createTableRow('Manual Call Points', formatYesNo(alarms.manualCallPoints)),
      createTableRow('Control Panel Status', alarms.controlPanelStatus || 'Not specified'),
      createTableRow('System Type', alarms.systemType || 'Not specified'),
      createTableRow('Has Faults', formatYesNo(alarms.hasFaults)),
      createTableRow('Control Panel Ready', formatYesNo(alarms.controlPanelReady)),
      createTableRow('Control Panel Silenced', formatYesNo(alarms.controlPanelSilenced)),
      createTableRow('Alarm Audible', formatYesNo(alarms.alarmAudible)),
      createTableRow('Comments', alarms.comments || 'No comments')
    );

    // Create and add the table
    sections.push(
      new Table({
        rows: alarmRows,
        width: {
          size: 100,
          type: WidthType.PERCENTAGE
        },
        borders: {
          top: { style: BorderStyle.SINGLE, size: 1 },
          bottom: { style: BorderStyle.SINGLE, size: 1 },
          left: { style: BorderStyle.SINGLE, size: 1 },
          right: { style: BorderStyle.SINGLE, size: 1 },
          insideHorizontal: { style: BorderStyle.SINGLE, size: 1 },
          insideVertical: { style: BorderStyle.SINGLE, size: 1 }
        }
      })
    );
  }

  return sections;
};

// Create transformer section
const createTransformerSection = (transformers: any[]) => {
  const sections = [];
  
  // Add section heading
  sections.push(
    new Paragraph({
      text: '2.3 Transformer Risk',
      heading: HeadingLevel.HEADING_3
    })
  );

  // Add information for each transformer
  transformers.forEach((transformer, index) => {
    sections.push(
      new Paragraph({
        text: `Transformer ${index + 1}`,
        heading: HeadingLevel.HEADING_4
      })
    );

    const transformerRows = [];
    
    // Add table headers
    transformerRows.push(
      new TableRow({
        children: [
          new TableCell({
            children: [new Paragraph('Property')],
            width: {
              size: 40,
              type: WidthType.PERCENTAGE
            }
          }),
          new TableCell({
            children: [new Paragraph('Value')],
            width: {
              size: 60,
              type: WidthType.PERCENTAGE
            }
          })
        ]
      })
    );

    // Add transformer details
    transformerRows.push(
      createTableRow('Serial Number', transformer.serialNumber || 'Not specified'),
      createTableRow('Age (years)', transformer.age?.toString() || 'Not specified'),
      createTableRow('Last Refurbishment Date', transformer.lastRefurbishmentDate || 'Not specified'),
      createTableRow('Fan Conditions', transformer.fanConditions || 'Not specified'),
      createTableRow('Oil Leaks', formatYesNo(transformer.hasOilLeaks)),
      createTableRow('Oil Leak Details', transformer.oilLeakDetails || 'None')
    );

    // Create and add the table
    sections.push(
      new Table({
        rows: transformerRows,
        width: {
          size: 100,
          type: WidthType.PERCENTAGE
        },
        borders: {
          top: { style: BorderStyle.SINGLE, size: 1 },
          bottom: { style: BorderStyle.SINGLE, size: 1 },
          left: { style: BorderStyle.SINGLE, size: 1 },
          right: { style: BorderStyle.SINGLE, size: 1 },
          insideHorizontal: { style: BorderStyle.SINGLE, size: 1 },
          insideVertical: { style: BorderStyle.SINGLE, size: 1 }
        }
      })
    );

    // Add a spacing paragraph
    sections.push(new Paragraph(''));
  });

  return sections;
};

// Create circuit breaker section
const createCircuitBreakerSection = (circuitBreakers: any[]) => {
  const sections = [];
  
  // Add section heading
  sections.push(
    new Paragraph({
      text: '2.4 Circuit Breaker Risk',
      heading: HeadingLevel.HEADING_3
    })
  );

  // Add information for each circuit breaker
  circuitBreakers.forEach((breaker, index) => {
    sections.push(
      new Paragraph({
        text: `Circuit Breaker ${index + 1}`,
        heading: HeadingLevel.HEADING_4
      })
    );

    const breakerRows = [];
    
    // Add table headers
    breakerRows.push(
      new TableRow({
        children: [
          new TableCell({
            children: [new Paragraph('Property')],
            width: {
              size: 40,
              type: WidthType.PERCENTAGE
            }
          }),
          new TableCell({
            children: [new Paragraph('Value')],
            width: {
              size: 60,
              type: WidthType.PERCENTAGE
            }
          })
        ]
      })
    );

    // Add circuit breaker details
    breakerRows.push(
      createTableRow('Serial Number', breaker.serialNumber || 'Not specified'),
      createTableRow('Type', breaker.type || 'Not specified'),
      createTableRow('Age (years)', breaker.age?.toString() || 'Not specified'),
      createTableRow('Last Maintenance Date', breaker.lastMaintenanceDate || 'Not specified'),
      createTableRow('Next Maintenance Date', breaker.nextMaintenanceDate || 'Not specified'),
      createTableRow('Condition', breaker.condition || 'Not specified'),
      createTableRow('Comments', breaker.comments || 'None')
    );

    // Create and add the table
    sections.push(
      new Table({
        rows: breakerRows,
        width: {
          size: 100,
          type: WidthType.PERCENTAGE
        },
        borders: {
          top: { style: BorderStyle.SINGLE, size: 1 },
          bottom: { style: BorderStyle.SINGLE, size: 1 },
          left: { style: BorderStyle.SINGLE, size: 1 },
          right: { style: BorderStyle.SINGLE, size: 1 },
          insideHorizontal: { style: BorderStyle.SINGLE, size: 1 },
          insideVertical: { style: BorderStyle.SINGLE, size: 1 }
        }
      })
    );

    // Add a spacing paragraph
    sections.push(new Paragraph(''));
  });

  return sections;
};

// Create cable section
const createCableSection = (cables: any[]) => {
  const sections = [];
  
  // Add section heading
  sections.push(
    new Paragraph({
      text: '2.5 Cable Risk',
      heading: HeadingLevel.HEADING_3
    })
  );

  // Add information for each cable
  cables.forEach((cable, index) => {
    sections.push(
      new Paragraph({
        text: `Cable ${index + 1}`,
        heading: HeadingLevel.HEADING_4
      })
    );

    const cableRows = [];
    
    // Add table headers
    cableRows.push(
      new TableRow({
        children: [
          new TableCell({
            children: [new Paragraph('Property')],
            width: {
              size: 40,
              type: WidthType.PERCENTAGE
            }
          }),
          new TableCell({
            children: [new Paragraph('Value')],
            width: {
              size: 60,
              type: WidthType.PERCENTAGE
            }
          })
        ]
      })
    );

    // Add cable details
    cableRows.push(
      createTableRow('Location', cable.location || 'Not specified'),
      createTableRow('Age (years)', cable.age?.toString() || 'Not specified'),
      createTableRow('Technology', cable.technology || 'Not specified'),
      createTableRow('Has Corrosion', formatYesNo(cable.hasCorrosion)),
      createTableRow('Corrosion Notes', cable.corrosionNotes || 'None'),
      createTableRow('Has Damage', formatYesNo(cable.hasDamage)),
      createTableRow('Damage Notes', cable.damageNotes || 'None')
    );

    // Create and add the table
    sections.push(
      new Table({
        rows: cableRows,
        width: {
          size: 100,
          type: WidthType.PERCENTAGE
        },
        borders: {
          top: { style: BorderStyle.SINGLE, size: 1 },
          bottom: { style: BorderStyle.SINGLE, size: 1 },
          left: { style: BorderStyle.SINGLE, size: 1 },
          right: { style: BorderStyle.SINGLE, size: 1 },
          insideHorizontal: { style: BorderStyle.SINGLE, size: 1 },
          insideVertical: { style: BorderStyle.SINGLE, size: 1 }
        }
      })
    );

    // Add a spacing paragraph
    sections.push(new Paragraph(''));
  });

  return sections;
};

// Helper to create a table row with property and value
const createTableRow = (property: string, value: string) => {
  return new TableRow({
    children: [
      new TableCell({
        children: [new Paragraph(property)]
      }),
      new TableCell({
        children: [new Paragraph(value)]
      })
    ]
  });
};
