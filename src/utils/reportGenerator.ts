import { AssessmentData, SetupData } from '../types';

export const generateSimpleHtmlReport = (assessmentData: AssessmentData, setupData: SetupData): string => {
  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-GB');
  };

  const formatYesNo = (value: boolean | undefined) => {
    return value ? 'Yes' : 'No';
  };

  const generateHtml = () => {
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Fire Risk Assessment Report - ${setupData.siteName}</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; margin: 40px; }
            h1 { color: #333; text-align: center; }
            h2 { color: #444; margin-top: 30px; }
            .section { margin: 20px 0; }
            .item { margin: 10px 0; }
            .label { font-weight: bold; }
            table { width: 100%; border-collapse: collapse; margin: 10px 0; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #f4f4f4; }
          </style>
        </head>
        <body>
          <h1>Fire Risk Assessment Report</h1>
          
          <div class="section">
            <h2>Site Information</h2>
            <div class="item"><span class="label">Site Name:</span> ${setupData.siteName}</div>
            <div class="item"><span class="label">Location:</span> ${setupData.siteLocation}</div>
            <div class="item"><span class="label">Assessment Date:</span> ${formatDate(setupData.assessmentDate)}</div>
            <div class="item"><span class="label">Assessor:</span> ${setupData.assessor}</div>
            <div class="item"><span class="label">Client:</span> ${setupData.clientName}</div>
            <div class="item"><span class="label">Assessment Type:</span> ${setupData.assessmentType}</div>
            <div class="item"><span class="label">Building Type:</span> ${setupData.buildingType}</div>
            <div class="item"><span class="label">Building Description:</span> ${setupData.buildingDescription}</div>
          </div>

          ${assessmentData.activeFireProtection ? `
            <div class="section">
              <h2>Active Fire Protection</h2>
              
              <h3>Portable Fire Extinguishers</h3>
              <table>
                <tr>
                  <th>Location</th>
                  <th>Type</th>
                  <th>Last Service</th>
                  <th>Next Service</th>
                  <th>Condition</th>
                  <th>Comments</th>
                </tr>
                ${assessmentData.activeFireProtection.portableFireExtinguishers.map(ext => `
                  <tr>
                    <td>${ext.location}</td>
                    <td>${ext.type}</td>
                    <td>${ext.lastService || 'N/A'}</td>
                    <td>${ext.nextService || 'N/A'}</td>
                    <td>${ext.condition}</td>
                    <td>${ext.comments || 'N/A'}</td>
                  </tr>
                `).join('')}
              </table>

              ${assessmentData.activeFireProtection.hasHydrants ? `
                <h3>Hydrants</h3>
                <table>
                  <tr>
                    <th>Location</th>
                    <th>Type</th>
                    <th>Last Service</th>
                    <th>Next Service</th>
                    <th>Condition</th>
                    <th>Comments</th>
                  </tr>
                  ${assessmentData.activeFireProtection.hydrants.map(hydrant => `
                    <tr>
                      <td>${hydrant.location}</td>
                      <td>${hydrant.type}</td>
                      <td>${hydrant.lastService || 'N/A'}</td>
                      <td>${hydrant.nextService || 'N/A'}</td>
                      <td>${hydrant.condition}</td>
                      <td>${hydrant.comments || 'N/A'}</td>
                    </tr>
                  `).join('')}
                </table>
              ` : ''}

              ${assessmentData.activeFireProtection.hasHoseReels ? `
                <h3>Hose Reels</h3>
                <table>
                  <tr>
                    <th>Location</th>
                    <th>Type</th>
                    <th>Last Service</th>
                    <th>Next Service</th>
                    <th>Condition</th>
                    <th>Comments</th>
                  </tr>
                  ${assessmentData.activeFireProtection.hoseReels.map(hoseReel => `
                    <tr>
                      <td>${hoseReel.location}</td>
                      <td>${hoseReel.type}</td>
                      <td>${hoseReel.lastService || 'N/A'}</td>
                      <td>${hoseReel.nextService || 'N/A'}</td>
                      <td>${hoseReel.condition}</td>
                      <td>${hoseReel.comments || 'N/A'}</td>
                    </tr>
                  `).join('')}
                </table>
              ` : ''}
            </div>
          ` : ''}

          ${assessmentData.passiveFireProtection ? `
            <div class="section">
              <h2>Passive Fire Protection</h2>
              
              <h3>Building Structure</h3>
              <div class="item">
                <span class="label">Fire Rating:</span> 
                ${assessmentData.passiveFireProtection.buildingStructure.fireRating || 'N/A'}
              </div>
              <div class="item">
                <span class="label">Condition:</span>
                ${assessmentData.passiveFireProtection.buildingStructure.condition || 'N/A'}
              </div>
              <div class="item">
                <span class="label">Comments:</span>
                ${assessmentData.passiveFireProtection.buildingStructure.comments || 'N/A'}
              </div>

              <h3>Fire Doors</h3>
              <table>
                <tr>
                  <th>Location</th>
                  <th>Type</th>
                  <th>Condition</th>
                </tr>
                ${assessmentData.passiveFireProtection.fireDoors.map(door => `
                  <tr>
                    <td>${door.location}</td>
                    <td>${door.type}</td>
                    <td>${door.condition}</td>
                  </tr>
                `).join('')}
              </table>

              <h3>Fire Walls</h3>
              <table>
                <tr>
                  <th>Location</th>
                  <th>Type</th>
                  <th>Condition</th>
                </tr>
                ${assessmentData.passiveFireProtection.fireWalls.map(wall => `
                  <tr>
                    <td>${wall.location}</td>
                    <td>${wall.type}</td>
                    <td>${wall.condition}</td>
                  </tr>
                `).join('')}
              </table>

              <h3>Fire Stops</h3>
              <table>
                <tr>
                  <th>Location</th>
                  <th>Type</th>
                  <th>Condition</th>
                </tr>
                ${assessmentData.passiveFireProtection.fireStops.map(stop => `
                  <tr>
                    <td>${stop.location}</td>
                    <td>${stop.type}</td>
                    <td>${stop.condition}</td>
                  </tr>
                `).join('')}
              </table>
            </div>
          ` : ''}
        </body>
      </html>
    `;
  };

  return generateHtml();
};
